import {
    ConversationConfig,
    OpenAiCompletionRequest,
} from "../api/openAi/OpenAiCompletionRequest";
import {
    LessonDay,
    LessonDayQuestion,
} from "../api/bsf/response/AllLessonsResponse";
import React, { useContext } from "react";

import AllScripturesResponse from "../api/bsf/response/AllScripturesResponse";
import AnswersResponse from "../api/bsf/response/AnswersResponse";
import { AuthContextHolder } from "../api/bsf/AuthContext";
import { SaveQuestionRequest } from "../api/bsf/requests/SaveQuestionRequest";
import Scripture from "./ScriptureComponent";
import SettingsContext from "../context/SettingsContext";
import StringUtils from "../utils/StringUtils";
import { TypeaheadTextarea } from "./TypeaheadTextarea";
import debounce from "lodash.debounce";

interface LessonDayProps {
    lessonDay: LessonDay | undefined;
    answersData: AnswersResponse | undefined;
    scripturesData: AllScripturesResponse | undefined;
}

const LessonAreaComponent: React.FC<LessonDayProps> = ({
    lessonDay,
    answersData,
    scripturesData,
}) => {
    const settings = useContext(SettingsContext);

    if (!lessonDay) {
        return <div>Loading Lesson Day Information...</div>;
    }

    const getAnswerForQuestion = (questionId: number): string | undefined => {
        const foundAnswer = answersData?.data.find(
            (answer) => answer.lessonDayQuestionId === questionId
        );
        return foundAnswer?.answerText;
    };

    const handleAnswerChange = debounce(
        (questionId: number, answerText: string) => {
            if (answersData) {
                const ans = answersData.data.find(
                    (answer) => answer.lessonDayQuestionId === questionId
                );
                if (ans) {
                    ans.answerText = answerText;
                }
            }
            const saveRequest = new SaveQuestionRequest(
                AuthContextHolder.getAuthContext(),
                questionId,
                answerText
            );
            saveRequest.makeRequest();
        },
        2000
    );

    const questionShouldBeVisible = (
        question: LessonDayQuestion
    ): boolean | undefined => {
        return question?.isAnswerRequired || isPassageDiscovery(question);
    };

    const isPassageDiscovery = (question: LessonDayQuestion): boolean => {
        return question?.lessonDayQuestionTranslations[0].questionText.startsWith(
            "Passage Discovery"
        );
    };

    // this will build the verses context for the question, starting with the Scripture for the day,
    // then adding any additional scriptures for the question
    const extractPlaintextScriptureDataForLesson = (
        lessonDay: LessonDay,
        scripturesData: AllScripturesResponse | undefined,
        suggestionsContext: LessonDayQuestion
    ): string[] => {
        const dailyScriptures = lessonDay?.lessonDayScriptures;
        const dailyScripturesData = dailyScriptures.map((ds) =>
            scripturesData?.data.find((s) => s.scriptureId === ds.scriptureId)
        );
        const questionScriptures =
            suggestionsContext.lessonDayQuestionScriptures;
        const questionScriptureData = questionScriptures.map((qs) =>
            scripturesData?.data.find((s) => s.scriptureId === qs.scriptureId)
        );
        const allScripturesData = dailyScripturesData.concat(
            questionScriptureData
        );
        const allScriptures = dailyScriptures.concat(questionScriptures);

        return allScripturesData.map((scripture, index) => {
            const htmlVersion = scripture?.htmlContent;
            // remove the first and last character (since they're just quotes) from the htmlVersion
            const strippedHtmlVersion = htmlVersion
                ?.slice(1, -1)
                .replaceAll('\\"', '"');
            const parser = new DOMParser();
            const doc = parser.parseFromString(
                strippedHtmlVersion || "",
                "text/html"
            );

            const spansWithDataCaller =
                doc.querySelectorAll("span[data-caller]");
            spansWithDataCaller.forEach((span) => {
                span.parentNode?.removeChild(span);
            });

            const spansWithDataNumber =
                doc.querySelectorAll("span[data-number]");
            spansWithDataNumber.forEach((span) => {
                const dataNumberValue = span.getAttribute("data-number");
                const textNode = doc.createTextNode(
                    " " + (dataNumberValue || "") + ": "
                );
                span.parentNode?.replaceChild(textNode, span);
            });

            const currentScriptureReferenceData = allScriptures[index];
            return (
                scripture?.longName +
                    " " +
                    currentScriptureReferenceData.scripture.chapterVerses +
                    " - " +
                    doc.body.textContent || ""
            );
        });
    };

    const buildConversationConfig = (
        scriptures: string[],
        questionText: string,
        existingAnswer: string
    ): ConversationConfig | null => {
        // if the user hasn't actually started a new sentence, we actually don't want to offer any suggestions yet
        // we can use a regex to see if it ends with a period and any number of other whitespace characters

        // TODO: look for other punctuation marks, like question marks, exclamation points, etc.

        const regex = new RegExp("\\.\\s*$");
        if (regex.test(existingAnswer)) {
            return null;
        }

        const [firstPart, secondPart]: string[] =
            StringUtils.splitOnLastIndexOf(existingAnswer, ". ");

        const completionPhrase =
            "The sentence I want completed starts with this:";

        let scripturesPrompt = "";
        if (scriptures.length > 0) {
            scripturesPrompt =
                "Here are the verses I've read: \n" +
                scriptures.join("\n") +
                "\n\n";
        }

        let userContent =
            scripturesPrompt +
            "I am answering the following question: \n" +
            questionText +
            "\n\n";

        let existingTextLength = firstPart.length;
        if (secondPart) {
            // if there's more than one sentence, we need to add all but the last one to the content
            userContent += "So far, I've written this: \n" + firstPart + "\n\n";
            userContent += completionPhrase + "\n" + secondPart;
            existingTextLength = secondPart.length;
        } else {
            userContent += completionPhrase + "\n" + firstPart;
        }

        const config: ConversationConfig = {
            messages: [
                {
                    role: "system",
                    content:
                        "These are the specifications by which you will tailor your responses: \n" +
                        "1) You are generating sentences to aid users with Bible studies by offering the completion of a sentence they've already typed. \n" +
                        "2) You will sometimes be provided with verses the user is referencing. \n" +
                        "3) You will expect the question they're answering, and the text they've written. \n" +
                        "4) You will provide a completed version of their sentence using context from the verses, question, and what was already written. \n" +
                        '5) You will respond with the full sentence to be completed. You will recognize it by the phrase "' +
                        completionPhrase +
                        '"\n' +
                        '6) You must not return a response which is just "' +
                        completionPhrase +
                        '" or anything similar to that.',
                },
                {
                    role: "user",
                    content: userContent,
                },
            ],
            max_tokens: existingTextLength + 25,
            n: 1,
            stop: ["\n", "."],
            model: "gpt-4-1106-preview",
        };

        return config;
    };

    const generateSuggestions = async (
        input: string,
        suggestionsContext: LessonDayQuestion
    ): Promise<Array<string>> => {
        if (settings.settings.typeaheadSuggestions === false) {
            // if typeahead suggestions are disabled, return an empty array
            return [];
        }
        if (settings.settings.typeaheadApiKey === "") {
            console.warn(
                "OpenAI API Key is not set, typeahead suggestions will not work"
            );
            return [];
        }

        console.log("generateSuggestions called with input: " + input);

        const plaintextScriptures = extractPlaintextScriptureDataForLesson(
            lessonDay,
            scripturesData,
            suggestionsContext
        );
        // find the actual question text being asked for the question
        const questionText =
            suggestionsContext.lessonDayQuestionTranslations[0].questionText;

        //let's build the conversation config:
        const conversationConfig = buildConversationConfig(
            plaintextScriptures,
            questionText,
            input
        );
        if (!conversationConfig) {
            return [];
        }

        console.log("*********************");
        console.log(
            "conversationConfig: " + JSON.stringify(conversationConfig)
        );
        const openAiRequest = new OpenAiCompletionRequest();
        const openAiResponse = await openAiRequest.makeRequest(
            conversationConfig,
            settings.settings.typeaheadApiKey
        );
        console.log("openAiResponse: " + JSON.stringify(openAiResponse));
        console.log("*********************");

        // iterate through the choices  and return the choice -> message -> content
        return openAiResponse.choices.map((choice) => {
            return choice.message.content;
        });
    };

    return (
        <div className="lesson-area">
            {/* Display Lesson Day Title */}
            <h2>{lessonDay.lessonDayTranslations[0].title}</h2>

            {/* Display Scriptures of the Day, but only if it has any */}
            {lessonDay.lessonDayScriptures.length > 0 && (
                <div className="scriptures">
                    <h3>Scriptures for the Day:</h3>
                    <ul>
                        {lessonDay.lessonDayScriptures.map(
                            (scriptureReference) => {
                                const matchingScripture =
                                    scripturesData?.data.find(
                                        (s) =>
                                            s.scriptureId ===
                                            scriptureReference.scriptureId
                                    );
                                return (
                                    <li key={scriptureReference.scriptureId}>
                                        {matchingScripture && (
                                            <Scripture
                                                scriptureData={
                                                    matchingScripture
                                                }
                                                verseReferences={
                                                    scriptureReference.scripture
                                                        .chapterVerses
                                                }
                                            />
                                        )}
                                    </li>
                                );
                            }
                        )}
                    </ul>
                </div>
            )}

            {/* Display Questions */}
            <div className="questions">
                {lessonDay.lessonDayQuestions.map((question) => (
                    <div
                        key={question.lessonDayQuestionId}
                        className="question"
                    >
                        <h4>
                            {question.questionNumber}
                            {question.questionSubNumber &&
                                `.${question.questionSubNumber}`}
                            :&nbsp;
                            {
                                question.lessonDayQuestionTranslations[0]
                                    .questionText
                            }
                        </h4>
                        {/* List scriptures for the question, if any */}
                        {question.lessonDayQuestionScriptures.length > 0 && (
                            <ul>
                                {question.lessonDayQuestionScriptures.map(
                                    (qScripture) => {
                                        const matchingScripture =
                                            scripturesData?.data.find(
                                                (s) =>
                                                    s.scriptureId ===
                                                    qScripture.scriptureId
                                            );
                                        return (
                                            <li key={qScripture.scriptureId}>
                                                {matchingScripture && (
                                                    <Scripture
                                                        scriptureData={
                                                            matchingScripture
                                                        }
                                                        verseReferences={
                                                            qScripture.scripture
                                                                .chapterVerses
                                                        }
                                                    />
                                                )}
                                            </li>
                                        );
                                    }
                                )}
                            </ul>
                        )}
                        {/* Provide Input area to answer the question */}
                        {questionShouldBeVisible(question) ? (
                            <TypeaheadTextarea
                                generateSuggestions={generateSuggestions}
                                suggestionsContext={question}
                                suggestionsDebounceTime={1500}
                                rows={4}
                                additionalClassNames={
                                    isPassageDiscovery(question)
                                        ? "passage-discovery-question"
                                        : "standard-question"
                                }
                                placeholder="Write your answer here..."
                                defaultValue={getAnswerForQuestion(
                                    question.lessonDayQuestionId
                                )}
                                onChange={(text) =>
                                    handleAnswerChange(
                                        question.lessonDayQuestionId,
                                        text
                                    )
                                }
                            />
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LessonAreaComponent;
