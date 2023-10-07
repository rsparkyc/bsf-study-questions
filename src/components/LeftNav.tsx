import './LeftNav.css';

import AllLessonsResponse, { Lesson, Study } from '../api/bsf/response/AllLessonsResponse';
import React, { useState } from 'react';

interface LeftNavProps {
    data: AllLessonsResponse | undefined;
    setCurrentStudyId: (id: number) => void;
    setCurrentLessonId: (id: number) => void;
    setCurrentLessonDayId: (id: number) => void;
}

const LeftNav: React.FC<LeftNavProps> = ({ data, setCurrentStudyId, setCurrentLessonId, setCurrentLessonDayId }) => {
    const [expandedStudyId, setExpandedStudyId] = useState<number | null>(null);
    const [expandedLessonId, setExpandedLessonId] = useState<number | null>(null);

    if (!data)  {
        return <div>Loading Study Information...</div>;
    }

    const toggleStudy = (studyId: number) => {
        setExpandedStudyId(prev => 
            prev === studyId ? null : studyId
        );
        setCurrentStudyId(studyId);
    };

    const toggleLesson = (lessonId: number) => {
        setExpandedLessonId(prev => 
            prev === lessonId ? null : lessonId
        );
        setCurrentLessonId(lessonId);
    };

    return (
        <div className="left-nav">
            {data.data.studies.map((study: Study) => (
                <div key={study.studyId}>
                    <a href="#" onClick={(e) => { e.preventDefault(); toggleStudy(study.studyId); }}>{study.displayName}</a>
                    {expandedStudyId === study.studyId && study.lessons.map((lesson: Lesson) => (
                        <div key={lesson.lessonId} style={{ marginLeft: '20px' }}>
                            <a href="#" onClick={(e) => { e.preventDefault(); toggleLesson(lesson.lessonId); }}>{lesson.title}</a>
                            {expandedLessonId === lesson.lessonId && lesson.lessonDays.map((day) => (
                                <div key={day.lessonDayId} style={{ marginLeft: '20px' }}>
                                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentLessonDayId(day.lessonDayId); }}>Day {day.dayOfWeek}</a>
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
