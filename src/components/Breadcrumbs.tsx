import React, { useContext } from "react";

import AllLessonsResponse from "../api/bsf/response/AllLessonsResponse";
import SettingsContext from "../context/SettingsContext";

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

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
    studyId,
    lessonId,
    lessonDayId,
    data,
    setData,
}) => {
    const settings = useContext(SettingsContext);

    if (!data) {
        return <div></div>;
    }

    const study = data.data.studies.find((study) => study.studyId === studyId);
    const lesson = study?.lessons.find(
        (lesson) => lesson.lessonId === lessonId
    );
    const lessonDay = lesson?.lessonDays.find(
        (day) => day.lessonDayId === lessonDayId
    );

    return (
        <div className="breadcrumbs">
            <button
                className="href-button"
                onClick={() => {
                    setData.setCurrentStudyId(undefined);
                    setData.setCurrentLessonId(undefined);
                    setData.setCurrentLessonDayId(undefined);
                }}
            >
                Studies
            </button>
            <span className="breadcrumb-separator">›</span>
            {study && (
                <>
                    <button
                        className="href-button"
                        onClick={() => {
                            setData.setCurrentLessonId(undefined);
                            setData.setCurrentLessonDayId(undefined);
                        }}
                    >
                        {study.displayName}
                    </button>
                    <span className="breadcrumb-separator">›</span>
                </>
            )}
            {lesson && (
                <>
                    <button
                        className="href-button"
                        onClick={() => {
                            setData.setCurrentLessonDayId(undefined);
                        }}
                    >
                        {lesson.title || lesson.lessonTranslations[0].scripture}
                    </button>
                    {!settings.settings.fullLessonMode && (
                        <span className="breadcrumb-separator">›</span>
                    )}
                </>
            )}
            {lessonDay && !settings.settings.fullLessonMode && (
                <button className="href-button">
                    Day {lessonDay.dayOfWeek}
                </button>
            )}
        </div>
    );
};

export default Breadcrumbs;
