// src/components/auth/Login.tsx

import React from 'react';
import { ConfigurationRequest } from '../../api/bsf/requests/auth/ConfigurationRequest';
import AuthContext from '../../api/bsf/AuthContext';
import { AuthorizeRequest } from '../../api/bsf/requests/auth/AuthorizeRequest';
import { SelfAssertedRequest } from '../../api/bsf/requests/auth/SelfAssertedRequest';
import { ConfirmedRequest } from '../../api/bsf/requests/auth/ConfirmedRequest';
import { TokenRequest } from '../../api/bsf/requests/auth/TokenRequest';

const Login: React.FC = () => {
  const authContext = new AuthContext({ email: 'casker@gmail.com', password: '3zV5RzJus%no' }, "");

  const handleLoginClick = async () => {
    const configRequest = new ConfigurationRequest(authContext);
    await configRequest.makeRequest();

    const authorizeRequest = new AuthorizeRequest(authContext);
    await authorizeRequest.makeRequest();

    const selfAssertedRequest = new SelfAssertedRequest(authContext);
    await selfAssertedRequest.makeRequest();

    const confirmedRequest = new ConfirmedRequest(authContext);
    await confirmedRequest.makeRequest();

    const tokenRequest = new TokenRequest(authContext);
    await tokenRequest.makeRequest();

    alert(JSON.stringify(authContext.accessToken));
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <button onClick={handleLoginClick}>Login</button>
    </div>
  );
};

export default Login;
