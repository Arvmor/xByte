import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Payout & Withdrawals",
    description:
        "View your vault balances, payment history, and withdraw earnings from your xByte vault.",
};

export default function PayoutLayout({ children }: { children: React.ReactNode }) {
    return children;
}
