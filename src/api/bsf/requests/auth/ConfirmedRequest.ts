import { AxiosResponse } from 'axios';
import AuthContext from '../../AuthContext';
import { BsfProxiedRequest } from './BsfProxiedRequest';

export class ConfirmedRequest extends BsfProxiedRequest<string> {
    constructor(protected authContext: AuthContext, /* other dependencies */) {
        super(authContext);
    }

    protected processResponse(response: AxiosResponse): void {
        const location: string = response.headers.location;
        const locationParts = location.split('&');
        for (const part of locationParts) {
            if (part.startsWith('code=')) {
                this.authContext.code = part.replace('code=', '');
            }
        }

    }

    protected generateUrl(): string {
        return "https://login.mybsf.org/bsfmcaiamprod.onmicrosoft.com/B2C_1A_SignUpOrSignin/api/CombinedSigninAndSignup/confirmed?rememberMe=false&csrf_token=" +
            this.authContext.csrf +
            "&tx=StateProperties=" + this.authContext.state +
            "&p=B2C_1A_SignUpOrSignin";
    }
}
