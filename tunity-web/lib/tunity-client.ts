export interface TunityConfig {
  baseUrl: string;
  timeout?: number;
}

export interface PlayRequest {
  file: string;
  offset: number;
  length: number;
}

export interface PlayResponse {
  data: number[];
}

export interface SetPriceRequest {
  price: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface X402PaymentPayload {
  x402Version: number;
  scheme: string;
  network: string;
  payload: {
    signature: string;
    authorization: {
      from: string;
      to: string;
      value: string;
      validAfter: string;
      validBefore: string;
      nonce: string;
    };
  };
}

class TunityClientBuilder {
  private config: Partial<TunityConfig> = {};

  baseUrl(url: string): this {
    this.config.baseUrl = url.replace(/\/$/, "");
    return this;
  }

  timeout(ms: number): this {
    this.config.timeout = ms;
    return this;
  }

  build(): TunityClient {
    if (!this.config.baseUrl) {
      throw new Error("baseUrl is required");
    }
    return new TunityClient(this.config as TunityConfig);
  }
}

export class TunityClient {
  private readonly config: TunityConfig;

  constructor(config: TunityConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };
  }

  static builder(): TunityClientBuilder {
    return new TunityClientBuilder();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.timeout
    );

    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        return { success: false, message: json.data || response.statusText };
      }

      if (json.status === "Success") {
        return { success: true, data: json.data };
      }

      return { success: false, message: json.data || "Unknown error" };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, message };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async health(): Promise<ApiResponse<string>> {
    return this.request<string>("/health");
  }

  async version(): Promise<ApiResponse<string>> {
    return this.request<string>("/");
  }

  async play(
    request: PlayRequest,
    payment: X402PaymentPayload
  ): Promise<ApiResponse<PlayResponse>> {
    const paymentHeader = btoa(JSON.stringify(payment));

    return this.request<PlayResponse>("/play", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Payment": paymentHeader,
      },
      body: JSON.stringify(request),
    });
  }

  async uploadContent(content: Blob | File): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append("content", content);

    return this.request<string>("/content", {
      method: "POST",
      body: formData,
    });
  }

  async setPrice(price: string): Promise<ApiResponse<string>> {
    return this.request<string>("/price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price } satisfies SetPriceRequest),
    });
  }

  async getPrice(key: string): Promise<ApiResponse<string>> {
    return this.request<string>(`/price/${encodeURIComponent(key)}`);
  }
}
