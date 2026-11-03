import AnswersResponse from '../response/AnswersResponse'
import AuthContext from '../AuthContext';
import { BsfRequest } from './BsfRequest';

export class AnswersRequest extends BsfRequest<AnswersResponse> {
  constructor(protected authContext: AuthContext) {
    super(authContext);
  }

  protected generateUrl(): string {
    return "https://bsf-mca-lessonday-api-prod.apibsfinternational.org/api/lessons/questions/answers";
  }
}
