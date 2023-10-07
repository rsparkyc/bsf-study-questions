import { AxiosResponse, Method } from 'axios';
import AuthContext from '../../AuthContext';
import { TokenRequest } from './TokenRequest';

export class RefreshTokenRequest extends TokenRequest {
    constructor(protected authContext: AuthContext) {
        super(authContext);
    }

    protected generateUrl(): string {
        return "https://login.mybsf.org/bsfmcaiamprod.onmicrosoft.com/b2c_1a_signuporsignin/oauth2/v2.0/token" +
            "?client_id=" + this.authContext.clientId + "&" +
            "grant_type=refresh_token&" +
            "refresh_token=" + this.authContext.accessToken?.refresh_token;
    }
}
