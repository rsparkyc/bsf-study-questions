import AnswersResponse from '../response/AnswersResponse'
import AuthContext from '../AuthContext';
import { BsfProxiedRequest } from './auth/BsfProxiedRequest';

export class AnswersRequest extends BsfProxiedRequest<AnswersResponse> {
  constructor(protected authContext: AuthContext) {
    super(authContext);
  }

  protected generateUrl(): string {
    return "https://bsf-mca-lessonday-api-prod.apibsfinternational.org/api/lessons/questions/answers";
  }
}
