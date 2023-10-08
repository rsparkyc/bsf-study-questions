import './LeftNav.css';

import AllLessonsResponse, { Lesson, Study } from '../api/bsf/response/AllLessonsResponse';
import React, { useState } from 'react';

interface LeftNavProps {
    data: AllLessonsResponse | undefined;
    setCurrentStudyId: (id: number) => void;
    setCurrentLessonId: (id: number) => void;
    setCurrentLessonDayId: (id: number) => void;
    initialExpandedStudyId?: number;  // These might be undefined if not set in localStorage
    initialExpandedLessonId?: number;

}

const LeftNav: React.FC<LeftNavProps> = ({ data, setCurrentStudyId, setCurrentLessonId, setCurrentLessonDayId, initialExpandedStudyId, initialExpandedLessonId }) => {
    const [expandedStudyId, setExpandedStudyId] = useState<number | null>(initialExpandedStudyId || null);
    const [expandedLessonId, setExpandedLessonId] = useState<number | null>(initialExpandedLessonId || null);


    if (!data)  {
        return <div>Loading Study Information...</div>;
    }

    const toggleStudy = (studyId: number) => {
        setExpandedStudyId(prev => 
            prev === studyId ? null : studyId
        );
        localStorage.setItem('currentStudyId', studyId.toString());
        setCurrentStudyId(studyId);
    };

    const toggleLesson = (lessonId: number) => {
        setExpandedLessonId(prev => 
            prev === lessonId ? null : lessonId
        );
        localStorage.setItem('currentLessonId', lessonId.toString());
        setCurrentLessonId(lessonId);
    };

    const toggleLessonDay = (lessonDayId: number) => {
        localStorage.setItem('currentLessonDayId', lessonDayId.toString());
        setCurrentLessonDayId(lessonDayId);
    }

    return (
        <div className="left-nav">
            {[...data.data.studies].reverse().map((study: Study) => (
                <div key={study.studyId}>
                    <button 
                        className="href-button"
                        aria-expanded={expandedStudyId === study.studyId}
                        onClick={() => toggleStudy(study.studyId)}>
                        {study.displayName}
                    </button>
                    {expandedStudyId === study.studyId && study.lessons.map((lesson: Lesson) => (
                        <div key={lesson.lessonId} style={{ marginLeft: '20px' }}>
                            <button 
                                className="href-button"
                                aria-expanded={expandedLessonId === lesson.lessonId}
                                onClick={() => toggleLesson(lesson.lessonId)}>
                                {lesson.title}
                            </button>
                            {expandedLessonId === lesson.lessonId && lesson.lessonDays.map((day) => (
                                <div key={day.lessonDayId} style={{ marginLeft: '20px' }}>
                                    <button 
                                        className="href-button"
                                        onClick={() => toggleLessonDay(day.lessonDayId)}>
                                        Day {day.dayOfWeek}
                                    </button>
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
