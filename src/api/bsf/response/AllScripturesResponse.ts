export interface ScriptureData {
    scriptureId: number;
    languageId: number;
    displayText: string | null;
    htmlContent: string;
    jsonContent: any | null; 
    name: string;
    longName: string;
    abbreviation: string;
}

export default interface AllScripturesResponse {
    data: Array<ScriptureData>;
    isSuccess: boolean;
    errorMsg: string | null;
    errorCode: string | null;
    version: number;
}
