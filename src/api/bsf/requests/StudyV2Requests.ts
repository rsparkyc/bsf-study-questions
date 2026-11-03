// v2 per-study endpoints (discovered from the official BSF app). These are
// called directly: the lessonday API allows any origin via CORS.

import AuthContext from "../AuthContext";
import { BsfRequest } from "./BsfRequest";
import {
    LessonIndexResponse,
    StudyLessonContentResponse,
    StudyScriptureResponse,
    StudyScriptureVersionResponse,
} from "../response/StudyV2Responses";

const BASE = "https://bsf-mca-lessonday-api-prod.apibsfinternational.org/api/v2/study";

export class LessonIndexRequest extends BsfRequest<LessonIndexResponse> {
    protected generateUrl(): string {
        return `${BASE}/lesson-index?locale=en`;
    }
}

export class StudyLessonContentRequest extends BsfRequest<StudyLessonContentResponse> {
    constructor(authContext: AuthContext, private studyId: number) {
        super(authContext);
    }
    protected generateUrl(): string {
        return `${BASE}/${this.studyId}/lesson-content?locale=en`;
    }
}

export class StudyScriptureVersionRequest extends BsfRequest<StudyScriptureVersionResponse> {
    constructor(authContext: AuthContext, private studyId: number) {
        super(authContext);
    }
    protected generateUrl(): string {
        return `${BASE}/${this.studyId}/scripture/version?locale=en`;
    }
}

export class StudyScriptureRequest extends BsfRequest<StudyScriptureResponse> {
    constructor(authContext: AuthContext, private studyId: number) {
        super(authContext);
    }
    protected generateUrl(): string {
        return `${BASE}/${this.studyId}/scripture?locale=en`;
    }
}
