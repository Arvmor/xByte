"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { xByteEvmClient } from "xbyte-sdk";
import { useXBytePrivy } from "@/hooks/useXBytePrivy";
import { CheckCircle2, Loader2, ArrowDownCircle, Coins, History, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Address, formatEther, formatUnits } from "viem";
import { NoWalletAlert } from "@/components/privy/connect";
import AppPageHeader, { PageProps } from "@/components/app/appPage";
import { motion, Variants, AnimatePresence } from "motion/react";

const xbyteEvmClient = new xByteEvmClient(process.env.NEXT_PUBLIC_RPC_URL);

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
};

const staggerItem: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 100, damping: 15 },
    },
};

const pageHeader: PageProps = {
    title: "xByte Payout",
    description: "View your vault status, balances, and withdraw funds",
};

const vaultConfig = {
    chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID),
    refreshDelay: 1000,
};

const errorMessages = {
    walletNotConnected: "Please connect your wallet to view your vault",
    failedToLoadVault: "Failed to load vault information:",
    failedToLoadBalance: "Failed to load balance:",
    failedToWithdraw: "Failed to withdraw:",
    failedToLoadEvents: "Failed to load payment history:",
};

const payoutSection = {
    title: "Vault Status",
    description: "Your vault receives x402 payments and manages withdrawals",
    walletAddressLabel: "Wallet Address",
    vaultAddressLabel: "Vault Address",
    checkingVaultStatus: "Checking vault status...",
    vaultNotComputed: "Not computed",
    vaultDeployedMessage: "Vault is deployed and ready",
    vaultNotDeployedMessage: "Vault not deployed. Please create a vault in the setup page.",
};

const balanceSection = {
    title: "Balances",
    description: "Withdrawable amounts in your vault",
    nativeBalanceLabel: "Native Balance",
    erc20BalanceLabel: "USDC Balance",
    tokenAddressLabel: "Token Address",
    tokenAddressPlaceholder: "0x...",
    refreshButton: "Refresh",
    refreshing: "Refreshing...",
    noBalance: "0.00",
};

const withdrawSection = {
    title: "Withdraw Funds",
    description: "Withdraw native tokens or ERC20 tokens from your vault",
    withdrawNativeButton: "Withdraw Native",
    withdrawERC20Button: "Withdraw ERC20",
    withdrawing: "Withdrawing...",
    withdrawSuccess: "Withdrawal successful",
    commissionNote: "A 1% commission fee will be deducted from withdrawals",
};

const historySection = {
    title: "Payment History",
    description: "Recent x402 payments and withdrawals",
    noHistory: "No payment history available",
    loadingHistory: "Loading payment history...",
    amountLabel: "Amount",
    feeLabel: "Fee",
    typeLabel: "Type",
    dateLabel: "Date",
};

export default function PayoutPage() {
    const { walletAddress } = useXBytePrivy();

    if (!walletAddress) {
        return <NoWalletAlert />;
    }

    return (
        <motion.div
            className="space-y-12 max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
        >
            <motion.div variants={staggerItem}>
                <AppPageHeader {...pageHeader} />
            </motion.div>

            <motion.div variants={staggerItem}>
                <BalanceSection wallet={walletAddress} />
            </motion.div>

            <motion.div variants={staggerItem}>
                <WithdrawSection wallet={walletAddress} />
            </motion.div>

            <motion.div variants={staggerItem}>
                <VaultStatusSection wallet={walletAddress} />
            </motion.div>

            <motion.div variants={staggerItem}>
                <HistorySection wallet={walletAddress} />
            </motion.div>
        </motion.div>
    );
}

function VaultStatusSection({ wallet }: { wallet: `0x${string}` }) {
    const [isDeployed, setIsDeployed] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [vaultAddress, setVaultAddress] = useState<Address | null>(null);

    useEffect(() => {
        checkVault();
    }, [wallet]);

    async function checkVault() {
        if (!wallet) return;
        setIsChecking(true);
        try {
            const computedVault = await xbyteEvmClient.getComputeVaultAddress(wallet);
            const vault = await xbyteEvmClient.getVault(wallet);
            setVaultAddress(computedVault);
            setIsDeployed(vault.some((v) => v !== "0x0000000000000000000000000000000000000000"));
        } catch (error) {
            console.error(errorMessages.failedToLoadVault, error);
        } finally {
            setIsChecking(false);
        }
    }

    return (
        <div className="bg-card border rounded-lg p-8 space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">{payoutSection.title}</h2>
                <p className="text-muted-foreground">{payoutSection.description}</p>
            </div>

            <Separator />

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        {payoutSection.walletAddressLabel}
                    </label>
                    <Input value={wallet} disabled className="font-mono" />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">{payoutSection.vaultAddressLabel}</label>
                    {isChecking ? (
                        <div className="flex items-center gap-2 p-3 bg-muted rounded border">
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                {payoutSection.checkingVaultStatus}
                            </span>
                        </div>
                    ) : (
                        <>
                            <Input
                                value={vaultAddress || payoutSection.vaultNotComputed}
                                disabled
                                className="font-mono"
                            />
                        </>
                    )}
                </div>

                {!isChecking && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={cn(
                            "p-4 rounded-lg border",
                            isDeployed
                                ? "bg-primary/10 border-primary/20"
                                : "bg-muted border-muted-foreground/30",
                        )}
                    >
                        <div className="flex items-center gap-2">
                            {isDeployed ? (
                                <>
                                    <CheckCircle2 className="size-5 text-primary" />
                                    <span className="font-medium">
                                        {payoutSection.vaultDeployedMessage}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Loader2 className="size-5 text-muted-foreground" />
                                    <span className="font-medium text-muted-foreground">
                                        {payoutSection.vaultNotDeployedMessage}
                                    </span>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function BalanceSection({ wallet }: { wallet: `0x${string}` }) {
    const [nativeBalance, setNativeBalance] = useState<bigint>(0n);
    const [erc20Balance, setERC20Balance] = useState<bigint>(0n);
    const [tokenAddress, setTokenAddress] = useState<string>(process.env.NEXT_PUBLIC_USDC_ADDRESS!);
    const [isLoading, setIsLoading] = useState(false);
    const [vaultAddress, setVaultAddress] = useState<Address | null>(null);

    useEffect(() => {
        loadVaultAddress();
    }, [wallet]);

    useEffect(() => {
        if (vaultAddress) {
            loadBalances();
        }
    }, [vaultAddress, tokenAddress]);

    async function loadVaultAddress() {
        if (!wallet) return;
        try {
            const computedVault = await xbyteEvmClient.getComputeVaultAddress(wallet);
            setVaultAddress(computedVault);
        } catch (error) {
            console.error(errorMessages.failedToLoadVault, error);
        }
    }

    async function loadBalances() {
        if (!vaultAddress) return;
        setIsLoading(true);
        try {
            const native = await xbyteEvmClient.getVaultBalance(vaultAddress);
            setNativeBalance(native);

            if (tokenAddress && /^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
                const erc20 = await xbyteEvmClient.getVaultERC20Balance(
                    vaultAddress,
                    tokenAddress as Address,
                );
                setERC20Balance(erc20);
            } else {
                setERC20Balance(0n);
            }
        } catch (error) {
            console.error(errorMessages.failedToLoadBalance, error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="bg-card border rounded-lg p-8 space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">{balanceSection.title}</h2>
                <p className="text-muted-foreground">{balanceSection.description}</p>
            </div>

            <Separator />

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Coins className="size-4" />
                            {balanceSection.nativeBalanceLabel}
                        </label>
                        <div className="p-4 bg-muted rounded-lg border">
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="size-4 animate-spin" />
                                    <span className="text-sm text-muted-foreground">
                                        {balanceSection.refreshing}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-lg font-semibold">
                                    {nativeBalance > 0n
                                        ? `${formatEther(nativeBalance)} ETH`
                                        : balanceSection.noBalance}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Coins className="size-4" />
                            {balanceSection.erc20BalanceLabel}
                        </label>
                        <div className="p-4 bg-muted rounded-lg border">
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="size-4 animate-spin" />
                                    <span className="text-sm text-muted-foreground">
                                        {balanceSection.refreshing}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-lg font-semibold">
                                    {erc20Balance > 0n && tokenAddress
                                        ? `${formatUnits(erc20Balance, 6)}`
                                        : balanceSection.noBalance}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        {balanceSection.tokenAddressLabel}
                    </label>
                    <div className="flex gap-2">
                        <Input
                            placeholder={balanceSection.tokenAddressPlaceholder}
                            value={tokenAddress}
                            onChange={(e) => setTokenAddress(e.target.value)}
                            className="font-mono"
                        />
                        <Button onClick={loadBalances} disabled={isLoading || !vaultAddress}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    {balanceSection.refreshing}
                                </>
                            ) : (
                                balanceSection.refreshButton
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function WithdrawSection({ wallet }: { wallet: `0x${string}` }) {
    const [vaultAddress, setVaultAddress] = useState<Address | null>(null);
    const [isWithdrawingNative, setIsWithdrawingNative] = useState(false);
    const [isWithdrawingERC20, setIsWithdrawingERC20] = useState(false);
    const [tokenAddress, setTokenAddress] = useState<string>("");
    const [withdrawSuccess, setWithdrawSuccess] = useState(false);
    const { sendTransaction } = useXBytePrivy();

    useEffect(() => {
        loadVaultAddress();
    }, [wallet]);

    async function loadVaultAddress() {
        if (!wallet) return;
        try {
            const computedVault = await xbyteEvmClient.getComputeVaultAddress(wallet);
            setVaultAddress(computedVault);
        } catch (error) {
            console.error(errorMessages.failedToLoadVault, error);
        }
    }

    async function handleWithdrawNative() {
        if (!vaultAddress) return;
        setIsWithdrawingNative(true);
        setWithdrawSuccess(false);
        try {
            await sendTransaction({
                to: vaultAddress,
                data: xbyteEvmClient.signatureWithdraw(),
                chainId: vaultConfig.chainId,
            });
            setWithdrawSuccess(true);
            setTimeout(() => setWithdrawSuccess(false), 5000);
        } catch (error) {
            console.error(errorMessages.failedToWithdraw, error);
        } finally {
            setIsWithdrawingNative(false);
        }
    }

    async function handleWithdrawERC20() {
        if (!vaultAddress || !tokenAddress || !/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
            return;
        }
        setIsWithdrawingERC20(true);
        setWithdrawSuccess(false);
        try {
            await sendTransaction({
                to: vaultAddress,
                data: xbyteEvmClient.signatureWithdrawERC20(tokenAddress as Address),
                chainId: vaultConfig.chainId,
            });
            setWithdrawSuccess(true);
            setTimeout(() => setWithdrawSuccess(false), 5000);
        } catch (error) {
            console.error(errorMessages.failedToWithdraw, error);
        } finally {
            setIsWithdrawingERC20(false);
        }
    }

    return (
        <div className="bg-card border rounded-lg p-8 space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">{withdrawSection.title}</h2>
                <p className="text-muted-foreground">{withdrawSection.description}</p>
            </div>

            <Separator />

            <div className="space-y-6">
                <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                        {withdrawSection.commissionNote}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                        onClick={handleWithdrawNative}
                        disabled={isWithdrawingNative || !vaultAddress}
                        size="lg"
                        className="w-full"
                    >
                        {isWithdrawingNative ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                {withdrawSection.withdrawing}
                            </>
                        ) : (
                            <>
                                <ArrowDownCircle className="size-4" />
                                {withdrawSection.withdrawNativeButton}
                            </>
                        )}
                    </Button>

                    <div className="space-y-2">
                        <Input
                            placeholder={balanceSection.tokenAddressPlaceholder}
                            value={tokenAddress}
                            onChange={(e) => setTokenAddress(e.target.value)}
                            className="font-mono"
                        />
                        <Button
                            onClick={handleWithdrawERC20}
                            disabled={
                                isWithdrawingERC20 ||
                                !vaultAddress ||
                                !tokenAddress ||
                                !/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)
                            }
                            size="lg"
                            variant="outline"
                            className="w-full"
                        >
                            {isWithdrawingERC20 ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    {withdrawSection.withdrawing}
                                </>
                            ) : (
                                <>
                                    <ArrowDownCircle className="size-4" />
                                    {withdrawSection.withdrawERC20Button}
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <AnimatePresence>
                    {withdrawSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="p-4 bg-primary/10 border border-primary/20 rounded-lg"
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="size-5 text-primary" />
                                <span className="font-medium">
                                    {withdrawSection.withdrawSuccess}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function HistorySection({ wallet }: { wallet: `0x${string}` }) {
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [vaultAddress, setVaultAddress] = useState<Address | null>(null);

    useEffect(() => {
        loadVaultAddress();
    }, [wallet]);

    useEffect(() => {
        if (vaultAddress) {
            loadEvents();
        }
    }, [vaultAddress]);

    async function loadVaultAddress() {
        if (!wallet) return;
        try {
            const computedVault = await xbyteEvmClient.getComputeVaultAddress(wallet);
            setVaultAddress(computedVault);
        } catch (error) {
            console.error(errorMessages.failedToLoadVault, error);
        }
    }

    async function loadEvents() {
        if (!vaultAddress) return;
        setIsLoading(true);
        try {
            const vaultEvents = await xbyteEvmClient.getVaultEvents(vaultAddress);
            setEvents(vaultEvents.slice(-10).reverse());
        } catch (error) {
            console.error(errorMessages.failedToLoadEvents, error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="bg-card border rounded-lg p-8 space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <History className="size-5" />
                    {historySection.title}
                </h2>
                <p className="text-muted-foreground">{historySection.description}</p>
            </div>

            <Separator />

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">
                        {historySection.loadingHistory}
                    </span>
                </div>
            ) : events.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-muted-foreground"
                >
                    {historySection.noHistory}
                </motion.div>
            ) : (
                <motion.div
                    className="space-y-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
                    }}
                >
                    {events.map((event, index) => {
                        const eventName =
                            (event as any).eventName || (event as any).event?.name || "Unknown";
                        const args = (event as any).args || {};
                        const transactionHash = (event as any).transactionHash || "";
                        const timestamp = (event as any).blockTimestamp || 0n;
                        const isNative = eventName === "WithdrawNative";

                        return (
                            <motion.div
                                key={index}
                                variants={{
                                    hidden: { opacity: 0, x: -20 },
                                    visible: { opacity: 1, x: 0 },
                                }}
                                transition={{ duration: 0.3 }}
                                className="p-4 bg-muted rounded-lg border space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                        {isNative ? "Native Withdrawal" : "ERC20 Withdrawal"}
                                    </span>
                                    {transactionHash && (
                                        <a
                                            href={`https://sepolia.basescan.org/tx/${transactionHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline flex items-center gap-1"
                                        >
                                            <span className="text-xs">View on Explorer</span>
                                            <ExternalLink className="size-3" />
                                        </a>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">
                                            {historySection.amountLabel}:
                                        </span>
                                        <div className="font-mono">
                                            {args.amount
                                                ? `${formatEther(args.amount as bigint)} ${isNative ? "ETH" : ""}`
                                                : "N/A"}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">
                                            {historySection.feeLabel}:
                                        </span>
                                        <div className="font-mono">
                                            {args.fee
                                                ? `${formatEther(args.fee as bigint)} ${isNative ? "ETH" : ""}`
                                                : "N/A"}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">
                                            {historySection.typeLabel}:
                                        </span>
                                        <div>{isNative ? "Native" : "ERC20"}</div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">
                                            {historySection.dateLabel}:
                                        </span>
                                        <div className="text-xs">
                                            {timestamp
                                                ? new Date(
                                                      Number(timestamp) * 1000,
                                                  ).toLocaleDateString()
                                                : "N/A"}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
}
