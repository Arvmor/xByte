export type Storage = {
    s3: {
        roleArn: string;
        region: string;
    };
};

export interface RegisterRequest {
    storage: Storage;
    client: string;
}

export interface SetPriceRequest {
    bucket: string;
    object: string;
    price: number;
}

export interface RangeRequest {
    offset: number;
    length: number;
}

export interface Client {
    id?: string;
    name: string;
    wallet: string;
    vault?: string;
    storage?: Storage;
}

/**
 * The response from xByte API
 * @template T - The type of the data
 * @template E - The type of the error
 */
export type ApiResponse<T, E> =
    | { status: "Success"; data: T }
    | { status: "Error" | "PaymentRequired"; data: E };

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
