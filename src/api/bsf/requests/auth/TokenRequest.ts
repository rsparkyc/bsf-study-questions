import { AxiosResponse, Method } from 'axios';
import AuthContext from '../../AuthContext';
import { BsfProxiedRequest } from './BsfProxiedRequest';

export class TokenRequest extends BsfProxiedRequest<string> {
    constructor(protected authContext: AuthContext, /* other dependencies */) {
        super(authContext);
    }

    protected processResponse(response: AxiosResponse): void {
        this.authContext.accessToken = response.data;
    }

    protected getRequestMethod(): Method {
        return 'POST';
    }

    public makeRequest(): Promise<string> {
        this.authContext.cookies = [];
        return super.makeRequest();
    }

    protected generateUrl(): string {
        return "https://login.mybsf.org/bsfmcaiamprod.onmicrosoft.com/b2c_1a_signuporsignin/oauth2/v2.0/token" +
            "?client_id=" + this.authContext.clientId + "&" +
            "redirect_uri=https://www.mybsf.org/&" +
            "scope=" + this.authContext.scope + "&" +
            "code=" + this.authContext.code + "&" +
            "code_verifier=" + this.authContext.codeVerify + "&" +
            "grant_type=authorization_code&" +
            "client_info=1&" +
            "client-request-id=" + this.authContext.clientRequestId;

    }
}
