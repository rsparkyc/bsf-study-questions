import "./ModernLeftNav.css";

import AllLessonsResponse, {
    Lesson,
} from "../api/bsf/response/AllLessonsResponse";
import React, { useContext, useMemo, useState } from "react";

import SettingsContext from "../context/SettingsContext";

interface ModernLeftNavProps {
    data: AllLessonsResponse | undefined;
    setCurrentStudyId: (id: number) => void;
    setCurrentLessonId: (id: number) => void;
    setCurrentLessonDayId: (id: number) => void;
    currentStudyId?: number;
    currentLessonId?: number;
    currentLessonDayId?: number;
}

interface WeekData {
    weekNumber: number;
    lessons: Lesson[];
    startLesson: number;
    endLesson: number;
}

const ModernLeftNav: React.FC<ModernLeftNavProps> = ({
    data,
    setCurrentStudyId,
    setCurrentLessonId,
    setCurrentLessonDayId,
    currentStudyId,
    currentLessonId,
    currentLessonDayId,
}) => {
    const [showAllStudies, setShowAllStudies] = useState(false);
    const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

    const settings = useContext(SettingsContext);

    // Helper function to group lessons into weeks (week = lesson)
    const groupLessonsIntoWeeks = (lessons: Lesson[]): WeekData[] => {
        const weeks: WeekData[] = [];
        for (let i = 0; i < lessons.length; i++) {
            const lesson = lessons[i];
            if (!lesson) continue;
            weeks.push({
                weekNumber: lesson.lessonNumber,
                lessons: [lesson],
                startLesson: lesson.lessonNumber,
                endLesson: lesson.lessonNumber,
            });
        }
        return weeks;
    };

    // Get current study and determine which studies to show
    const { currentStudy, otherStudies, currentWeek, currentWeekData } =
        useMemo(() => {
            if (!data) {
                return {
                    currentStudy: null,
                    otherStudies: [],
                    currentWeek: null,
                    currentWeekData: null,
                };
            }

            const studies = [...data.data.studies].reverse(); // Most recent first
            const current =
                studies.find((study) => study.studyId === currentStudyId) ||
                studies[0];
            const others = showAllStudies
                ? studies.filter((s) => s.studyId !== current.studyId)
                : [];

            // Find current week based on current lesson
            let currentWeek = null;
            let currentWeekData = null;
            if (current && currentLessonId) {
                const weeks = groupLessonsIntoWeeks(current.lessons);
                currentWeekData = weeks.find((week) =>
                    week.lessons.some(
                        (lesson) => lesson.lessonId === currentLessonId
                    )
                );
                currentWeek = currentWeekData?.weekNumber || null;
            }

            return {
                currentStudy: current,
                otherStudies: others,
                currentWeek,
                currentWeekData,
            };
        }, [data, currentStudyId, currentLessonId, showAllStudies]);

    if (!data) {
        return (
            <div className="modern-nav">
                <div className="nav-loading">
                    <div className="loading-spinner"></div>
                    <span>Loading Study Information...</span>
                </div>
            </div>
        );
    }

    const handleStudySelect = (studyId: number) => {
        setCurrentStudyId(studyId);
        setCurrentLessonId(undefined as any);
        setCurrentLessonDayId(undefined as any);
        setExpandedWeek(null);
        localStorage.setItem("currentStudyId", studyId.toString());
        localStorage.removeItem("currentLessonId");
        localStorage.removeItem("currentLessonDayId");
    };

    const handleLessonSelect = (lessonId: number) => {
        setCurrentLessonId(lessonId);
        localStorage.setItem("currentLessonId", lessonId.toString());
        // Auto-select first day if in full lesson mode
        if (settings.settings.fullLessonMode) {
            const lesson = currentStudy?.lessons.find(
                (l) => l.lessonId === lessonId
            );
            if (lesson) {
                const firstDay = [...lesson.lessonDays].sort(
                    (a, b) => a.dayOfWeek - b.dayOfWeek
                )[0];
                setCurrentLessonDayId(firstDay.lessonDayId);
                localStorage.setItem(
                    "currentLessonDayId",
                    firstDay.lessonDayId.toString()
                );
            }
        } else {
            setCurrentLessonDayId(undefined as any);
            localStorage.removeItem("currentLessonDayId");
        }
    };

    const handleDaySelect = (lessonDayId: number) => {
        setCurrentLessonDayId(lessonDayId);
        localStorage.setItem("currentLessonDayId", lessonDayId.toString());
    };

    const toggleWeek = (weekNumber: number) => {
        setExpandedWeek(expandedWeek === weekNumber ? null : weekNumber);
    };

    return (
        <div className="modern-nav">
            {/* Breadcrumb Navigation */}
            <div className="nav-breadcrumbs">
                <button
                    className="breadcrumb-btn"
                    onClick={() => {
                        setCurrentStudyId(undefined as any);
                        setCurrentLessonId(undefined as any);
                        setCurrentLessonDayId(undefined as any);
                        localStorage.removeItem("currentStudyId");
                        localStorage.removeItem("currentLessonId");
                        localStorage.removeItem("currentLessonDayId");
                    }}
                >
                    Studies
                </button>
                {currentStudy && (
                    <>
                        <span className="breadcrumb-separator">›</span>
                        <button
                            className="breadcrumb-btn"
                            onClick={() => {
                                setCurrentLessonId(undefined as any);
                                setCurrentLessonDayId(undefined as any);
                                localStorage.removeItem("currentLessonId");
                                localStorage.removeItem("currentLessonDayId");
                            }}
                        >
                            {currentStudy.displayName}
                        </button>
                    </>
                )}
                {currentLessonId && currentStudy && (
                    <>
                        <span className="breadcrumb-separator">›</span>
                        <button
                            className="breadcrumb-btn"
                            onClick={() => {
                                setCurrentLessonDayId(undefined as any);
                                localStorage.removeItem("currentLessonDayId");
                            }}
                        >
                            {currentStudy.lessons.find(
                                (l) => l.lessonId === currentLessonId
                            )?.title ||
                                currentStudy.lessons.find(
                                    (l) => l.lessonId === currentLessonId
                                )?.lessonTranslations[0]?.scripture}
                        </button>
                    </>
                )}
                {currentLessonDayId &&
                    currentLessonId &&
                    currentStudy &&
                    !settings.settings.fullLessonMode && (
                        <>
                            <span className="breadcrumb-separator">›</span>
                            <span className="breadcrumb-current">
                                Day{" "}
                                {
                                    currentStudy.lessons
                                        .find(
                                            (l) =>
                                                l.lessonId === currentLessonId
                                        )
                                        ?.lessonDays.find(
                                            (d) =>
                                                d.lessonDayId ===
                                                currentLessonDayId
                                        )?.dayOfWeek
                                }
                            </span>
                        </>
                    )}
            </div>

            {/* Current Study Header */}
            {currentStudy && (
                <div className="current-study-header">
                    <div className="study-info">
                        <h2 className="study-title">
                            {currentStudy.displayName}
                        </h2>
                        <p className="study-meta">
                            {currentStudy.numberLessons} lessons •{" "}
                            {currentStudy.releaseYear}
                        </p>
                    </div>
                    <button
                        className="study-toggle-btn"
                        onClick={() => setShowAllStudies(!showAllStudies)}
                        title={
                            showAllStudies
                                ? "Hide other studies"
                                : "Show all studies"
                        }
                    >
                        {showAllStudies ? "−" : "+"}
                    </button>
                </div>
            )}

            {/* Current Lesson Quick Access */}
            {currentWeekData && (
                <div className="current-week-section">
                    <h3 className="section-title">
                        Current Lesson {currentWeek}
                    </h3>
                    <div className="week-lessons">
                        {currentWeekData.lessons.map((lesson) => (
                            <div
                                key={lesson.lessonId}
                                className={`lesson-card ${
                                    lesson.lessonId === currentLessonId
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    handleLessonSelect(lesson.lessonId)
                                }
                            >
                                <div className="lesson-number">
                                    Lesson {lesson.lessonNumber}
                                </div>
                                <div className="lesson-title">
                                    {lesson.title ||
                                        lesson.lessonTranslations[0]?.scripture}
                                </div>
                                {lesson.lessonId === currentLessonId &&
                                    !settings.settings.fullLessonMode && (
                                        <div className="lesson-days">
                                            {[...lesson.lessonDays]
                                                .sort(
                                                    (a, b) =>
                                                        a.dayOfWeek -
                                                        b.dayOfWeek
                                                )
                                                .map((day) => (
                                                    <button
                                                        key={day.lessonDayId}
                                                        className={`day-btn ${
                                                            day.lessonDayId ===
                                                            currentLessonDayId
                                                                ? "active"
                                                                : ""
                                                        }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCurrentLessonId(
                                                                lesson.lessonId
                                                            );
                                                            localStorage.setItem(
                                                                "currentLessonId",
                                                                lesson.lessonId.toString()
                                                            );
                                                            handleDaySelect(
                                                                day.lessonDayId
                                                            );
                                                        }}
                                                    >
                                                        Day {day.dayOfWeek}
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Lessons Navigation */}
            {currentStudy && (
                <div className="all-weeks-section">
                    <h3 className="section-title">All Lessons</h3>
                    <div className="weeks-grid">
                        {groupLessonsIntoWeeks(currentStudy.lessons).map(
                            (week) => (
                                <div
                                    key={week.weekNumber}
                                    className="week-card"
                                >
                                    <button
                                        className="week-header"
                                        onClick={() =>
                                            toggleWeek(week.weekNumber)
                                        }
                                    >
                                        <span className="week-title">
                                            Lesson {week.weekNumber}
                                        </span>
                                        <span className="week-range">
                                            {week.lessons[0]?.title ||
                                                week.lessons[0]
                                                    ?.lessonTranslations[0]
                                                    ?.scripture}
                                        </span>
                                        <span className="expand-icon">
                                            {expandedWeek === week.weekNumber
                                                ? "−"
                                                : "+"}
                                        </span>
                                    </button>

                                    {expandedWeek === week.weekNumber && (
                                        <div className="week-lessons-detail">
                                            {(() => {
                                                const lesson = week.lessons[0];
                                                return (
                                                    !settings.settings
                                                        .fullLessonMode && (
                                                        <div
                                                            className="lesson-days"
                                                            style={{
                                                                marginTop: 8,
                                                            }}
                                                        >
                                                            {[
                                                                ...lesson.lessonDays,
                                                            ]
                                                                .sort(
                                                                    (a, b) =>
                                                                        a.dayOfWeek -
                                                                        b.dayOfWeek
                                                                )
                                                                .map((day) => (
                                                                    <button
                                                                        key={
                                                                            day.lessonDayId
                                                                        }
                                                                        className={`day-btn ${
                                                                            day.lessonDayId ===
                                                                            currentLessonDayId
                                                                                ? "active"
                                                                                : ""
                                                                        }`}
                                                                        onClick={(
                                                                            e
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            setCurrentLessonId(
                                                                                lesson.lessonId
                                                                            );
                                                                            localStorage.setItem(
                                                                                "currentLessonId",
                                                                                lesson.lessonId.toString()
                                                                            );
                                                                            handleDaySelect(
                                                                                day.lessonDayId
                                                                            );
                                                                        }}
                                                                    >
                                                                        Day{" "}
                                                                        {
                                                                            day.dayOfWeek
                                                                        }
                                                                    </button>
                                                                ))}
                                                        </div>
                                                    )
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}

            {/* Other Studies (Collapsible) */}
            {showAllStudies && otherStudies.length > 0 && (
                <div className="other-studies-section">
                    <h3 className="section-title">Other Studies</h3>
                    <div className="other-studies">
                        {otherStudies.map((study) => (
                            <button
                                key={study.studyId}
                                className="other-study-btn"
                                onClick={() => handleStudySelect(study.studyId)}
                            >
                                <span className="study-name">
                                    {study.displayName}
                                </span>
                                <span className="study-year">
                                    {study.releaseYear}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModernLeftNav;
