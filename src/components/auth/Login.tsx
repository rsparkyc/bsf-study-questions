// src/components/auth/Login.tsx

import React from 'react';
import { ConfigurationRequest } from '../../api/bsf/requests/ConfigurationRequest';
import AuthContext from '../../api/bsf/AuthContext';
import { AuthorizeRequest } from '../../api/bsf/requests/AuthorizeRequest';

const Login: React.FC = () => {
  const authContext = new AuthContext(null, "");

  const handleLoginClick = async () => {
    const configRequest = new ConfigurationRequest(authContext);
    await configRequest.makeRequest();
    console.log(authContext); // Log the populated authContext for debug purposes

    const authorizeRequest = new AuthorizeRequest(authContext);
    await authorizeRequest.makeRequest();
    console.log(authContext); // Log the populated authContext for debug purposes
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <button onClick={handleLoginClick}>Login</button>
    </div>
  );
};

export default Login;
