"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import Paragraph, { ParagraphProps } from "@/components/platform/paragraph";
import { FeatureProps } from "@/components/platform/feature";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Optionable, { OptionableProps } from "@/components/platform/optionable";
import { xByteClient, xByteEvmClient, XBYTE_FACTORY_ADDRESS, Client } from "xbyte-sdk";
import { useXBytePrivy } from "@/hooks/useXBytePrivy";
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
    Archive,
    MoveRight,
    Copy,
    Check,
    Terminal,
    Info,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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

const vaultEarningsData = [
    { month: "Jan", earnings: 0, potential: 2400 },
    { month: "Feb", earnings: 0, potential: 4100 },
    { month: "Mar", earnings: 0, potential: 6800 },
    { month: "Apr", earnings: 0, potential: 9200 },
    { month: "May", earnings: 0, potential: 12500 },
    { month: "Jun", earnings: 0, potential: 16800 },
];

const storageData = [
    { name: "Videos", size: 450, files: 120 },
    { name: "Audio", size: 180, files: 340 },
    { name: "Documents", size: 85, files: 890 },
    { name: "Images", size: 120, files: 2100 },
];

const vaultChartConfig = {
    earnings: {
        label: "Current Earnings",
        color: "#9CA3AF",
    },
    potential: {
        label: "Potential (USDC)",
        color: "#374151",
    },
} satisfies ChartConfig;

const storageChartConfig = {
    size: {
        label: "Size (GB)",
        color: "#374151",
    },
    files: {
        label: "Files",
        color: "#9CA3AF",
    },
} satisfies ChartConfig;

export const integrationOptions: OptionableProps[] = [
    {
        titleText: "AWS",
        descriptionText: "Connect Amazon S3",
        Icon: Archive,
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
    text: "Allow xByte to access your existing data storage providers.",
};

const integrateProviderSection = {
    title: "Connect Your Data Storage",
    description: "Select your preferred data storage provider to connect with xByte.",
    connectedBucketsTitle: "Connected Buckets",
    noBucketsMessage:
        "No buckets found. Please ensure your storage provider is properly configured.",
};

const awsModalContent = {
    title: "Configure AWS S3 Access",
    description: "Create an IAM role that allows xByte to read your S3 buckets.",
    instructionsTitle: "Setup Instructions",
    step1: "Create an IAM role with the trust policy below",
    step2: "Attach the AmazonS3ReadOnlyAccess policy to the role",
    step3: "Enter your AWS Account ID below",
    accountIdLabel: "AWS Account ID",
    accountIdPlaceholder: "123456789012",
    accountIdHelper: "Your 12-digit AWS account ID",
    regionLabel: "AWS Region",
    connectButton: "Connect Storage",
    connecting: "Connecting...",
};

const XBYTE_USER_NAME = "xByte-API";
const XBYTE_AWS_ACCOUNT_ID = "022396637905";
const XBYTE_IAM_ROLE_NAME = "xByteReadOnlyS3";

const buildRoleArn = (accountId: string) => `arn:aws:iam::${accountId}:role/${XBYTE_IAM_ROLE_NAME}`;

const awsTrustPolicy = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::${XBYTE_AWS_ACCOUNT_ID}:user/${XBYTE_USER_NAME}"
      },
      "Action": "sts:AssumeRole",
      "Condition": {}
    }
  ]
}`;

const awsCliCommands = `# Create the IAM role with trust policy
aws iam create-role \\
  --role-name ${XBYTE_IAM_ROLE_NAME} \\
  --assume-role-policy-document '${awsTrustPolicy.replace(/\n/g, "").replace(/\s+/g, " ")}' && \\
  aws iam attach-role-policy \\
  --role-name ${XBYTE_IAM_ROLE_NAME} \\
  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess`;

const AWS_REGIONS = [
    "us-east-1",
    "us-east-2",
    "us-west-1",
    "us-west-2",
    "eu-west-1",
    "eu-west-2",
    "eu-west-3",
    "eu-central-1",
    "ap-northeast-1",
    "ap-northeast-2",
    "ap-southeast-1",
    "ap-southeast-2",
    "ap-south-1",
    "sa-east-1",
];

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

function VaultEarningsChart() {
    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div>
                        <CardTitle className="text-base">Set Up Vault</CardTitle>
                        <CardDescription>Receive on-chain payments</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={vaultChartConfig} className="h-[200px] w-full">
                    <AreaChart accessibilityLayer data={vaultEarningsData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(v) => `$${v / 1000}k`}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(value, name) =>
                                        value != null ? (
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-muted-foreground">{name}</span>
                                                <span className="font-mono font-medium">
                                                    ${Number(value).toLocaleString()}
                                                </span>
                                            </div>
                                        ) : null
                                    }
                                />
                            }
                        />
                        <ChartLegend content={<ChartLegendContent />} verticalAlign="bottom" />
                        <defs>
                            <linearGradient id="fillPotential" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-potential)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-potential)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey="potential"
                            type="monotone"
                            fill="url(#fillPotential)"
                            stroke="var(--color-potential)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

function StorageConnectionChart() {
    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div>
                        <CardTitle className="text-base">Connect Storage</CardTitle>
                        <CardDescription>Link your data providers</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={storageChartConfig} className="h-[200px] w-full">
                    <BarChart accessibilityLayer data={storageData} layout="vertical">
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                        <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={80}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(value, name) =>
                                        value != null ? (
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-muted-foreground">{name}</span>
                                                <span className="font-mono font-medium">
                                                    {name === "Size (GB)"
                                                        ? `${value} GB`
                                                        : `${Number(value).toLocaleString()} files`}
                                                </span>
                                            </div>
                                        ) : null
                                    }
                                />
                            }
                        />
                        <ChartLegend content={<ChartLegendContent />} verticalAlign="bottom" />
                        <Bar dataKey="size" fill="var(--color-size)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
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
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                variants={staggerContainer}
            >
                <motion.div variants={staggerItem}>
                    <VaultEarningsChart />
                </motion.div>
                <motion.div variants={staggerItem}>
                    <StorageConnectionChart />
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

function CopyButton({ text, className }: { text: string; className?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button variant="ghost" size="icon" className={className} onClick={handleCopy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </Button>
    );
}

function IntegrateProviderSection() {
    const { user, walletAddress } = useXBytePrivy();
    const [buckets, setBuckets] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [accountId, setAccountId] = useState("");
    const [region, setRegion] = useState("us-east-1");

    const SelectIcon = () => (
        <div className="absolute top-2 right-2">
            {isConnected && <CheckCircle className="size-5 text-primary" />}
            {isLoading && !isConnected && <Loader2 className="size-5 text-primary animate-spin" />}
        </div>
    );

    const handleProviderClick = (providerName: string) => {
        setSelectedProvider(providerName);
        setIsModalOpen(true);
    };

    const isValidAccountId = accountId.length === 12 && /^\d+$/.test(accountId);

    const handleConnect = async () => {
        if (!isValidAccountId || !region) return;

        setIsLoading(true);
        setIsConnected(false);

        try {
            if (!user?.id || !walletAddress) {
                throw new Error("User not authenticated");
            }

            let client: Client;
            const { status: clientStatus, data: clientData } = await xbyteClient.createClient({
                name: user.id,
                wallet: walletAddress,
            });

            if (clientStatus === "Success" && clientData.id) {
                client = clientData;
            } else {
                const { status, data } = await xbyteClient.getClient(walletAddress);
                if (status !== "Success") return setIsLoading(false);
                client = data;
            }

            if (!client.id) return setIsLoading(false);

            const role_arn = buildRoleArn(accountId);
            const { status: registerStatus } = await xbyteClient.registerStorage({
                storage: {
                    s3: {
                        role_arn,
                        region,
                    },
                },
                client: client.id,
            });

            if (registerStatus !== "Success") return setIsLoading(false);

            const { status, data } = await xbyteClient.getAllBuckets();
            if (status !== "Success") return setIsLoading(false);

            setBuckets(data);
            setIsConnected(true);
            setIsModalOpen(false);
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

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} modal={false}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{awsModalContent.title}</DialogTitle>
                        <DialogDescription>{awsModalContent.description}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Info className="size-5 text-primary" />
                            <h4 className="font-semibold">{awsModalContent.instructionsTitle}</h4>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex gap-3">
                                <span className="shrink-0 size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                                    1
                                </span>
                                <span className="text-muted-foreground">
                                    {awsModalContent.step1}
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <span className="shrink-0 size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                                    2
                                </span>
                                <span className="text-muted-foreground">
                                    {awsModalContent.step2}
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <span className="shrink-0 size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                                    3
                                </span>
                                <span className="text-muted-foreground">
                                    {awsModalContent.step3}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Terminal className="size-4 text-muted-foreground" />
                                <span className="text-sm font-medium">AWS CLI Commands</span>
                            </div>
                            <CopyButton text={awsCliCommands} />
                        </div>

                        <div className="max-w-md mx-auto">
                            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto font-mono">
                                {awsCliCommands}
                            </pre>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="accountId">{awsModalContent.accountIdLabel}</Label>
                            <Input
                                id="accountId"
                                placeholder={awsModalContent.accountIdPlaceholder}
                                value={accountId}
                                onChange={(e) =>
                                    setAccountId(e.target.value.replace(/\D/g, "").slice(0, 12))
                                }
                                className="font-mono"
                                maxLength={12}
                            />
                            <p className="text-xs text-muted-foreground">
                                {awsModalContent.accountIdHelper}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="region">{awsModalContent.regionLabel}</Label>
                            <select
                                id="region"
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                {AWS_REGIONS.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleConnect}
                            disabled={isLoading || !isValidAccountId || !region}
                            className="w-full sm:w-auto"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    {awsModalContent.connecting}
                                </>
                            ) : (
                                awsModalContent.connectButton
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                {buckets.length === 0 && !isLoading && isConnected && (
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
    const { sendTransaction, walletAddress } = useXBytePrivy();

    useEffect(() => {
        if (walletAddress) {
            checkVault();
        }
    }, [walletAddress]);

    async function checkVault() {
        if (!walletAddress) return;
        setIsChecking(true);
        try {
            const computedVault = await xbyteEvmClient.getComputeVaultAddress(walletAddress);
            const vault = await xbyteEvmClient.getVault(walletAddress);
            setDeployedVault(computedVault);
            setIsDeployed(vault.some((v) => v !== "0x0000000000000000000000000000000000000000"));
        } catch (error) {
            console.error(errorMessages.failedToCheckVault, error);
        } finally {
            setIsChecking(false);
        }
    }

    async function createVault() {
        if (!walletAddress) return;
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

    if (!walletAddress) {
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
                    <Input value={walletAddress} disabled className="font-mono" />
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
