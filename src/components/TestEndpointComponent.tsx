import AuthContext, { AccessToken, AuthContextHolder } from '../api/bsf/AuthContext';

import { AllLessonsRequest } from '../api/bsf/requests/AllLessonsRequest';
import { PersonRequest } from '../api/bsf/requests/PersonRequest'
import React from 'react';

interface TokenProps {
  accessToken: AccessToken;
}

const Person: React.FC<TokenProps> = ({ accessToken }) => {

  const handleTestEndpointClick = async () => {
    const authContext = AuthContextHolder.getAuthContext();
    authContext.accessToken = accessToken;

    const allLessonsRequest = new AllLessonsRequest(authContext);
    const response = await allLessonsRequest.makeRequest();

    console.log(JSON.stringify(response, null, 2));

    debugger;

  }

  return (
    <div className="test-endpoint-container">
      <h1>Make Request</h1>
      <button onClick={handleTestEndpointClick}>Make it so.</button>
    </div>
  );
};

export default Person;
