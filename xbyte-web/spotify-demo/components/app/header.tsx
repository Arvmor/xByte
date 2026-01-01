"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Home, User2 } from "lucide-react";
import { usePrivy, User } from "@privy-io/react-auth";
import { xByteEvmClient } from "xbyte-sdk";
import { formatFromDecimals } from "@/lib/utils";

const xbyteEvmClient = new xByteEvmClient(process.env.NEXT_PUBLIC_RPC_URL);

/** The header component for the app */
export default function AppHeader() {
    const { authenticated, user, connectOrCreateWallet } = usePrivy();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <h2 className="text-xl sm:text-2xl font-bold transition-colors hover:text-primary">
                            Spotify x Netflix
                        </h2>
                    </Link>

                    {/* Search bar and navigation */}
                    <div className="flex flex-1 items-center justify-center gap-2 max-w-md mx-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="hidden sm:flex">
                                <Home className="size-4" />
                            </Button>
                        </Link>
                        <Input
                            placeholder="What do you want to play?"
                            className="w-full hidden sm:flex"
                        />
                    </div>

                    {/* User info*/}
                    <div className="flex items-center">
                        {authenticated && user && <UserInfo user={user} />}
                        {!authenticated && <Onboarding onClick={connectOrCreateWallet} />}
                    </div>
                </div>
            </div>
        </header>
    );
}

/** The onboarding component for the app */
function Onboarding({ onClick }: { onClick: () => void }) {
    return (
        <div className="flex gap-2">
            <Button variant="ghost" onClick={onClick} className="hidden sm:flex">
                Sign up
            </Button>
            <Button variant="default" onClick={onClick} size="sm">
                Login
            </Button>
        </div>
    );
}

/** The user info component for the app */
function UserInfo({ user }: { user: User }) {
    const address = user.wallet?.address as `0x${string}` | undefined;
    const shortAddress = address ? `${address.slice(0, 8)}...${address.slice(-8)}` : "";
    const [usdcBalance, setUsdcBalance] = useState<string>("0");
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);

    useEffect(() => {
        if (!address) return;

        setIsLoadingBalance(true);
        xbyteEvmClient
            .getVaultERC20Balance(address, process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`)
            .then((balance: bigint) => {
                const formatted = formatFromDecimals(balance, 6n);
                setUsdcBalance(formatted);
            })
            .catch(() => {
                setUsdcBalance("0");
            })
            .finally(() => {
                setIsLoadingBalance(false);
            });
    }, [address]);

    /** Handle the copy of the address */
    const handleCopy = async () => {
        if (!address) return;
        await navigator.clipboard.writeText(address);
    };

    return (
        <div className="flex items-center gap-2">
            {/* USDC Balance */}
            {address && (
                <div className="hidden sm:flex bg-accent px-3 py-2 rounded-md items-center gap-2">
                    <p className="text-sm font-medium">
                        {isLoadingBalance ? "..." : usdcBalance} USDC
                    </p>
                </div>
            )}
            {/* Address */}
            <div className="hidden sm:flex bg-accent px-3 py-2 rounded-md items-center gap-2 hover:bg-accent/80 transition-colors cursor-pointer group">
                <Copy
                    className="size-4 text-muted-foreground group-hover:text-foreground transition-colors"
                    onClick={handleCopy}
                />
                <p className="text-sm font-mono">{shortAddress}</p>
            </div>
            {/* Avatar */}
            <div className="size-9 sm:size-10 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors cursor-pointer">
                <User2 className="size-4 sm:size-5" />
            </div>
        </div>
    );
}
