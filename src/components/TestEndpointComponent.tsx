import { AccessToken, AuthContextHolder } from '../api/bsf/AuthContext';
import React, {useEffect, useState} from 'react';

import { AllLessonsRequest } from '../api/bsf/requests/AllLessonsRequest';
import AllLessonsResponse from '../api/bsf/response/AllLessonsResponse';
import Breadcrumbs from './Breadcrumbs';
import LeftNav from './LeftNav';

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

        // Set the current study, lesson, and lesson day IDs
        const currentStudy = response.data.studies[6];
        setCurrentStudyId(currentStudy.studyId);
        const currentLesson = currentStudy.lessons[3];
        setCurrentLessonId(currentLesson.lessonId);
        const currentLessonDay = currentLesson.lessonDays[0];
        if (currentLessonDay) {
          setCurrentLessonDayId(currentLessonDay.lessonDayId);
        }
        
      }

      fetchData();
  }, []);

  return (
    <div className="test-endpoint-container">
      <Breadcrumbs 
        studyId={currentStudyId} 
        lessonId={currentLessonId} 
        lessonDayId={currentLessonDayId}
        data={lessonData} />
        <LeftNav 
          data={lessonData} 
          setCurrentStudyId={setCurrentStudyId} 
          setCurrentLessonId={setCurrentLessonId}
          setCurrentLessonDayId={setCurrentLessonDayId}
      />

    </div>
  );
};

export default TestEndpoint;
