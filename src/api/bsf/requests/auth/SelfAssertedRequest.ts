import { AxiosResponse, Method } from 'axios';
import AuthContext from '../../AuthContext';
import { BsfProxiedRequest } from './BsfProxiedRequest';

export class SelfAssertedRequest extends BsfProxiedRequest<string> {
    constructor(protected authContext: AuthContext) {
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
        const newCookies: Record<string, string> = {};

        // let's use any cookies we got in this request
        let currentRequestCookies = this.extractCookies(response);

        if (currentRequestCookies) {
            Object.keys(currentRequestCookies).forEach((key) => {
                newCookies[key] = currentRequestCookies[key];
            });
        }

        if (this.authContext.cookies) {
            this.authContext.cookies.forEach((cookie) => {
                if (cookie.startsWith('x-ms-cpim-csrf')) {
                    const index = cookie.indexOf('=');
                    const key = cookie.substring(0, index);
                    const val = cookie.substring(index + 1).split(';')[0];
                    newCookies[key] = val;
                }
            });
        }

        let finalCookies: string[] = [];
        Object.keys(newCookies).forEach((key) => {
            finalCookies.push(key + "=" + newCookies[key]);
        });
        this.authContext.cookies = finalCookies;

    }

    protected generateUrl(): string {
        const url = "https://login.mybsf.org/bsfmcaiamprod.onmicrosoft.com/B2C_1A_SignUpOrSignin/SelfAsserted?" +
            "tx=StateProperties=" + this.authContext.state +
            "&p=B2C_1A_SignUpOrSignin";
        return url;

    }
}
