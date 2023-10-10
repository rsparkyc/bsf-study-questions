import AuthContext from '../AuthContext';
import { BsfRequest } from './BsfRequest';
import { Method } from 'axios';

export class SaveQuestionRequest extends BsfRequest<string> {
    
    constructor(protected authContext: AuthContext, private questionId: number, private answerText: string) {
        super(authContext);
    }

    protected getRequestMethod(): Method {
        return 'POST';
    }

    protected addAdditionalHeaders(headers: Record<string, string>): void {
        headers['Content-Type'] = 'application/json';
    }

    protected getRequestBody(): string | null {
        const body = [{
            answerText: this.answerText,
            delete: false,
            lessonDayQuestionId: this.questionId,
            modificationTimeUtc: new Date().toISOString(),
            personId: this.authContext.personId
        }];
        return JSON.stringify(body);
    }

    protected generateUrl(): string {
        return 'https://bsf-mca-lessonday-api-prod.apibsfinternational.org/api/lessons/questions/answers';
    }
}
