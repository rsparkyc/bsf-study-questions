import AuthContext from '../AuthContext';
import { AxiosResponse } from 'axios';
import { BsfProxiedRequest } from './auth/BsfProxiedRequest';

// We only need the personId. /api/person returns it too, but bundles ~1.1 MB of
// classPositions; account/user is ~10 KB. This host has no CORS, so it stays proxied.
interface AccountUserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export class PersonRequest extends BsfProxiedRequest<AccountUserResponse> {
  constructor(protected authContext: AuthContext) {
    super(authContext);
  }

  protected processResponse(response: AxiosResponse<AccountUserResponse, any>): void {
    this.authContext.personId = response.data.id;
  }

  protected generateUrl(): string {
    return "https://bsf-mca-mybsf-api-prod.apibsfinternational.org/service/v1/account/user";
  }
}
