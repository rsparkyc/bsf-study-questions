import './LeftNav.css';

import AllLessonsResponse, { Lesson, Study } from '../api/bsf/response/AllLessonsResponse';
import React, { useContext, useEffect, useState } from 'react';

import SettingsContext from '../context/SettingsContext';

interface LeftNavProps {
    data: AllLessonsResponse | undefined;
    setCurrentStudyId: (id: number) => void;
    setCurrentLessonId: (id: number) => void;
    setCurrentLessonDayId: (id: number) => void;
    initialExpandedStudyId?: number;  // These might be undefined if not set in localStorage
    initialExpandedLessonId?: number;
    initialSelectedLessonDayId?: number;
}

const LeftNav: React.FC<LeftNavProps> = ({ 
    data,
    setCurrentStudyId,
    setCurrentLessonId,
    setCurrentLessonDayId,
    initialExpandedStudyId,
    initialExpandedLessonId,
    initialSelectedLessonDayId }) => {

    const [expandedStudyId, setExpandedStudyId] = useState<number | null>(initialExpandedStudyId || null);
    const [expandedLessonId, setExpandedLessonId] = useState<number | null>(initialExpandedLessonId || null);
    const [selectedLessonDayId, setSelectedLessonDayId] = useState<number | null>(initialSelectedLessonDayId || null);

    const settings = useContext(SettingsContext);

    useEffect(() => {
        console.log('Settings have changed!');
    }, [settings]);
    
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
        setSelectedLessonDayId(prev =>
            prev === lessonDayId ? null : lessonDayId
        );
        localStorage.setItem('currentLessonDayId', lessonDayId.toString());
        setCurrentLessonDayId(lessonDayId);
    }

    return (
        <div className="left-nav">
            {[...data.data.studies].reverse().map((study: Study) => (
                <div key={study.studyId} className={'study-nav expandable-nav' + (expandedStudyId === study.studyId ? ' selected-nav' : '')}>
                    <button 
                        className="href-button"
                        aria-expanded={expandedStudyId === study.studyId}
                        onClick={() => toggleStudy(study.studyId)}>
                        {study.displayName}
                    </button>
                    {expandedStudyId === study.studyId && study.lessons.map((lesson: Lesson) => (
                        <div key={lesson.lessonId} className={'lesson-nav expandable-nav' + (expandedLessonId === lesson.lessonId ? ' selected-nav' : '')}>
                            <button 
                                className="href-button"
                                aria-expanded={expandedLessonId === lesson.lessonId}
                                onClick={() => toggleLesson(lesson.lessonId)}>
                                {lesson.title}
                            </button>
                            {expandedLessonId === lesson.lessonId && lesson.lessonDays.map((day) => (
                                <div key={day.lessonDayId} className={'day-nav' + (selectedLessonDayId === day.lessonDayId ? ' selected-nav' : '') }>
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
