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
  const lesson = study?.lessons.find((lesson) => lesson.lessonId === lessonId);
  const lessonDay = lesson?.lessonDays.find(
    (day) => day.lessonDayId === lessonDayId
  );

  const renderButton = (
    text: string,
    onClick: () => void = () => {},
    first = false
  ) => {
    return (
      <>
        {!first && (
          <span className="text-xs font-normal text-slate-400">&gt;</span>
        )}
        <button
          className="cursor-pointer px-3 py-1 text-sm hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-all"
          onClick={onClick}
        >
          {text}
        </button>
      </>
    );
  };

  return (
    <div className="flex items-center ml-3 mb-5 gap-2">
      {renderButton(
        "Studies",
        () => {
          setData.setCurrentStudyId(undefined);
          setData.setCurrentLessonId(undefined);
          setData.setCurrentLessonDayId(undefined);
        },
        true
      )}

      {study &&
        renderButton(study.displayName, () => {
          setData.setCurrentLessonId(undefined);
          setData.setCurrentLessonDayId(undefined);
        })}

      {lesson &&
        renderButton(lesson.title, () => {
          setData.setCurrentLessonDayId(undefined);
        })}

      {lessonDay &&
        !settings.settings.fullLessonMode &&
        renderButton(`Day ${lessonDay.dayOfWeek}`)}
    </div>
  );
};

export default Breadcrumbs;
