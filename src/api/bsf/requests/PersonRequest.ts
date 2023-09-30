import PersonResponse from '../response/PersonResponse'
import AuthContext from '../AuthContext';
import { BsfProxiedRequest } from './auth/BsfProxiedRequest';

export class PersonRequest extends BsfProxiedRequest<PersonResponse> {
  constructor(protected authContext: AuthContext) {
    super(authContext);
  }

  protected processResponse(response: any): void {
    debugger;
  }

  protected addAdditionalHeaders(headers: Record<string, string>): void {
    headers.Authorization = 'Bearer ' + this.authContext.accessToken?.access_token;
  }

  protected generateUrl(): string {
    return "https://bsf-mca-mybsf-api-prod.apibsfinternational.org/api/person";
  }
}
