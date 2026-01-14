"use client";

import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { Wallet } from "lucide-react";

export default function ConnectPanel() {
    const { authenticated } = usePrivy();

    return authenticated ? <Disconnect /> : <Connect />;
}

export function Connect() {
    const { login } = usePrivy();

    return <Button onClick={login}>Login</Button>;
}

export function Disconnect() {
    const { logout } = usePrivy();

    return <Button onClick={logout}>Logout</Button>;
}

export function NoWalletAlert() {
    const noWalletAlert = {
        title: "Wallet Not Connected",
        message: "Please connect your wallet to continue.",
    };

    return (
        <div className="space-y-4 text-center py-8">
            <Wallet className="size-12 mx-auto text-muted-foreground" />
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">{noWalletAlert.title}</h3>
                <p className="text-muted-foreground">{noWalletAlert.message}</p>
            </div>
        </div>
    );
}
