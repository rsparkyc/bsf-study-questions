import './TestEndpointComponent.css';

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

const TestEndpoint: React.FC<TokenProps> = ({ accessToken }) => {

  const [lessonData, setLessonData] = useState<AllLessonsResponse | undefined>();
  const [currentStudyId, setCurrentStudyId] = useState<number | undefined>();
  const [currentLessonId, setCurrentLessonId] = useState<number | undefined>();
  const [currentLessonDayId, setCurrentLessonDayId] = useState<number | undefined>();

  
  useEffect(() => {
      // Fetch your API data here and set it to the state
      async function fetchData() {
        const authContext = AuthContextHolder.getAuthContext();
        const allLessonsRequest = new AllLessonsRequest(authContext);
        const response = await allLessonsRequest.makeRequest();
        setLessonData(response);

      }

      fetchData();
  }, []);

  return (
    <div className="test-endpoint-container">
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
          setCurrentLessonDayId={setCurrentLessonDayId} />

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

export default TestEndpoint;
