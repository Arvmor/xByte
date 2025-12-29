"use client";

import { createContext, Suspense, useContext, useMemo } from "react";
import { useX402Fetch, UseX402Fetch } from "@privy-io/react-auth";

/** The pay component props */
export interface PayProps {
    /** The URL to fetch */
    url: string;
    /** The Fetch body */
    body: RequestInit;
    /** The amount to pay */
    maxValue: bigint;
}

/** The XPay context */
const XPayContext = createContext<UseX402Fetch | null>(null);

/** The XPay wrapper component, to be used for `useXPayAsync` */
export default function XPay({ children }: { children: React.ReactNode }) {
    const { wrapFetchWithPayment } = useX402Fetch();
    const value = useMemo(() => ({ wrapFetchWithPayment }), [wrapFetchWithPayment]);

    return (
        <XPayContext.Provider value={value}>
            <Suspense fallback={null}>{children}</Suspense>
        </XPayContext.Provider>
    );
}

/** The async XPay function */
export function useXPayAsync() {
    const context = useContext(XPayContext);
    if (!context) {
        throw new Error("useXPayAsync must be used within XPay component");
    }

    return async function XPayAsync({ url, body, maxValue }: PayProps) {
        const fetchWithPayment = context.wrapFetchWithPayment({ fetch, maxValue });

        const response = await fetchWithPayment(url, body);
        return response.json();
    };
}
