import { AccessToken, AuthContextHolder } from '../../api/bsf/AuthContext';

import { AuthorizeRequest } from '../../api/bsf/requests/auth/AuthorizeRequest';
import { ConfigurationRequest } from '../../api/bsf/requests/auth/ConfigurationRequest';
import { ConfirmedRequest } from '../../api/bsf/requests/auth/ConfirmedRequest';
import React from 'react';
import { RefreshTokenRequest } from '../../api/bsf/requests/auth/RefreshTokenRequest';
import { SelfAssertedRequest } from '../../api/bsf/requests/auth/SelfAssertedRequest';
import { TokenRequest } from '../../api/bsf/requests/auth/TokenRequest';

type LoginProps = {
  setAccessToken: (token: AccessToken | null) => void;
  existingAccessToken: AccessToken
};

const Login: React.FC<LoginProps> = ({setAccessToken, existingAccessToken}) => {
  let username = 'casker@gmail.com';
  let password = '3zV5RzJus%no';
  let authContext = AuthContextHolder.buildOrGetAuthContext(username, password);
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
      let loggedIn = false; 
      while (!loggedIn) {
        const authorizeRequest = new AuthorizeRequest(authContext);
        await authorizeRequest.makeRequest();

        const selfAssertedRequest = new SelfAssertedRequest(authContext);
        await selfAssertedRequest.makeRequest();

        const confirmedRequest = new ConfirmedRequest(authContext);
        await confirmedRequest.makeRequest();

        try {
          const tokenRequest = new TokenRequest(authContext);
          await tokenRequest.makeRequest();
          loggedIn = true;
        }
        catch (e) {
          const codeData = {
            codeChallenge: authContext.codeChallenge,
            codeVerifify: authContext.codeVerify,
          };
          console.warn("error with token request, retrying: " + JSON.stringify(codeData, null, 2));
          authContext.rebuildCodeChallenge();
          // pretty sure this is fixed now
          debugger;
        }
      }
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
