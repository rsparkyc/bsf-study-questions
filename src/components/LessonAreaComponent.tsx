import AnswersResponse from '../api/bsf/response/AnswersResponse';
import { AuthContextHolder } from '../api/bsf/AuthContext';
import { LessonDay } from '../api/bsf/response/AllLessonsResponse';
import React from 'react';
import { SaveQuestionRequest } from '../api/bsf/requests/SaveQuestionRequest';
import debounce from 'lodash.debounce';

interface LessonDayProps {
    lessonDay: LessonDay| undefined;
    answersData: AnswersResponse | undefined;
}

const LessonAreaComponent: React.FC<LessonDayProps> = ({ lessonDay, answersData }) => {
    if (!lessonDay) {
        return <div>Loading Lesson Day Information...</div>;
    }

    const getAnswerForQuestion = (questionId: number): string | undefined => {
        const foundAnswer = answersData?.data.find(answer => answer.lessonDayQuestionId === questionId);
        return foundAnswer?.answerText;
    };

    const handleAnswerChange = debounce((questionId: number, answerText: string) => {
        const saveRequest = new SaveQuestionRequest(AuthContextHolder.getAuthContext(), questionId, answerText);
        saveRequest.makeRequest();
    }, 2000); 

    return (
        <div className="lesson-area">
            {/* Display Lesson Day Title */}
            <h2>{lessonDay.lessonDayTranslations[0].title}</h2>
            
            {/* Display Scripture References */}
            <div className="scriptures">
                <h3>Scriptures for the Day:</h3>
                <ul>
                    {lessonDay.lessonDayScriptures.map(scripture => (
                        <li key={scripture.scriptureId}>
                            {scripture.scripture.chapterVerses}
                        </li>
                    ))}
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
                                {question.lessonDayQuestionScriptures.map(qScripture => (
                                    <li key={qScripture.scriptureId}>
                                        {qScripture.scripture.chapterVerses}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {/* Provide Input area to answer the question */}
                        { question.isAnswerRequired ? 
                            <textarea 
                                placeholder="Write your answer here..." 
                                rows={4}
                                defaultValue={getAnswerForQuestion(question.lessonDayQuestionId)}
                                onChange={(e) => handleAnswerChange(question.lessonDayQuestionId, e.target.value)}
                            />
                            : null 
                        }

                    </div>
                ))}
            </div>
        </div>
    );
}

export default LessonAreaComponent;
