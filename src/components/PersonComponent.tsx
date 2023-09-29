import React from 'react';
import AuthContext, { AccessToken } from '../api/bsf/AuthContext';
import { PersonRequest } from '../api/bsf/requests/PersonRequest'

interface TokenProps {
  accessToken: AccessToken;
}

const Person: React.FC<TokenProps> = ({ accessToken }) => {

  const handlePersonClick = async () => {
    const authContext = new AuthContext({ email: '', password: '' }, "");
    authContext.accessToken = accessToken;

    const personRequest = new PersonRequest(authContext);
    await personRequest.makeRequest();

    debugger;

  };

  return (
    <div className="person-container">
      <h1>Make Person Request</h1>
      <button onClick={handlePersonClick}>Person</button>
    </div>
  );
};

export default Person;
