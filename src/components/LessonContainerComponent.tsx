import "./LessonContainerComponent.css";

import React, { useContext, useEffect, useRef, useState } from "react";

import AllLessonsResponse, { Study } from "../api/bsf/response/AllLessonsResponse";
import {
    loadLessonIndex,
    loadStudyContent,
    loadStudyScriptures,
    studyFromIndex,
} from "../api/bsf/studyData";
import { cacheGet, cacheSet } from "../api/bsf/cache/idbCache";
import { LessonIndexStudy } from "../api/bsf/response/StudyV2Responses";
import AllScripturesResponse from "../api/bsf/response/AllScripturesResponse";
import { AnswersRequest } from "../api/bsf/requests/AnswersRequest";
import AnswersResponse from "../api/bsf/response/AnswersResponse";
import { AuthContextHolder } from "../api/bsf/AuthContext";
import LeftNav from "./LeftNav";
import LessonAreaComponent from "./LessonAreaComponent";
import ModernLeftNav from "./ModernLeftNav";
import SettingsContext from "../context/SettingsContext";

const LessonContainer: React.FC = () => {
    console.log("🎯 LessonContainer: Component rendering");
    const [lessonData, setLessonData] = useState<
        AllLessonsResponse | undefined
    >();
    const [answersData, setAnswersData] = useState<
        AnswersResponse | undefined
    >();
    const [scripturesData, setScripturesData] = useState<
        AllScripturesResponse | undefined
    >();
    const [currentStudyId, setCurrentStudyId] = useState<number | undefined>();
    const [currentLessonId, setCurrentLessonId] = useState<
        number | undefined
    >();
    const [currentLessonDayId, setCurrentLessonDayId] = useState<
        number | undefined
    >();
    const [defaultStudyId, setDefaultStudyId] = useState<number | undefined>();
    const loadedScriptureStudies = useRef(new Set<number>());

    const savedStudyId = Number(localStorage.getItem("currentStudyId") || "0");
    const savedLessonId = Number(
        localStorage.getItem("currentLessonId") || "0"
    );
    const savedLessonDayId = Number(
        localStorage.getItem("currentLessonDayId") || "0"
    );

    const [navCollapsed, setNavCollapsed] = useState(
        localStorage.getItem("navCollapsed") === "true"
    );

    const settings = useContext(SettingsContext);

    const toggleNav = () => {
        setNavCollapsed((collapsed) => {
            localStorage.setItem("navCollapsed", String(!collapsed));
            return !collapsed;
        });
    };

    const handleAnswerChange = (newAnswerData: AnswersResponse) => {
        console.log(
            `🟡 Parent handleAnswerChange called with ${newAnswerData.data.length} answers`
        );
        setAnswersData(newAnswerData);
    };

    const mergeStudy = (study: Study) =>
        setLessonData((prev) =>
            prev
                ? {
                      ...prev,
                      data: {
                          ...prev.data,
                          studies: prev.data.studies.map((s) =>
                              s.studyId === study.studyId ? study : s
                          ),
                      },
                  }
                : prev
        );

    useEffect(() => {
        let cancelled = false;
        async function fetchData() {
            const authContext = AuthContextHolder.getAuthContext();
            if (authContext.timeRemaining() <= 0) return;

            new AnswersRequest(authContext)
                .makeRequest()
                .then((a) => !cancelled && setAnswersData(a))
                .catch((err) => console.error("Failed to load answers:", err));

            // Render from the cached index right away (if any), and refresh
            // it in the background; studies whose version changed get reloaded.
            const freshIndexPromise = loadLessonIndex(authContext);
            const cachedIndex = await cacheGet<LessonIndexStudy[]>("lesson-index");
            const index = cachedIndex ?? (await freshIndexPromise);
            if (cancelled) return;

            setLessonData({
                isSuccess: true,
                errorMsg: null,
                errorCode: null,
                version: 0,
                data: { studies: index.map(studyFromIndex), signature: "" },
            });

            // Load the saved (or active) study first, then the rest in the
            // background, newest first.
            const firstId =
                index.find((s) => s.studyId === savedStudyId)?.studyId ??
                index.find((s) => s.isActive)?.studyId ??
                index[index.length - 1]?.studyId;
            const ordered = [
                ...index.filter((s) => s.studyId === firstId),
                ...[...index].reverse().filter((s) => s.studyId !== firstId),
            ];

            const loadStudy = async (s: LessonIndexStudy) => {
                try {
                    const study = await loadStudyContent(
                        authContext,
                        s.studyId,
                        s.version
                    );
                    if (!cancelled) mergeStudy(study);
                } catch (err) {
                    console.error(`Failed to load study ${s.studyId}:`, err);
                }
            };

            for (let i = 0; i < ordered.length; i++) {
                await loadStudy(ordered[i]);
                if (cancelled) return;
                if (i === 0) {
                    setDefaultStudyId(firstId);
                    if (savedStudyId) setCurrentStudyId(Number(savedStudyId));
                    if (savedLessonId) setCurrentLessonId(Number(savedLessonId));
                    if (savedLessonDayId)
                        setCurrentLessonDayId(Number(savedLessonDayId));
                }
            }

            const freshIndex = await freshIndexPromise;
            cacheSet("lesson-index", freshIndex);
            if (cancelled || !cachedIndex) return;
            const cachedVersions = new Map(
                cachedIndex.map((s) => [s.studyId, s.version])
            );
            const newStudies = freshIndex.filter(
                (s) => !cachedVersions.has(s.studyId)
            );
            if (newStudies.length > 0) {
                // A new study appeared: add placeholders, then load it.
                setLessonData((prev) =>
                    prev && {
                        ...prev,
                        data: {
                            ...prev.data,
                            studies: freshIndex.map(
                                (s) =>
                                    prev.data.studies.find(
                                        (p) => p.studyId === s.studyId
                                    ) ?? studyFromIndex(s)
                            ),
                        },
                    }
                );
            }
            for (const s of freshIndex) {
                if (cachedVersions.get(s.studyId) !== s.version) await loadStudy(s);
            }
        }

        fetchData();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // The study whose scriptures we need: the one containing the selected day,
    // else the selected study, else the default study.
    const viewedStudyId =
        (currentLessonDayId &&
            lessonData?.data.studies.find((study) =>
                study.lessons.some((l) =>
                    l.lessonDays.some((d) => d.lessonDayId === currentLessonDayId)
                )
            )?.studyId) ||
        currentStudyId ||
        defaultStudyId;

    useEffect(() => {
        if (!viewedStudyId || loadedScriptureStudies.current.has(viewedStudyId))
            return;
        loadedScriptureStudies.current.add(viewedStudyId);
        const authContext = AuthContextHolder.getAuthContext();
        loadStudyScriptures(authContext, viewedStudyId)
            .then((scriptures) =>
                setScripturesData((prev) => ({
                    isSuccess: true,
                    errorMsg: null,
                    errorCode: null,
                    version: 0,
                    data: [...(prev?.data ?? []), ...scriptures],
                }))
            )
            .catch((err) => {
                loadedScriptureStudies.current.delete(viewedStudyId);
                console.error("Failed to load scriptures:", err);
            });
    }, [viewedStudyId]);

    return (
        <div
            className={`lesson-container ${navCollapsed ? "nav-collapsed" : ""}`}
        >
            <div className="content-row">
                <button
                    className="nav-toggle-btn"
                    onClick={toggleNav}
                    aria-label={
                        navCollapsed ? "Show navigation" : "Hide navigation"
                    }
                    aria-expanded={!navCollapsed}
                    title={navCollapsed ? "Show navigation" : "Hide navigation"}
                >
                    {navCollapsed ? "›" : "‹"}
                </button>
                {navCollapsed ? null : settings.settings.modernNavigation ? (
                    <ModernLeftNav
                        data={lessonData}
                        setCurrentStudyId={setCurrentStudyId}
                        setCurrentLessonId={setCurrentLessonId}
                        setCurrentLessonDayId={setCurrentLessonDayId}
                        currentStudyId={currentStudyId}
                        currentLessonId={currentLessonId}
                        currentLessonDayId={currentLessonDayId}
                    />
                ) : (
                    <LeftNav
                        data={lessonData}
                        setCurrentStudyId={setCurrentStudyId}
                        setCurrentLessonId={setCurrentLessonId}
                        setCurrentLessonDayId={setCurrentLessonDayId}
                        initialExpandedStudyId={Number(savedStudyId)}
                        initialExpandedLessonId={Number(savedLessonId)}
                        initialSelectedLessonDayId={Number(savedLessonDayId)}
                    />
                )}

                <div className="lesson-area-v">
                    {!currentStudyId &&
                        !currentLessonId &&
                        !currentLessonDayId &&
                        lessonData && (
                            <div className="all-studies-view">
                                <h1>Bible Study Fellowship</h1>
                                <p>
                                    Select a study from the navigation to begin.
                                </p>
                                <div className="studies-grid">
                                    {lessonData.data.studies.map((study) => (
                                        <div
                                            key={study.studyId}
                                            className="study-card"
                                        >
                                            <h3>{study.displayName}</h3>
                                            <p>
                                                {study.numberLessons} lessons •{" "}
                                                {study.releaseYear}
                                            </p>
                                            <button
                                                className="study-select-btn"
                                                onClick={() => {
                                                    setCurrentStudyId(
                                                        study.studyId
                                                    );
                                                    localStorage.setItem(
                                                        "currentStudyId",
                                                        study.studyId.toString()
                                                    );
                                                }}
                                            >
                                                Select Study
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    {currentLessonDayId &&
                        lessonData &&
                        (() => {
                            const currentStudy = lessonData.data.studies.find(
                                (study) =>
                                    study.lessons.some((lesson) =>
                                        lesson.lessonDays.some(
                                            (day) =>
                                                day.lessonDayId ===
                                                currentLessonDayId
                                        )
                                    )
                            );
                            const currentLesson = currentStudy?.lessons.find(
                                (lesson) =>
                                    lesson.lessonDays.some(
                                        (day) =>
                                            day.lessonDayId ===
                                            currentLessonDayId
                                    )
                            );

                            // we want to get the previous lesson id (for the lecture and notes).
                            // We can do this by getting the index of the current lesson and subtracting 1,
                            // then getting the lesson id at that index.

                            const currentLessonIndex =
                                currentStudy?.lessons.findIndex(
                                    (lesson) =>
                                        lesson.lessonId === currentLessonId
                                );
                            const previousLessonId =
                                currentLessonIndex && currentLessonIndex > 0
                                    ? currentStudy?.lessons[
                                          currentLessonIndex! - 1
                                      ]?.lessonId
                                    : undefined;

                            return (
                                <React.Fragment>
                                    {
                                        <div id="lesson-title">
                                            <h1>
                                                {
                                                    currentLesson
                                                        ?.lessonTranslations[0]
                                                        .title
                                                }
                                            </h1>
                                            <h3>
                                                {
                                                    currentLesson
                                                        ?.lessonTranslations[0]
                                                        .scripture
                                                }
                                            </h3>
                                        </div>
                                    }
                                    {currentLesson?.lessonDays
                                        .sort(
                                            (a, b) => a.dayOfWeek - b.dayOfWeek
                                        )
                                        .map(
                                            (day) =>
                                                (settings.settings
                                                    .fullLessonMode ||
                                                    day.lessonDayId ===
                                                        currentLessonDayId) && (
                                                    <div key={day.lessonDayId}>
                                                        <LessonAreaComponent
                                                            key={
                                                                day.lessonDayId
                                                            }
                                                            previousLessonId={
                                                                previousLessonId
                                                            }
                                                            lessonDay={day}
                                                            answersData={
                                                                answersData
                                                            }
                                                            scripturesData={
                                                                scripturesData
                                                            }
                                                            onAnswerChange={
                                                                handleAnswerChange
                                                            }
                                                        />
                                                    </div>
                                                )
                                        )}
                                </React.Fragment>
                            );
                        })()}
                </div>
            </div>
        </div>
    );
};

export default LessonContainer;
