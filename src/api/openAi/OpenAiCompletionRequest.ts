import axios, { AxiosResponse, Method } from 'axios';

type MyAxiosRequestConfig = {
  url: string;
  method: Method | string; // Import Method from axios if you haven't
  headers?: Record<string, string>;
  data: string | null | MyAxiosRequestConfig;
};

export class OpenAiCompletionRequest {

    private getRequestOptions(requset: ConversationConfig):MyAxiosRequestConfig {
        const headers = this.getHeaders();

        const requestOptions = {
            url: this.generateUrl(),
            method: this.getRequestMethod(),
            headers,
            data: JSON.stringify(requset)
        };
        
        return requestOptions;
    }

    public async makeRequest(request: ConversationConfig): Promise<ChatCompletion> {
        const requestOptions = this.getRequestOptions(request);

        const response: AxiosResponse<ChatCompletion> = await axios(requestOptions);

        return response.data;
    }

    private getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {};
        headers['Authorization'] = `Bearer ${this.openAiAccessToken}`;
        headers['Content-Type'] = 'application/json';
        return headers;
    }


    protected getRequestMethod(): Method {
        return 'POST';
    }

    protected generateUrl(): string {
        return "https://api.openai.com/v1/chat/completions";
    };
}

export type Role = "system" | "user" | "assistant";

export interface Message {
    role: Role;
    content: string;
}

export interface ConversationConfig {
    messages: Message[];
    max_tokens: number;
    n: number;
    stop: string[];
    model: string;
}

export interface Choice {
    index: number;
    message: Message;
    finish_reason: string; // This could be an enum if there's a fixed set of reasons.
}

export interface Usage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}

export interface ChatCompletion {
    id: string;
    object: string; // This could be an enum if there's a fixed set of object types.
    created: number; // Assuming it's a Unix timestamp.
    model: string;
    choices: Choice[];
    usage: Usage;
}

