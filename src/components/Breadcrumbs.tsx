import AllLessonsResponse from '../api/bsf/response/AllLessonsResponse';
import React from 'react';

interface BreadcrumbsProps {
    studyId?: number;
    lessonId?: number;
    lessonDayId?: number;
    data: AllLessonsResponse | undefined;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ studyId, lessonId, lessonDayId, data }) => {
    if (!data)  {
        return <div>Loading Study Information...</div>;
    }

    const study = data.data.studies.find(study => study.studyId === studyId);
    const lesson = study?.lessons.find(lesson => lesson.lessonId === lessonId);
    const lessonDay = lesson?.lessonDays.find(day => day.lessonDayId === lessonDayId);

    return (
        <div>
            <a href="#">Studies</a> &gt; 
            {study && <a href="#">{study.displayName}</a>} &gt;
            {lesson && <a href="#">{lesson.title}</a>} &gt;
            {lessonDay && <a href="#">Day {lessonDay.dayOfWeek}</a>}
        </div>
    );
}

export default Breadcrumbs;
