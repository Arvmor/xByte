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