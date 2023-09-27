import { AxiosResponse, Method } from 'axios';
import AuthContext from '../AuthContext';
import { BsfRequest } from './BsfRequest';

export class ConfirmedRequest extends BsfRequest<string> {
    constructor(protected authContext: AuthContext, /* other dependencies */) {
        super(authContext);
    }

    protected processResponse(response: AxiosResponse): void {
        debugger;

    }

    protected generateUrl(): string {
        return "https://login.mybsf.org/bsfmcaiamprod.onmicrosoft.com/B2C_1A_SignUpOrSignin/api/CombinedSigninAndSignup/confirmed?rememberMe=false&csrf_token=" +
        this.authContext.csrf +
        "&tx=StateProperties=" + this.authContext.state +
        "&p=B2C_1A_SignUpOrSignin";
    }
}
