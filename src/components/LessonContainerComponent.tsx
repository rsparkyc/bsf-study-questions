import "./LessonContainerComponent.css";

import React, { useContext, useEffect, useState } from "react";

import { AllLessonsRequest } from "../api/bsf/requests/AllLessonsRequest";
import AllLessonsResponse from "../api/bsf/response/AllLessonsResponse";
import { AllScripturesRequest } from "../api/bsf/requests/AllScripturesRequest";
import AllScripturesResponse from "../api/bsf/response/AllScripturesResponse";
import { AnswersRequest } from "../api/bsf/requests/AnswersRequest";
import AnswersResponse from "../api/bsf/response/AnswersResponse";
import { AuthContextHolder } from "../api/bsf/AuthContext";
import Breadcrumbs from "./Breadcrumbs";
import LeftNav from "./LeftNav";
import LessonAreaComponent from "./LessonAreaComponent";
import SettingsContext from "../context/SettingsContext";

const LessonContainer: React.FC = () => {
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
            <Breadcrumbs
                studyId={currentStudyId}
                lessonId={currentLessonId}
                lessonDayId={currentLessonDayId}
                setData={{
                    setCurrentStudyId,
                    setCurrentLessonId,
                    setCurrentLessonDayId,
                }}
                data={lessonData}
            />
            <div className="content-row">
                <LeftNav
                    data={lessonData}
                    setCurrentStudyId={setCurrentStudyId}
                    setCurrentLessonId={setCurrentLessonId}
                    setCurrentLessonDayId={setCurrentLessonDayId}
                    initialExpandedStudyId={Number(savedStudyId)}
                    initialExpandedLessonId={Number(savedLessonId)}
                    initialSelectedLessonDayId={Number(savedLessonDayId)}
                />

                <div className="lesson-area-v">
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

                            return currentLesson?.lessonDays.map(
                                (day) =>
                                    (settings.settings.fullLessonMode ||
                                        day.lessonDayId ===
                                            currentLessonDayId) && (
                                        <div key={day.lessonDayId}>
                                            <LessonAreaComponent
                                                key={day.lessonDayId}
                                                previousLessonId={
                                                    previousLessonId
                                                }
                                                lessonDay={day}
                                                answersData={answersData}
                                                scripturesData={scripturesData}
                                            />
                                        </div>
                                    )
                            );
                        })()}
                </div>
            </div>
        </div>
    );
};

export default LessonContainer;
