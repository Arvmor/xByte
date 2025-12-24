import {
    ApiResponse,
    Client,
    SetPriceRequest,
} from "./types";

const DEFAULT_XBYTE_URL = "http://localhost:80";

export class xByteClient {
    private readonly xbyteUrl: string;

    constructor(xbyteUrl?: string) {
        this.xbyteUrl = xbyteUrl ?? DEFAULT_XBYTE_URL;
    }

    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const response = await fetch(`${this.xbyteUrl}${endpoint}`, options);
        return response.json();
    }

    async health(): Promise<ApiResponse<string, string>> {
        return this.request("/health");
    }

    async version(): Promise<ApiResponse<string, string>> {
        return this.request("/");
    }

    async setPrice(request: SetPriceRequest): Promise<ApiResponse<string, string>> {
        const options: RequestInit = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        };

        return this.request("/price", options);
    }

    async getPrice(bucket: string, object: string): Promise<ApiResponse<number, string>> {
        return this.request(`/price/${bucket}/${object}`);
    }

    async createClient(request: Client): Promise<ApiResponse<Client, string>> {
        const options: RequestInit = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        };

        return this.request("/client", options);
    }

    async getClient(id: string): Promise<ApiResponse<Client, string>> {
        return this.request(`/client/${id}`);
    }

    async getAllBuckets(): Promise<ApiResponse<string[], string>> {
        return this.request("/s3/bucket");
    }

    async getAllObjects(bucket: string): Promise<ApiResponse<string[], string>> {
        return this.request(`/s3/bucket/${bucket}/objects`);
    }
}
