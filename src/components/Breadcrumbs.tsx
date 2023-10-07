import AllLessonsResponse from '../api/bsf/response/AllLessonsResponse';
import React from 'react';
import exp from 'constants';

interface BreadcrumbsProps {
    studyId?: number;
    lessonId?: number;
    lessonDayId?: number;
    data: AllLessonsResponse | undefined;
    setData: {
        setCurrentStudyId: (id: number | undefined) => void;
        setCurrentLessonId: (id: number | undefined) => void;
        setCurrentLessonDayId: (id: number | undefined) => void;
    };
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ studyId, lessonId, lessonDayId, data, setData }) => {
    if (!data)  {
        return <div>Loading Study Information...</div>;
    }

    const study = data.data.studies.find(study => study.studyId === studyId);
    const lesson = study?.lessons.find(lesson => lesson.lessonId === lessonId);
    const lessonDay = lesson?.lessonDays.find(day => day.lessonDayId === lessonDayId);

    return (
        <div>
            <a href="#" onClick={(e) => { e.preventDefault(); setData.setCurrentStudyId(undefined); setData.setCurrentLessonId(undefined); setData.setCurrentLessonDayId(undefined); }}>Studies</a> &gt; 
            {study && <a href="#" onClick={(e) => { e.preventDefault(); setData.setCurrentLessonId(undefined); setData.setCurrentLessonDayId(undefined); }}>{study.displayName}</a>} &gt;
            {lesson && <a href="#" onClick={(e) => { e.preventDefault(); setData.setCurrentLessonDayId(undefined); }}>{lesson.title}</a>} &gt;
            {lessonDay && <a href="#">Day {lessonDay.dayOfWeek}</a>}

        </div>
    );
}

export default Breadcrumbs;