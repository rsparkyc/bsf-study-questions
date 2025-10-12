import "./LessonContainerComponent.css";

import React, { useContext, useEffect, useState } from "react";

import { AllLessonsRequest } from "../api/bsf/requests/AllLessonsRequest";
import AllLessonsResponse from "../api/bsf/response/AllLessonsResponse";
import { AllScripturesRequest } from "../api/bsf/requests/AllScripturesRequest";
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

    const savedStudyId = Number(localStorage.getItem("currentStudyId") || "0");
    const savedLessonId = Number(
        localStorage.getItem("currentLessonId") || "0"
    );
    const savedLessonDayId = Number(
        localStorage.getItem("currentLessonDayId") || "0"
    );

    const settings = useContext(SettingsContext);

    const handleAnswerChange = (newAnswerData: AnswersResponse) => {
        console.log(
            `🟡 Parent handleAnswerChange called with ${newAnswerData.data.length} answers`
        );
        setAnswersData(newAnswerData);
    };

    const postProcessLessonResponse = (response: AllLessonsResponse) => {
        for (const study of response.data.studies) {
            for (const lesson of study.lessons) {
                for (const lessonDay of lesson.lessonDays) {
                    const fullTitle = lessonDay.lessonDayTranslations[0].title;
                    // split on newline, and save the first part as the mainTitle and the rest as the subTitle
                    const splitTitle = fullTitle.split("\n");
                    lessonDay.lessonDayTranslations[0].mainTitle =
                        splitTitle[0];
                    lessonDay.lessonDayTranslations[0].subTitle = splitTitle[1];
                }
            }
        }
    };

    useEffect(() => {
        // Fetch your API data here and set it to the state
        async function fetchData() {
            const authContext = AuthContextHolder.getAuthContext();
            if (authContext.timeRemaining() > 0) {
                const allLessonsPromise = new AllLessonsRequest(
                    authContext
                ).makeRequest();
                const answersPromise = new AnswersRequest(
                    authContext
                ).makeRequest();
                const allScripturesPromise = new AllScripturesRequest(
                    authContext
                ).makeRequest();

                // Await all responses in parallel
                const [lessonsResponse, answersData, scripturesData] =
                    await Promise.all([
                        allLessonsPromise,
                        answersPromise,
                        allScripturesPromise,
                    ]);

                postProcessLessonResponse(lessonsResponse);

                setLessonData(lessonsResponse);
                setAnswersData(answersData);
                setScripturesData(scripturesData);

                if (savedStudyId) setCurrentStudyId(Number(savedStudyId));
                if (savedLessonId) setCurrentLessonId(Number(savedLessonId));
                if (savedLessonDayId)
                    setCurrentLessonDayId(Number(savedLessonDayId));
            }
        }

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="lesson-container">
            <div className="content-row">
                {settings.settings.modernNavigation ? (
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
