import { UUID } from "crypto";

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
    id?: UUID;
    name: string;
    wallet: string;
}

/**
 * The response from xByte API
 * @template T - The type of the data
 * @template E - The type of the error
 */
export interface ApiResponse<T, E> {
    /** The status of the response */
    status: "Success" | "Error" | "PaymentRequired";
    /** The data of the response */
    data: T | E;
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
