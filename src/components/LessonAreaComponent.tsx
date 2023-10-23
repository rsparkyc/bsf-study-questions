import { LessonDay, LessonDayQuestion } from '../api/bsf/response/AllLessonsResponse';

import AllScripturesResponse from '../api/bsf/response/AllScripturesResponse';
import AnswersResponse from '../api/bsf/response/AnswersResponse';
import { AuthContextHolder } from '../api/bsf/AuthContext';
import React from 'react';
import { SaveQuestionRequest } from '../api/bsf/requests/SaveQuestionRequest';
import Scripture from './ScriptureComponent';
import { TypeaheadTextarea } from './TypeaheadTextarea';
import debounce from 'lodash.debounce';

interface LessonDayProps {
    lessonDay: LessonDay | undefined;
    answersData: AnswersResponse | undefined;
    scripturesData: AllScripturesResponse | undefined;
}


const LessonAreaComponent: React.FC<LessonDayProps> = ({ lessonDay, answersData, scripturesData }) => {
    if (!lessonDay) {
        return <div>Loading Lesson Day Information...</div>;
    }

    const getAnswerForQuestion = (questionId: number): string | undefined => {
        const foundAnswer = answersData?.data.find(answer => answer.lessonDayQuestionId === questionId);
        return foundAnswer?.answerText;
    };

    const handleAnswerChange = debounce((questionId: number, answerText: string) => {
        if (answersData) {
            const ans = answersData.data.find(answer => answer.lessonDayQuestionId === questionId);
            if (ans) {
                ans.answerText = answerText;
            }
        }
        const saveRequest = new SaveQuestionRequest(AuthContextHolder.getAuthContext(), questionId, answerText);
        saveRequest.makeRequest();
    }, 2000); 

    const questionShouldBeVisible = (question: LessonDayQuestion): boolean | undefined => {
        return question?.isAnswerRequired || isPassageDiscovery(question);
    }

    const isPassageDiscovery = (question: LessonDayQuestion): boolean => {
        return question?.lessonDayQuestionTranslations[0].questionText.startsWith("Passage Discovery");
    }

  const generateSuggestions = async (input: string) => {
    // Mock API call, replace with your actual API call logic
    const mockData = [
      "apple pie is delicious",
      "banana bread is my favorite",
      "cherry blossoms are beautiful",
      "dates are sweet",
      "elderberry syrup is beneficial"
    ];
    return mockData.filter(item => item.includes(input));
  };


    return (
        <div className="lesson-area">
            {/* Display Lesson Day Title */}
            <h2>{lessonDay.lessonDayTranslations[0].title}</h2>
            
           <div className="scriptures">
                <h3>Scriptures for the Day:</h3>
                <ul>
                    {lessonDay.lessonDayScriptures.map(scriptureReference => {
                        const matchingScripture = scripturesData?.data.find(s => s.scriptureId === scriptureReference.scriptureId);
                        return (
                            <li key={scriptureReference.scriptureId}>
                                {matchingScripture && 
                                    <Scripture 
                                        scriptureData={matchingScripture} 
                                        verseReferences={scriptureReference.scripture.chapterVerses}
                                    />
                                }
                            </li>
                        );
                    })}
                </ul>
            </div>
 
            {/* Display Questions */}
            <div className="questions">
                {lessonDay.lessonDayQuestions.map(question => (
                    <div key={question.lessonDayQuestionId} className="question">
                        <h4>
                            {question.questionNumber}
                            {question.questionSubNumber && `.${question.questionSubNumber}`}:&nbsp;
                            {question.lessonDayQuestionTranslations[0].questionText}
                        </h4>
                        {/* List scriptures for the question, if any */}
                        {question.lessonDayQuestionScriptures.length > 0 && (
                            <ul>
                            {question.lessonDayQuestionScriptures.map(qScripture => {
                                const matchingScripture = scripturesData?.data.find(s => s.scriptureId === qScripture.scriptureId);
                                return (
                                    <li key={qScripture.scriptureId}>
                                        {matchingScripture && <Scripture 
                                            scriptureData={matchingScripture} 
                                            verseReferences={qScripture.scripture.chapterVerses} 
                                        />}
                                    </li>
                                );
                            })}

                            </ul>
                        )}
                        {/* Provide Input area to answer the question */}
                        { questionShouldBeVisible(question) ? 
                        <TypeaheadTextarea 
                            generateSuggestions={generateSuggestions} 
                            suggestionsDebounceTime={250}
                            rows={4} 
                            additionalClassNames={isPassageDiscovery(question) ? "passage-discovery-question" : "standard-question"}
                            placeholder='Write your answer here...'
                            defaultValue = {getAnswerForQuestion(question.lessonDayQuestionId)}
                            onChange={(text) => handleAnswerChange(question.lessonDayQuestionId, text)}
                        /> : null 
                        }

                    </div>
                ))}
            </div>
        </div>
    );
}

export default LessonAreaComponent;
