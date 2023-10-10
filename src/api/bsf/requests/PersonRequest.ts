import AuthContext from '../AuthContext';
import { AxiosResponse } from 'axios';
import { BsfProxiedRequest } from './auth/BsfProxiedRequest';
import PersonResponse from '../response/PersonResponse'

export class PersonRequest extends BsfProxiedRequest<PersonResponse> {
  constructor(protected authContext: AuthContext) {
    super(authContext);
  }

  protected processResponse(response: AxiosResponse<PersonResponse, any>): void {
    this.authContext.personId = response.data.personId;
  }

  protected generateUrl(): string {
    return "https://bsf-mca-mybsf-api-prod.apibsfinternational.org/api/person";
  }
}
