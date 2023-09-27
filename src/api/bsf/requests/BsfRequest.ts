import axios, { AxiosResponse, Method } from 'axios';
import AuthContext from '../AuthContext';


export abstract class BsfRequest<T> {
  protected authContext: AuthContext;
  protected extractedCookies: Record<string, string> = {};

  constructor(authContext: AuthContext) {
    this.authContext = authContext;
  }

  public async makeRequest(): Promise<T> {
    const headers = this.getHeaders();
    this.addAdditionalHeaders(headers);

    const proxiedRequestOptions = {
      url: this.generateUrl(),
      method: this.getRequestMethod(),
      headers,
      data: this.getRequestBody()
    };

    const requestOptions = {
      url: 'https://fff4in4hx53xkqbay4dxybzfze0lvjnm.lambda-url.us-east-1.on.aws/',
      method: 'POST',
      data: proxiedRequestOptions
    };

    const response: AxiosResponse<T> = await axios(requestOptions);
    this.extractedCookies = this.extractCookies(response);

    this.processResponse(response);
    return response.data;
  }

  protected extractCookies(response: AxiosResponse<T>): Record<string, string> {
    let extracted: Record<string, string> = {};

    if (response.headers['x-c-data']) {
      let cookieData: string[] = (response.headers['x-c-data'] + ',').split('HttpOnly,');
      cookieData.forEach(cookie => {
        let trimmed = cookie.trimStart();
        if (trimmed.startsWith('[')) {
          trimmed = trimmed.substring(1);
        }
        if (trimmed.length > 0) {
          const index = trimmed.indexOf('=');
          const key = trimmed.substring(0, index);
          const val = trimmed.substring(index + 1).split(';')[0];
          if (val.length !== 0) { // assume expired, don't add
            extracted[key] = val;
          }
        }
      });
    }

    return extracted;

  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.authContext.cookies) {
      headers['x-c-data'] = JSON.stringify(this.authContext.cookies);
    }

    if (this.authContext.accessToken) {
      headers['Authorization'] = `Bearer ${this.authContext.accessToken}`;
    }

    if (this.authContext.encodedSessionContext) {
      headers['session-context'] = this.authContext.encodedSessionContext;
    }

    return headers;
  }

  protected addAdditionalHeaders(headers: Record<string, string>): void {
    // noop in abstract class
  }

  protected processResponse(response: AxiosResponse<T>): void {
    // noop in abstract class
  }

  protected getRequestMethod(): Method {
    return 'GET';
  }

  protected getRequestBody(): string | null {
    return null;
  }

  protected abstract generateUrl(): string;
}
