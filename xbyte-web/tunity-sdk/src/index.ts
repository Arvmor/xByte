import { UUID } from "crypto";
import { ApiResponse, PlayRequest, SetPriceRequest, X402PaymentPayload } from "./types";

/** The default Tunity URL */
const DEFAULT_TUNITY_URL = "http://localhost:80";

export class TunityClient {
  private readonly tunityUrl: string;

  constructor(tunityUrl?: string) {
    this.tunityUrl = tunityUrl ?? DEFAULT_TUNITY_URL;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.tunityUrl}${endpoint}`, options);
    return response.json()
  }

  async health(): Promise<ApiResponse<string, string>> {
    return this.request("/health");
  }

  async version(): Promise<ApiResponse<string, string>> {
    return this.request("/");
  }

  async play(
    body: PlayRequest,
    payment: X402PaymentPayload
  ): Promise<ApiResponse<number[], X402PaymentPayload>> {
    const paymentHeader = btoa(JSON.stringify(payment));
    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Payment": paymentHeader,
      },
      body: JSON.stringify(body),
    };

    return this.request("/play", options);
  }

  async uploadContent(content: Blob | File): Promise<ApiResponse<UUID, string>> {
    const formData = new FormData();
    formData.append("content", content);

    const options: RequestInit = {
      method: "POST",
      body: formData,
    };

    return this.request("/content", options);
  }

  async setPrice(price: SetPriceRequest): Promise<ApiResponse<string, string>> {
    const options: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(price),
    };

    return this.request("/price", options);
  }

  async getPrice(key: string): Promise<ApiResponse<string, string>> {
    return this.request(`/price/${key}`);
  }
}
