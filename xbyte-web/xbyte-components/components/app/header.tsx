"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Copy, Home, LogOut, User2, X } from "lucide-react";
import { usePrivy, User } from "@privy-io/react-auth";
import { xByteEvmClient } from "xbyte-sdk";
import { formatFromDecimals } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertTitle } from "@/components/ui/alert";

const xbyteEvmClient = new xByteEvmClient(process.env.NEXT_PUBLIC_RPC_URL);

const MESSAGE_USDC_REQUIRED = (
    <p className="space-x-1">
        <span>Demo requires Base Sepolia testnet USDC.</span>
        <Link
            href="https://faucet.circle.com/"
            target="_blank"
            className="underline underline-offset-3"
        >
            Claim here
        </Link>
    </p>
);

function getBalance(
    client: xByteEvmClient,
    setBalance: (balance: string) => void,
    address: string,
    token: string,
    decimals: bigint,
) {
    client
        .getVaultERC20Balance(address as `0x${string}`, token as `0x${string}`)
        .then((balance) => {
            setBalance(formatFromDecimals(balance, decimals));
        })
        .catch(() => {
            setBalance("N/A");
        });
}

/** The header component for the app */
export default function AppHeader() {
    const { authenticated, user, login } = usePrivy();
    const [balance, setBalance] = useState<string>("...");

    useEffect(() => {
        if (!user?.wallet?.address || !process.env.NEXT_PUBLIC_USDC_ADDRESS) return;
        getBalance(
            xbyteEvmClient,
            setBalance,
            user.wallet.address,
            process.env.NEXT_PUBLIC_USDC_ADDRESS,
            6n,
        );
    }, [user?.wallet?.address]);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            {/* App Alert */}
            <AppAlert message={MESSAGE_USDC_REQUIRED} isHidden={balance !== "0"} />

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
                        {authenticated && user && <UserInfo user={user} balance={balance} />}
                        {!authenticated && <Onboarding onClick={login} />}
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

function AppAlert({ message, isHidden }: { message: React.ReactNode; isHidden: boolean }) {
    const [hidden, setHidden] = useState(isHidden);

    useEffect(() => {
        setHidden(isHidden);
    }, [isHidden]);

    return (
        <Alert className="rounded-none" hidden={hidden}>
            <X className="size-4" onClick={() => setHidden(true)} />
            <AlertTitle className="flex items-center justify-center gap-2">
                <AlertCircle className="size-4" />
                {message}
            </AlertTitle>
        </Alert>
    );
}

/** The user info component for the app */
function UserInfo({ user, balance }: { user: User; balance: string }) {
    const { logout } = usePrivy();
    const address = user.wallet?.address as `0x${string}` | undefined;
    const shortAddress = address ? `${address.slice(0, 8)}...${address.slice(-8)}` : "";

    /** Handle the copy of the address */
    const handleCopy = async () => {
        if (!address) return;
        await navigator.clipboard.writeText(address);
    };

    return (
        <div className="flex items-center gap-2">
            {/* Address */}
            <div
                className="hidden sm:flex bg-accent px-3 py-2 rounded-md items-center gap-2 hover:bg-accent/80 transition-colors cursor-pointer group"
                onClick={handleCopy}
            >
                <Copy className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <p className="text-sm font-mono">{shortAddress}</p>
            </div>
            {/* Avatar with Popover */}
            <Popover>
                <PopoverTrigger asChild>
                    <div className="size-9 sm:size-10 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors cursor-pointer">
                        <User2 className="size-4 sm:size-5" />
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-40 flex flex-col gap-4" align="end">
                    {/* Faucet Link */}
                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-semibold">Base Faucet</p>
                        <Link
                            href="https://faucet.circle.com/"
                            target="_blank"
                            className="text-xs text-muted-foreground underline underline-offset-3 hover:text-foreground"
                        >
                            Testnet USDC Faucet
                        </Link>
                    </div>
                    {/* USDC Balance */}
                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-semibold">Balance</p>
                        <p className="text-sm text-muted-foreground">{balance} USDC</p>
                    </div>
                    {/* Logout Button */}
                    <Button variant="secondary" onClick={logout} className="w-full">
                        <LogOut className="size-4" />
                        Logout
                    </Button>
                </PopoverContent>
            </Popover>
        </div>
    );
}
