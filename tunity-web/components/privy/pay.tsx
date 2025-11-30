"use client"

import { useX402Fetch } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";

/** The pay component props */
export interface PayProps {
    /** The URL to fetch */
    url: string;
    /** The action label to perform */
    action: string;
    /** The amount to pay */
    maxValue: bigint;
    /** Callback to set the fetched data */
    setData?: (data: any) => void;
}

export default function XPay({ url, action, maxValue, setData }: PayProps) {
    const {wrapFetchWithPayment} = useX402Fetch();

    /** Fetch the premium content */
    async function fetchPremiumContent() {
        const fetchWithPayment = wrapFetchWithPayment({fetch, maxValue});

        const response = await fetchWithPayment(url);
        const data = await response.json();

        setData?.(data);
    }
    
    return <Button onClick={fetchPremiumContent}>{action}</Button>;
}