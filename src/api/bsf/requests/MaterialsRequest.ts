import AuthContext from "../AuthContext";
import { BsfProxiedRequest } from "./auth/BsfProxiedRequest";
import { Method } from "axios";

export class MaterialsRequest extends BsfProxiedRequest<Array<Material>> {
    private lessonId: number;

    constructor(protected authContext: AuthContext, lessonId: number) {
        super(authContext);
        this.lessonId = lessonId;
    }

    protected getRequestMethod(): Method {
        return "POST";
    }

    protected addAdditionalHeaders(headers: Record<string, string>): void {
        headers["Content-Type"] = "application/json";
    }

    protected getRequestBody(): string | null {
        const body = {
            audioLanguageId: 1,
            writtenLanguageId: 1,
            lessonId: this.lessonId,
        };
        return JSON.stringify(body);
    }

    protected generateUrl(): string {
        return "https://bsf-mca-lesson-api-prod.apibsfinternational.org/service/v1/lesson/materials";
    }
}
