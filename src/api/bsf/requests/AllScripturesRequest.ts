import AllScripturesResponse from '../response/AllScripturesResponse';
import AuthContext from '../AuthContext';
import { BsfRequest } from './BsfRequest';

export class AllScripturesRequest extends BsfRequest<AllScripturesResponse> {
  constructor(protected authContext: AuthContext) {
    super(authContext);
  }

  protected generateUrl(): string {
    return "https://bsf-mca-lessonday-api-prod.apibsfinternational.org/api/lessons/scriptures/contents?locale=en"
  }
}
