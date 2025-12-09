"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Home, Upload, User2 } from "lucide-react";
import { usePrivy, User } from "@privy-io/react-auth";

/** The header component for the app */
export default function AppHeader() {
    const { user, connectOrCreateWallet } = usePrivy();

    return (
        <div className="flex p-4 justify-between">
            {/* Logo */}
            <Link href="/">
                <h2 className="text-2xl font-bold">Spotify x Netflix</h2>
            </Link>

            {/* Search bar */}
            <div className="flex gap-2">
                <Link href="/">
                    <Button variant="outline" size="icon"><Home /></Button>
                </Link>
                <Link href="/publish">
                    <Button variant="outline" size="icon"><Upload /></Button>
                </Link>
                <Input placeholder="What do you want to play?" />
            </div>

            {/* User info*/}
            {user ? <UserInfo user={user} /> : <Onboarding onClick={connectOrCreateWallet} />}
        </div>
    )
}

/** The onboarding component for the app */
function Onboarding({ onClick }: { onClick: () => void }) {
    return (
        <div className="flex gap-2">
            <Button variant="ghost" onClick={onClick}>Sign up</Button>
            <Button variant="outline" onClick={onClick}>Login</Button>
        </div>
    )
}

/** The user info component for the app */
function UserInfo({ user }: { user: User }) {
    const address = user.wallet?.address;
    const shortAddress = `${address?.slice(0, 8)}...${address?.slice(-8)}`;

    /** Handle the copy of the address */
    const handleCopy = () => {
        if (!address) return;
        navigator.clipboard.writeText(address);
    }

    return (
        <div className="flex items-center gap-2">
            {/* Address */}
            <div className="flex bg-accent px-3 py-2 rounded-md items-center gap-2">
                <Copy className="size-4" onClick={handleCopy} />
                <p className="text-sm">{shortAddress}</p>
            </div>
            {/* Avatar */}
            <div className="size-10 rounded-full bg-accent flex items-center justify-center">
                <User2 className="size-5" />
            </div>
        </div>
    )
}
