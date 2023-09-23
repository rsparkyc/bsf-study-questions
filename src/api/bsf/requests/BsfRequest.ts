import axios, { AxiosResponse, Method } from 'axios';
import AuthContext from '../AuthContext';


export abstract class BsfRequest<T> {
  protected authContext: AuthContext;

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
    this.processResponse(response);
    return response.data;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.authContext.cookies) {
      headers['Cookie'] = this.authContext.cookies.join('; ');
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
