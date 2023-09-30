import { AxiosResponse } from 'axios';
import AuthContext from '../../AuthContext';
import { BsfProxiedRequest } from './BsfProxiedRequest';

export class AuthorizeRequest extends BsfProxiedRequest<string> {
  constructor(protected authContext: AuthContext, /* other dependencies */) {
    super(authContext);
  }

  protected processResponse(response: AxiosResponse): void {
    console.log("response: " + JSON.stringify(response));
    const cookieStringWithBracktes: string = response.headers['x-c-data'] || '';
    const cookieString: string = cookieStringWithBracktes.substring(1, cookieStringWithBracktes.length - 1);

    let xCsrfToken = "";

    if (this.authContext.cookies === undefined) {
      this.authContext.cookies = [];
    }

    const cookies = cookieString.split(',');
    cookies.forEach(cookie => {
      const trimmed = cookie.trim();
      this.authContext.cookies?.push(trimmed.split(';')[0]);

      if (trimmed.startsWith("x-ms-cpim-csrf=")) {
        xCsrfToken = trimmed.replace("x-ms-cpim-csrf=", "").split(";")[0];
      }
    });

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
