"use client";

import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";

export default function ConnectPanel() {
    const { authenticated } = usePrivy();

    return authenticated ? <Disconnect /> : <Connect />;
}

export function Connect() {
    const { connectOrCreateWallet } = usePrivy();

    return <Button onClick={connectOrCreateWallet}>Login</Button>;
}

export function Disconnect() {
    const { logout } = usePrivy();

    return <Button onClick={logout}>Logout</Button>;
}
