import AllLessonsResponse from '../response/AllLessonsResponse'
import AuthContext from '../AuthContext';
import { BsfProxiedRequest } from './auth/BsfProxiedRequest';

export class AllLessonsRequest extends BsfProxiedRequest<AllLessonsResponse> {
  constructor(protected authContext: AuthContext) {
    super(authContext);
  }

  protected processResponse(response: any): void {
    debugger;
  }

  protected generateUrl(): string {
    return "https://bsf-mca-lessonday-api-prod.apibsfinternational.org/api/lessons/all?locale=en";
  }
}
