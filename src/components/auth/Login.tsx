// src/components/auth/Login.tsx

import React from 'react';
import { ConfigurationRequest } from '../../api/bsf/requests/ConfigurationRequest';
import AuthContext from '../../api/bsf/AuthContext';
import { AuthorizeRequest } from '../../api/bsf/requests/AuthorizeRequest';
import { SelfAssertedRequest } from '../../api/bsf/requests/SelfAssertedRequest';

const Login: React.FC = () => {
  const authContext = new AuthContext({email: 'casker@gmail.com', password: '3zV5RzJus%no'}, "");

  const handleLoginClick = async () => {
    const configRequest = new ConfigurationRequest(authContext);
    await configRequest.makeRequest();

    const authorizeRequest = new AuthorizeRequest(authContext);
    await authorizeRequest.makeRequest();

    const selfAssertedRequest = new SelfAssertedRequest(authContext);
    await selfAssertedRequest.makeRequest();
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <button onClick={handleLoginClick}>Login</button>
    </div>
  );
};

export default Login;
