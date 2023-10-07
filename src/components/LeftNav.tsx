import AllLessonsResponse, { Lesson, Study } from '../api/bsf/response/AllLessonsResponse';

import React from 'react';

interface LeftNavProps {
    data: AllLessonsResponse | undefined;
    setCurrentStudyId: (id: number) => void;
    setCurrentLessonId: (id: number) => void;
    setCurrentLessonDayId: (id: number) => void;
}

const LeftNav: React.FC<LeftNavProps> = ({ data, setCurrentStudyId, setCurrentLessonId, setCurrentLessonDayId }) => {
    if (!data)  {
        return <div>Loading Study Information...</div>;
    }
    return (
        <div className="left-nav">
            {data.data.studies.map((study: Study) => (
                <div key={study.studyId}>
                    <a href="#" onClick={() => setCurrentStudyId(study.studyId)}>{study.displayName}</a>
                    {study.lessons.map((lesson: Lesson) => (
                        <div key={lesson.lessonId}>
                            <a href="#" onClick={() => setCurrentLessonId(lesson.lessonId)}>{lesson.title}</a>
                            {lesson.lessonDays.map((day) => (
                                <div key={day.lessonDayId}>
                                    <a href="#" onClick={() => setCurrentLessonDayId(day.lessonDayId)}>Day {day.dayOfWeek}</a>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default LeftNav;
