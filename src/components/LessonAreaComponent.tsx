import AnswersResponse from '../api/bsf/response/AnswersResponse';
import { LessonDay } from '../api/bsf/response/AllLessonsResponse';
import React from 'react';

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
                        <textarea 
                            placeholder="Write your answer here..." 
                            rows={4}
                            defaultValue={getAnswerForQuestion(question.lessonDayQuestionId)}
                        />

                    </div>
                ))}
            </div>
        </div>
    );
}

export default LessonAreaComponent;
