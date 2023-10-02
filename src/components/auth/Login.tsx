import React from 'react';
import { ConfigurationRequest } from '../../api/bsf/requests/auth/ConfigurationRequest';
import AuthContext, { AccessToken, AuthContextHolder } from '../../api/bsf/AuthContext';
import { AuthorizeRequest } from '../../api/bsf/requests/auth/AuthorizeRequest';
import { SelfAssertedRequest } from '../../api/bsf/requests/auth/SelfAssertedRequest';
import { ConfirmedRequest } from '../../api/bsf/requests/auth/ConfirmedRequest';
import { TokenRequest } from '../../api/bsf/requests/auth/TokenRequest';

type LoginProps = {
  setAccessToken: (token: AccessToken | null) => void;
};

const Login: React.FC<LoginProps> = ({setAccessToken}) => {
  const authContext = AuthContextHolder.buildAuthContext('casker@gmail.com', '3zV5RzJus%no');

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

    localStorage.setItem('accessToken', JSON.stringify(authContext.accessToken));
    setAccessToken(authContext.accessToken!);
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <button onClick={handleLoginClick}>Login</button>
    </div>
  );
};

export default Login;
