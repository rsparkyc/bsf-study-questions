import './LessonContainerComponent.css';

import { AccessToken, AuthContextHolder } from '../api/bsf/AuthContext';
import React, {useEffect, useState} from 'react';

import { AllLessonsRequest } from '../api/bsf/requests/AllLessonsRequest';
import AllLessonsResponse from '../api/bsf/response/AllLessonsResponse';
import Breadcrumbs from './Breadcrumbs';
import LeftNav from './LeftNav';
import LessonAreaComponent from './LessonAreaComponent';

interface TokenProps {
  accessToken: AccessToken;
}

const LessonContainer: React.FC<TokenProps> = ({ accessToken }) => {

  const [lessonData, setLessonData] = useState<AllLessonsResponse | undefined>();
  const [currentStudyId, setCurrentStudyId] = useState<number | undefined>();
  const [currentLessonId, setCurrentLessonId] = useState<number | undefined>();
  const [currentLessonDayId, setCurrentLessonDayId] = useState<number | undefined>();

  const savedStudyId = Number(localStorage.getItem('currentStudyId') || '0');
  const savedLessonId = Number(localStorage.getItem('currentLessonId') || '0');
  const savedLessonDayId = Number(localStorage.getItem('currentLessonDayId') || '0');


  
  useEffect(() => {
      // Fetch your API data here and set it to the state
      async function fetchData() {
        const authContext = AuthContextHolder.getAuthContext();
        if (authContext.timeRemaining() > 0) {
          const allLessonsRequest = new AllLessonsRequest(authContext);
          const response = await allLessonsRequest.makeRequest();
          setLessonData(response);

          if (savedStudyId) setCurrentStudyId(Number(savedStudyId));
          if (savedLessonId) setCurrentLessonId(Number(savedLessonId));
          if (savedLessonDayId) setCurrentLessonDayId(Number(savedLessonDayId));
        }

      }

      fetchData();
  }, []);

  return (
    <div className="lesson-container">
      <Breadcrumbs 
        studyId={currentStudyId} 
        lessonId={currentLessonId} 
        lessonDayId={currentLessonDayId}
        setData={{ setCurrentStudyId, setCurrentLessonId, setCurrentLessonDayId }}
        data={lessonData} />
      <div className="content-row">
        <LeftNav 
          data={lessonData} 
          setCurrentStudyId={setCurrentStudyId} 
          setCurrentLessonId={setCurrentLessonId}
          setCurrentLessonDayId={setCurrentLessonDayId}
          initialExpandedStudyId={Number(savedStudyId)}
          initialExpandedLessonId={Number(savedLessonId)}
       />

        {currentLessonDayId && lessonData && (
            <LessonAreaComponent 
                lessonDay={lessonData.data.studies
                    .flatMap(study => study.lessons)
                    .flatMap(lesson => lesson.lessonDays)
                    .find(day => day.lessonDayId === currentLessonDayId)}
            />
        )}
      </div>
    </div>
  );
};

export default LessonContainer;
