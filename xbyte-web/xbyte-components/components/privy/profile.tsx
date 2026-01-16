"use client";

import { useEffect, useState } from "react";
import { User } from "@privy-io/react-auth";
import { useXBytePrivy } from "@/hooks/useXBytePrivy";
import { User2, Copy, LogOut, Wallet, ExternalLink, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { xByteEvmClient } from "xbyte-sdk";
import { cn, formatFromDecimals } from "@/lib/utils";
import Link from "next/link";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const BASE_EXPLORER_URL = "https://sepolia.basescan.org/address";

interface ProfileState {
    vaultAddress: string;
    isVaultDeployed: boolean;
    vaultBalance: string;
    isLoading: boolean;
}

const initialState: ProfileState = {
    vaultAddress: "",
    isVaultDeployed: false,
    vaultBalance: "...",
    isLoading: true,
};

function truncateAddress(address: string): string {
    if (!address || address.length < 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function SectionLabel({ Icon, label }: { Icon: React.ElementType; label: string }) {
    return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon className="size-3" />
            <span>{label}</span>
        </div>
    );
}

function CopyableAddress({ address, label }: { address: string; label: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const CopyIcon = copied ? Check : Copy;
    const iconClass = cn(
        "size-3 shrink-0",
        copied ? "text-green-500" : "text-muted-foreground group-hover:text-primary",
    );

    return (
        <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <button
                onClick={handleCopy}
                className="flex items-center gap-2 text-sm font-mono hover:text-primary transition-colors w-full group"
            >
                <span className="truncate">{truncateAddress(address)}</span>
                <CopyIcon className={iconClass} />
            </button>
        </div>
    );
}

function ProfileHeader({ user }: { user: User }) {
    const displayName = user.email?.address ?? "xByte User";

    return (
        <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User2 className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground">Base Sepolia</p>
            </div>
        </div>
    );
}

function WalletSection({ address }: { address: string }) {
    return (
        <div className="space-y-3">
            <SectionLabel Icon={Wallet} label="Wallet" />
            <CopyableAddress address={address} label="Your Address" />
        </div>
    );
}

function VaultStatus({ isDeployed }: { isDeployed: boolean }) {
    const statusClass = cn(
        "text-xs px-2 py-1 rounded-full",
        isDeployed ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500",
    );
    const statusText = isDeployed ? "Active" : "Not Deployed";

    return <span className={statusClass}>{statusText}</span>;
}

function VaultBalance({ balance, isDeployed }: { balance: string; isDeployed: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-xs text-muted-foreground">USDC Balance</p>
                <p className="text-sm font-medium">{balance} USDC</p>
            </div>
            <VaultStatus isDeployed={isDeployed} />
        </div>
    );
}

function ExplorerLink({ address }: { address: string }) {
    return (
        <Link
            href={`${BASE_EXPLORER_URL}/${address}`}
            target="_blank"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
            <ExternalLink className="size-3" />
            View on Explorer
        </Link>
    );
}

function VaultInfo({ state }: { state: ProfileState }) {
    return (
        <div className="space-y-2">
            <CopyableAddress address={state.vaultAddress} label="Vault Address" />
            <VaultBalance balance={state.vaultBalance} isDeployed={state.isVaultDeployed} />
            {state.isVaultDeployed && <ExplorerLink address={state.vaultAddress} />}
        </div>
    );
}

function VaultSectionContent({ state }: { state: ProfileState }) {
    if (state.isLoading) {
        return <p className="text-sm text-muted-foreground">Loading...</p>;
    }

    if (!state.vaultAddress) {
        return (
            <Link href="/setup" className="text-sm text-primary hover:underline">
                Setup your vault
            </Link>
        );
    }

    return <VaultInfo state={state} />;
}

function VaultSection({ state }: { state: ProfileState }) {
    return (
        <div className="space-y-3">
            <SectionLabel Icon={Info} label="Information" />
            <VaultSectionContent state={state} />
        </div>
    );
}

function DisconnectButton() {
    const { logout } = useXBytePrivy();

    return (
        <Button variant="outline" onClick={logout} className="w-full">
            <LogOut className="size-4" />
            Disconnect
        </Button>
    );
}

function ProfileContent({ user, state }: { user: User; state: ProfileState }) {
    const walletAddress = user.wallet?.address ?? "";

    return (
        <div className="space-y-4">
            <ProfileHeader user={user} />
            <Separator />
            <WalletSection address={walletAddress} />
            <Separator />
            <VaultSection state={state} />
            <Separator />
            <DisconnectButton />
        </div>
    );
}

async function fetchVaultBalance(
    evmClient: xByteEvmClient,
    vaultAddress: `0x${string}`,
): Promise<string> {
    const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS;
    if (!usdcAddress) return "0";

    const rawBalance = await evmClient.getVaultERC20Balance(
        vaultAddress,
        usdcAddress as `0x${string}`,
    );
    return formatFromDecimals(rawBalance, 6n);
}

function useVaultInfo(walletAddress: string | undefined) {
    const [state, setState] = useState<ProfileState>(initialState);

    useEffect(() => {
        if (!walletAddress || !process.env.NEXT_PUBLIC_RPC_URL) {
            setState((prev) => ({ ...prev, isLoading: false }));
            return;
        }

        const fetchVaultInfo = async () => {
            const evmClient = new xByteEvmClient(process.env.NEXT_PUBLIC_RPC_URL);
            const typedAddress = walletAddress as `0x${string}`;

            try {
                const [computedVault, vault] = await Promise.all([
                    evmClient.getComputeVaultAddress(typedAddress),
                    evmClient.getVault(typedAddress),
                ]);

                const isDeployed = vault.some((v) => v !== ZERO_ADDRESS);
                const balance = isDeployed
                    ? await fetchVaultBalance(evmClient, computedVault)
                    : "0";

                setState({
                    vaultAddress: computedVault,
                    isVaultDeployed: isDeployed,
                    vaultBalance: balance,
                    isLoading: false,
                });
            } catch (error) {
                console.error("Failed to fetch vault info:", error);
                setState((prev) => ({ ...prev, isLoading: false }));
            }
        };

        fetchVaultInfo();
    }, [walletAddress]);

    return state;
}

export default function ProfilePopover() {
    const { authenticated, user, walletAddress } = useXBytePrivy();
    const state = useVaultInfo(walletAddress);

    if (!authenticated || !user) return null;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="size-9 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors">
                    <User2 className="size-4" />
                </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
                <ProfileContent user={user} state={state} />
            </PopoverContent>
        </Popover>
    );
}
