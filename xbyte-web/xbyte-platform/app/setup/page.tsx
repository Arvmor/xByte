"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import Paragraph, { ParagraphProps } from "@/components/platform/paragraph";
import Feature, { FeatureProps } from "@/components/platform/feature";
import Optionable, { OptionableProps } from "@/components/platform/optionable";
import { xByteClient, xByteEvmClient, XBYTE_FACTORY_ADDRESS } from "xbyte-sdk";
import { usePrivy } from "@privy-io/react-auth";
import {
    CheckCircle2,
    Loader2,
    CheckCircle,
    Dot,
    Building2,
    DollarSign,
    Code,
    Shield,
    Users,
    Zap,
    Cloud,
    Archive,
    MoveRight,
} from "lucide-react";
import { NoWalletAlert } from "@/components/privy/connect";
import AppPageHeader, { PageProps } from "@/components/app/appPage";
import { motion, Variants, AnimatePresence } from "motion/react";
import SectionHeader, { SectionHeaderProps } from "@/components/platform/sectionHeader";
import ProgressStepper from "@/components/platform/progressStepper";
import Link from "next/link";

export const paragraph: ParagraphProps = {
    title: "Integration Instructions",
    text: "Click continue to integrate xByte into your platform in less than 60 seconds.",
};

export const integrationOptions: OptionableProps[] = [
    {
        titleText: "AWS",
        descriptionText: "Connect Amazon S3",
        Icon: Archive,
    },
    {
        titleText: "xByte Hosting",
        descriptionText: "Upload to xByte",
        Icon: Cloud,
    },
];

export const feature: FeatureProps[] = [
    {
        title: "Connect Your Data",
        description: "Connect your data storage provider to xByte.",
        Icon: Building2,
    },
    {
        title: "Monetize Your Content",
        description: "Monetize your content as users consume.",
        Icon: Building2,
    },
];

export const features: FeatureProps[] = [
    {
        title: "Metered Billing",
        description: "Pay only for bytes consumed. No monthly subscriptions or hidden fees.",
        Icon: DollarSign,
    },
    {
        title: "Easy Integration",
        description: "Simple SDK integration. Get your API key and start monetizing content.",
        Icon: Code,
    },
    {
        title: "Transparent Payments",
        description:
            "On-chain payment distribution with automated fee splitting. Trustless and transparent.",
        Icon: Shield,
    },
    {
        title: "Web2 Friendly",
        description: "Users pay with cards or PayPal. Powered by USDC and x402 under the hood.",
        Icon: Users,
    },
    {
        title: "Flexible Storage",
        description:
            "Connect AWS, GCP, Azure, or use xByte hosting. Your infrastructure, your choice.",
        Icon: Building2,
    },
    {
        title: "Real-time Payments",
        description: "Instant x402 payments as content is consumed. No delays, no waiting.",
        Icon: Zap,
    },
];

/**
 * The steps of the setup process.
 */
enum SetupStep {
    Onboarding,
    SetVault,
    SetupProvider,
    Onboarded,
}

const xbyteClient = new xByteClient(process.env.NEXT_PUBLIC_XBYTE_URL);
const xbyteEvmClient = new xByteEvmClient(process.env.NEXT_PUBLIC_RPC_URL);

const slideVariants: Variants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const staggerItem: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 100, damping: 15 },
    },
};

const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
};

/**
 * The section for each step.
 */
const stepSection = new Map<SetupStep, React.ReactNode>([
    [SetupStep.Onboarding, <OnboardingSection />],
    [SetupStep.SetVault, <SetVaultSection />],
    [SetupStep.SetupProvider, <IntegrateProviderSection />],
    [SetupStep.Onboarded, <OnboardedSection />],
]);

const stepLabels = ["Welcome", "Set Vault", "Connect", "Complete"];

const pageHeader: PageProps = {
    title: "Setup xByte Integration",
    description: "Follow these steps to integrate xByte into your platform",
};

const buttonTexts = {
    back: "Back",
    continue: "Continue",
    completeSetup: "Complete Setup",
};

const onboardingSection = {
    title: "Welcome to xByte",
    description: "Setup your vault, connect your data, and earn per byte.",
};

const providerParagraph: ParagraphProps = {
    title: "Read-only Permissions",
    text: "Allow xByte to access your existing data storage providers or start uploading to xByte.",
};

const integrateProviderSection = {
    title: "Connect Your Data Storage",
    description: "Select your preferred data storage provider to connect with xByte.",
    connectedBucketsTitle: "Connected Buckets",
    noBucketsMessage:
        "No buckets found. Please ensure your storage provider is properly configured.",
};

const setVaultSection = {
    title: "Set Up Vault",
    description: "Create a unique vault to receive monetized payments.",
    walletAddressLabel: "Your Wallet Address",
    walletAddressHelper: "This wallet will receive payments from content consumption.",
    vaultAddressLabel: "Vault Address",
    checkingVaultStatus: "Checking vault status...",
    vaultNotComputed: "Not computed",
    vaultAddressHelper: "Your unique vault address for receiving x402 payments.",
    vaultDeployedMessage: "Vault is deployed and ready",
    createVaultDescription:
        "Create a vault contract to receive and manage payments. This is a one-time transaction.",
    createVaultButton: "Create Vault",
    creatingVault: "Creating Vault...",
};

const onboardedSection: SectionHeaderProps = {
    title: "Setup Complete!",
    description: "Your xByte integration is ready. Start monetizing your content today.",
};

const errorMessages = {
    stepNotFound: "Step not found",
    failedToConnectProvider: "Failed to connect provider:",
    failedToCheckVault: "Failed to check vault:",
    failedToCreateVault: "Failed to create vault:",
};

const vaultConfig = {
    chainId: 84532,
    checkDelay: 3000,
};

export default function SetupPage() {
    const [step, setStep] = useState<SetupStep>(SetupStep.Onboarding);

    const StepSection = stepSection.get(step);
    if (!StepSection) {
        return <div>{errorMessages.stepNotFound}</div>;
    }

    const handleBackStep = () => {
        setStep((prev) => Math.max(0, prev - 1));
    };

    const handleNextStep = async () => {
        setStep((prev) => Math.min(prev + 1, SetupStep.Onboarded));
    };

    const BackButton = () => (
        <Button variant="outline" onClick={handleBackStep}>
            {buttonTexts.back}
        </Button>
    );

    const NextButton = () => (
        <Button onClick={handleNextStep}>
            {step === SetupStep.SetupProvider ? buttonTexts.completeSetup : buttonTexts.continue}
        </Button>
    );

    return (
        <motion.div
            className="space-y-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
            <AppPageHeader {...pageHeader} />

            <ProgressStepper labels={stepLabels} currentStep={step} />

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    variants={slideVariants}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="bg-card border rounded-lg p-8 space-y-8"
                >
                    {StepSection}
                </motion.div>
            </AnimatePresence>

            <motion.div
                className="flex justify-end gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {step > SetupStep.Onboarding && <BackButton />}
                {step < SetupStep.Onboarded && <NextButton />}
            </motion.div>
        </motion.div>
    );
}

function OnboardingSection() {
    return (
        <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
        >
            <motion.div className="space-y-2" variants={staggerItem}>
                <h2 className="text-2xl font-bold">{onboardingSection.title}</h2>
                <p className="text-muted-foreground">{onboardingSection.description}</p>
            </motion.div>
            <Separator />
            <motion.div variants={staggerItem}>
                <Paragraph {...paragraph} title={undefined} />
            </motion.div>
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                variants={staggerContainer}
            >
                {feature.map((option, index) => (
                    <motion.div key={index} variants={staggerItem}>
                        <Feature {...option} />
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
}

function IntegrateProviderSection() {
    const { user } = usePrivy();
    const [buckets, setBuckets] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

    const SelectIcon = () => (
        <div className="absolute top-2 right-2">
            {isConnected && <CheckCircle className="size-5 text-primary" />}
            {isLoading && !isConnected && <Loader2 className="size-5 text-primary animate-spin" />}
        </div>
    );

    const handleProviderClick = async (providerName: string) => {
        setSelectedProvider(providerName);
        setIsLoading(true);
        setIsConnected(false);

        try {
            if (!user?.id || !user?.wallet?.address) {
                throw new Error("User not authenticated");
            }

            const { status: clientStatus, data: client } = await xbyteClient.createClient({
                name: user.id,
                wallet: user.wallet.address,
            });
            if (clientStatus !== "Success" || !client.id) {
                setIsLoading(false);
                return;
            }

            const { status, data } = await xbyteClient.getAllBuckets();
            if (status !== "Success") {
                setIsLoading(false);
                return;
            }

            setBuckets(data);
            setIsConnected(true);

            for (const bucket of data) {
                await xbyteClient.registerBucket({
                    bucket,
                    client: client.id,
                });
            }
        } catch (error) {
            console.error(errorMessages.failedToConnectProvider, error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
        >
            <motion.div className="space-y-2" variants={staggerItem}>
                <h2 className="text-2xl font-bold">{integrateProviderSection.title}</h2>
                <p className="text-muted-foreground">{integrateProviderSection.description}</p>
            </motion.div>

            <Separator />

            <motion.div variants={staggerItem}>
                <Paragraph {...providerParagraph} />
            </motion.div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                variants={staggerContainer}
            >
                {integrationOptions.map((option, index) => (
                    <motion.div key={index} className="relative" variants={staggerItem}>
                        <Optionable
                            {...option}
                            onClick={() => handleProviderClick(option.titleText)}
                        />
                        {selectedProvider === option.titleText && <SelectIcon />}
                    </motion.div>
                ))}
            </motion.div>

            <AnimatePresence>
                {buckets.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4 p-6 bg-muted rounded-lg"
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-5 text-primary" />
                            <h3 className="text-lg font-semibold">
                                {integrateProviderSection.connectedBucketsTitle}
                            </h3>
                        </div>
                        <motion.div
                            className="space-y-2"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: {},
                                visible: { transition: { staggerChildren: 0.05 } },
                            }}
                        >
                            {buckets.map((bucket, index) => (
                                <motion.div
                                    key={index}
                                    variants={{
                                        hidden: { opacity: 0, x: -10 },
                                        visible: { opacity: 1, x: 0 },
                                    }}
                                    className="flex items-center gap-2 p-3 bg-background rounded-sm border"
                                >
                                    <Dot className="size-8" />
                                    <span className="font-mono text-sm">{bucket}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {buckets.length === 0 && !isLoading && selectedProvider && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-4 bg-muted rounded-lg text-sm text-muted-foreground"
                    >
                        {integrateProviderSection.noBucketsMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

const walletParagraph: ParagraphProps = {
    title: "Deterministic Vault",
    text: "Claim earnings from the vault at any time. All payments will be on-chain, transparent and immutable!",
};

function SetVaultSection() {
    const [isDeployed, setIsDeployed] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [deployedVault, setDeployedVault] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const { sendTransaction, user } = usePrivy();
    const wallet = user?.wallet?.address as `0x${string}`;

    useEffect(() => {
        if (wallet) {
            checkVault();
        }
    }, [wallet]);

    async function checkVault() {
        if (!wallet) return;
        setIsChecking(true);
        try {
            const computedVault = await xbyteEvmClient.getComputeVaultAddress(wallet);
            const vault = await xbyteEvmClient.getVault(wallet);
            setDeployedVault(computedVault);
            setIsDeployed(vault.some((v) => v !== "0x0000000000000000000000000000000000000000"));
        } catch (error) {
            console.error(errorMessages.failedToCheckVault, error);
        } finally {
            setIsChecking(false);
        }
    }

    async function createVault() {
        if (!wallet) return;
        setIsCreating(true);
        try {
            await sendTransaction({
                to: XBYTE_FACTORY_ADDRESS,
                data: xbyteEvmClient.signatureCreateVault(),
                chainId: vaultConfig.chainId,
            });
            setTimeout(() => checkVault(), vaultConfig.checkDelay);
        } catch (error) {
            console.error(errorMessages.failedToCreateVault, error);
        } finally {
            setIsCreating(false);
        }
    }

    if (!wallet) {
        return <NoWalletAlert />;
    }

    return (
        <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
        >
            <motion.div className="space-y-2" variants={staggerItem}>
                <h2 className="text-2xl font-bold">{setVaultSection.title}</h2>
                <p className="text-muted-foreground">{setVaultSection.description}</p>
            </motion.div>

            <Separator />

            <motion.div variants={staggerItem}>
                <Paragraph {...walletParagraph} />
            </motion.div>

            <motion.div className="space-y-6" variants={staggerItem}>
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        {setVaultSection.walletAddressLabel}
                    </label>
                    <Input value={wallet} disabled className="font-mono" />
                    <p className="text-xs text-muted-foreground">
                        {setVaultSection.walletAddressHelper}
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        {setVaultSection.vaultAddressLabel}
                    </label>
                    {isChecking ? (
                        <div className="flex items-center gap-2 p-3 bg-muted rounded border">
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                {setVaultSection.checkingVaultStatus}
                            </span>
                        </div>
                    ) : (
                        <>
                            <Input
                                value={deployedVault || setVaultSection.vaultNotComputed}
                                disabled
                                className="font-mono"
                            />
                            <p className="text-xs text-muted-foreground">
                                {setVaultSection.vaultAddressHelper}
                            </p>
                        </>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {isDeployed ? (
                        <motion.div
                            key="deployed"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-4 bg-primary/10 border border-primary/20 rounded-lg"
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="size-5 text-primary" />
                                <span className="font-medium">
                                    {setVaultSection.vaultDeployedMessage}
                                </span>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="not-deployed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                        >
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    {setVaultSection.createVaultDescription}
                                </p>
                            </div>
                            <Button
                                onClick={createVault}
                                disabled={isCreating || isChecking}
                                size="lg"
                                className="w-full"
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        {setVaultSection.creatingVault}
                                    </>
                                ) : (
                                    setVaultSection.createVaultButton
                                )}
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}

function OnboardedSection() {
    const goToDocumentation = (
        <Button size="lg" asChild>
            <Link href="https://docs.xbyte.sh" target="_blank">
                Install SDK <MoveRight />
            </Link>
        </Button>
    );

    return (
        <motion.div
            className="space-y-4 text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
        >
            {/* Checkmark */}
            <motion.div
                className="flex justify-center"
                variants={scaleIn}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
                <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
                    >
                        <CheckCircle2 className="size-12 text-primary" />
                    </motion.div>
                </div>
            </motion.div>

            {/* Content */}
            <motion.div variants={staggerItem}>
                <SectionHeader {...onboardedSection} />
                {goToDocumentation}
            </motion.div>
        </motion.div>
    );
}
