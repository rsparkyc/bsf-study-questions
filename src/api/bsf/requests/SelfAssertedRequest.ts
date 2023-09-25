import { AxiosResponse, Method } from 'axios';
import AuthContext from '../AuthContext';
import { BsfRequest } from './BsfRequest';

export class SelfAssertedRequest extends BsfRequest<string> {
    constructor(protected authContext: AuthContext, /* other dependencies */) {
        super(authContext);
    }

    protected getRequestMethod(): Method {
        return 'POST';
    }

    protected addAdditionalHeaders(headers: Record<string, string>): void {
        headers["x-csrf-token"] = this.authContext.csrf!;
        headers["content-type"] = "application/x-www-form-urlencoded; charset=UTF-8";
    }

    protected getRequestBody(): string | null {
        return "request_type=RESPONSE&signInName=" + this.authContext.credentials.email +
            "&password=" + this.authContext.credentials.password;
    }

    protected processResponse(response: AxiosResponse): void {
        const cookiesToUse: Record<string, string> = {};

        debugger;
        // lets use any cookies we got in this request
        let currentRequestCookies = this.extractCookies(response);

        if (currentRequestCookies) {
            Object.keys(currentRequestCookies).forEach((key) => {
                cookiesToUse[key] = currentRequestCookies[key];
            });
        }

        if (this.authContext.cookies) {
            Object.keys(this.authContext.cookies).forEach((key) => {
                if (key.startsWith('x-ms-cpim')) {
                    cookiesToUse[key] = currentRequestCookies[key];
                }
            });
        }

    }

    protected generateUrl(): string {
        const url = "https://login.mybsf.org/bsfmcaiamprod.onmicrosoft.com/B2C_1A_SignUpOrSignin/SelfAsserted?" +
            "tx=StateProperties=" + this.authContext.state +
            "&p=B2C_1A_SignUpOrSignin";
        return url;

    }
}
