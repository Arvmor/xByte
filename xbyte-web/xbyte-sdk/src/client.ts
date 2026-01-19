import { ApiResponse, Client, RegisterRequest, SetPriceRequest } from "./types";

const DEFAULT_XBYTE_URL = "https://api.xbyte.sh";

/**
 * The client for the xByte API
 */
export class xByteClient {
    private readonly xbyteUrl: string;

    /**
     * Create a new xByteClient
     * @param xbyteUrl The URL of the xByte API
     */
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

    /**
     * Get the version of the xByte API
     * @returns The version of the xByte API
     */
    async version(): Promise<ApiResponse<string, string>> {
        return this.request("/");
    }

    /**
     * Set the price of an object
     * @param request The request to set the price
     * @returns The response from the xByte API
     */
    async setPrice(request: SetPriceRequest): Promise<ApiResponse<string, string>> {
        const options: RequestInit = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        };

        return this.request("/price", options);
    }

    /**
     * Get the price of an object
     * @param bucket The bucket to get the price from
     * @param object The object to get the price from
     * @returns The price of the object
     */
    async getPrice(bucket: string, object: string): Promise<ApiResponse<number, string>> {
        return this.request(`/price/${bucket}/${object}`);
    }

    /**
     * Create a new client
     * @param request The request to create a client
     * @returns The response from the xByte API
     */
    async createClient(request: Client): Promise<ApiResponse<Client, string>> {
        const options: RequestInit = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        };

        return this.request("/client", options);
    }

    /**
     * Get a client by id
     * @param id The id of the client
     * @returns The response from the xByte API
     */
    async getClient(id: string): Promise<ApiResponse<Client, string>> {
        return this.request(`/client/${id}`);
    }

    /**
     * Get all buckets
     * @returns The response from the xByte API
     */
    async getAllBuckets(): Promise<ApiResponse<string[], string>> {
        return this.request("/s3/bucket");
    }

    /**
     * Get all objects in a bucket
     * @param bucket The bucket to get the objects from
     * @returns The response from the xByte API
     */
    async getAllObjects(bucket: string): Promise<ApiResponse<string[], string>> {
        return this.request(`/s3/bucket/${bucket}/objects`);
    }

    /**
     * Register storage for a client
     * @param request The request to register storage
     * @returns The response from the xByte API
     */
    async registerStorage(request: RegisterRequest): Promise<ApiResponse<string, string>> {
        const options: RequestInit = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        };

        return this.request("/s3/register", options);
    }
}
