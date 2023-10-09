import AuthContext from '../AuthContext';
import { BsfProxiedRequest } from './auth/BsfProxiedRequest';
import PersonResponse from '../response/PersonResponse'

export class PersonRequest extends BsfProxiedRequest<PersonResponse> {
  constructor(protected authContext: AuthContext) {
    super(authContext);
  }

  protected generateUrl(): string {
    return "https://bsf-mca-mybsf-api-prod.apibsfinternational.org/api/person";
  }
}
