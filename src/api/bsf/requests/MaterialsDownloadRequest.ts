import AuthContext from "../AuthContext";
import { BsfProxiedRequest } from "./auth/BsfProxiedRequest";
import { Method } from "axios";

export class MaterialsDownloadRequest extends BsfProxiedRequest<MaterialUrl> {
    private materialId: number;

    constructor(protected authContext: AuthContext, materialId: number) {
        super(authContext);
        this.materialId = materialId;
    }

    protected getRequestMethod(): Method {
        return "POST";
    }

    protected addAdditionalHeaders(headers: Record<string, string>): void {
        headers["Content-Type"] = "application/json";
    }

    protected getRequestBody(): string | null {
        const body = {
            languageId: 1,
            materialAccessTypeId: 1,
            seriesNumber: 1,
            materialId: this.materialId,
        };
        return JSON.stringify(body);
    }

    protected generateUrl(): string {
        return "https://bsf-mca-lesson-api-prod.apibsfinternational.org/service/v1/lesson/download";
    }
}
