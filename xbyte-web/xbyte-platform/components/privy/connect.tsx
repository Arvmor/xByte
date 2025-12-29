"use client";

import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";

export default function Connect() {
    const { connectOrCreateWallet } = usePrivy();

    return <Button onClick={connectOrCreateWallet}>Login</Button>;
}
