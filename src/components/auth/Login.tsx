import React from 'react';
import { ConfigurationRequest } from '../../api/bsf/requests/auth/ConfigurationRequest';
import AuthContext, { AccessToken, AuthContextHolder } from '../../api/bsf/AuthContext';
import { AuthorizeRequest } from '../../api/bsf/requests/auth/AuthorizeRequest';
import { SelfAssertedRequest } from '../../api/bsf/requests/auth/SelfAssertedRequest';
import { ConfirmedRequest } from '../../api/bsf/requests/auth/ConfirmedRequest';
import { TokenRequest } from '../../api/bsf/requests/auth/TokenRequest';
import { RefreshTokenRequest } from '../../api/bsf/requests/auth/RefreshTokenRequest';

type LoginProps = {
  setAccessToken: (token: AccessToken | null) => void;
  existingAccessToken: AccessToken
};

const Login: React.FC<LoginProps> = ({setAccessToken, existingAccessToken}) => {
  const authContext = AuthContextHolder.buildOrGetAuthContext('casker@gmail.com', '3zV5RzJus%no');
  if (existingAccessToken){
    authContext.accessToken = existingAccessToken;
  }

  const handleLoginClick = async () => {
    const configRequest = new ConfigurationRequest(authContext);
    await configRequest.makeRequest();

    if (validRefreshToken()) {
      const refreshTokenRequest = new RefreshTokenRequest(authContext);
      await refreshTokenRequest.makeRequest();
    }
    else {
      const authorizeRequest = new AuthorizeRequest(authContext);
      await authorizeRequest.makeRequest();

      const selfAssertedRequest = new SelfAssertedRequest(authContext);
      await selfAssertedRequest.makeRequest();

      const confirmedRequest = new ConfirmedRequest(authContext);
      await confirmedRequest.makeRequest();

      const tokenRequest = new TokenRequest(authContext);
      await tokenRequest.makeRequest();
    }

    localStorage.setItem('accessToken', JSON.stringify(authContext.accessToken));
    setAccessToken(authContext.accessToken!);
  };

  function validRefreshToken(): boolean {
    if (!authContext.accessToken) {
      return false;
    }
    const refreshExpiration = authContext.accessToken.not_before + authContext.accessToken.refresh_token_expires_in;
    const now = Math.floor(Date.now() / 1000); 
    return now < refreshExpiration;
  }

  function getLoginText():string {
    let ret = "Login";
    if (validRefreshToken()){
      ret += " (refresh)";
    }
    return ret;
  }

  return (
    <div className="login-container">
      <h1>Login</h1>
      <button onClick={handleLoginClick}>{getLoginText()}</button>
    </div>
  );
};

export default Login;
