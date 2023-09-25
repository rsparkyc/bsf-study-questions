import { AxiosResponse } from 'axios';
import AuthContext from '../AuthContext';
import { BsfRequest } from './BsfRequest';

export class AuthorizeRequest extends BsfRequest<string> {
  constructor(protected authContext: AuthContext, /* other dependencies */) {
    super(authContext);
  }

  protected processResponse(response: AxiosResponse): void {
    console.log("response: " + JSON.stringify(response));
    const cookieString:string = response.headers['x-c-data'] || [];
    let xCsrfToken = "";

    const cookies = cookieString.split(',');
    cookies.forEach(cookie => {
      if (cookie.startsWith("X_MS_CPIM_CSRF=") || cookie.startsWith("x-ms-cpim-csrf=")) {
        xCsrfToken = cookie.replace("X_MS_CPIM_CSRF=", "").replace("x-ms-cpim-csrf=", "").split(";")[0];
      }
    });

    this.authContext.cookies = cookies;
    this.authContext.csrf = xCsrfToken;
  }

  protected generateUrl(): string {
    const url = `https://login.mybsf.org/bsfmcaiamprod.onmicrosoft.com/b2c_1a_signuporsignin/oauth2/v2.0/authorize?` +
      `client_id=${this.authContext.clientId}` +
      `&scope=${this.authContext.scope}` +
      `&redirect_uri=https://www.mybsf.org/` +
      `&client-request-id=${this.authContext.clientRequestId}` +
      `&response_type=code` +
      `&code_challenge=${this.authContext.codeChallenge}` +
      `&code_challenge_method=S256` +
      `&nonce=${this.authContext.nonce}` +
      `&state=${this.authContext.state}`;

    return url;
  }
}
