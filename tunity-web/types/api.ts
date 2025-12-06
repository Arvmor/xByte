/**
 * The response from Tunity API
 * @template T - The type of the data
 * @template E - The type of the error
 */
export interface ApiResponse<T, E> {  
    /** The status of the response */
    status: "Success" | "Error" | "PaymentRequired";
    /** The data of the response */
    data?: T;
    /** The error of the response */
    error?: E;
}

/**
 * The request to play a sample
 */
export interface PlayRequest {
    /** The file to play */
    file: string;
    /** The offset to start playing from */
    offset: number;
    /** The length of the sample to play */
    length: number;
}