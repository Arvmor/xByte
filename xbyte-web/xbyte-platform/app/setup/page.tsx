"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { paragraph, feature, integrationOptions, heroSection } from "../page";
import Paragraph from "@/components/platform/paragraph";
import Feature from "@/components/platform/feature";
import Optionable from "@/components/platform/optionable";
import CallToAction from "@/components/platform/callToAction";
import { xByteClient, xByteEvmClient, XBYTE_FACTORY_ADDRESS } from "xbyte-sdk";
import { usePrivy } from "@privy-io/react-auth";
import { CheckCircle2, Loader2, Wallet, CheckCircle, Dot } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The steps of the setup process.
 */
enum SetupStep {
    Onboarding,
    SetupProvider,
    SetWallet,
    SetPrice,
    SetSDK,
    Onboarded,
}

const xbyteClient = new xByteClient();
const xbyteEvmClient = new xByteEvmClient();

/**
 * The section for each step.
 */
const stepSection = new Map<SetupStep, React.ReactNode>([
    [SetupStep.Onboarding, <OnboardingSection />],
    [SetupStep.SetupProvider, <IntegrateProviderSection />],
    [SetupStep.SetWallet, <SetWalletSection />],
    [SetupStep.SetPrice, <SetPriceSection />],
    [SetupStep.SetSDK, <SetSDKSection />],
    [SetupStep.Onboarded, <OnboardedSection />],
]);

const stepLabels = ["Welcome", "Connect", "Set Wallet", "Set Pricing", "Get SDK", "Complete"];

const pageHeader = {
    title: "Setup xByte Integration",
    description: "Follow these steps to integrate xByte into your platform",
};

const buttonTexts = {
    back: "Back",
    continue: "Continue",
    completeSetup: "Complete Setup",
};

const onboardingSection = {
    title: "Welcome to xByte Setup",
    description:
        "Get started by following these simple steps to integrate xByte into your platform.",
};

const integrateProviderSection = {
    title: "Connect Your Data Storage",
    description: "Select your preferred data storage provider to connect with xByte.",
    connectedBucketsTitle: "Connected Buckets",
    noBucketsMessage:
        "No buckets found. Please ensure your storage provider is properly configured.",
};

const setWalletSection = {
    title: "Configure Your Wallet",
    description: "Set up your wallet address and create a vault to receive payments.",
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
    walletNotConnectedTitle: "Wallet Not Connected",
    walletNotConnectedMessage: "Please connect your wallet to continue with the setup.",
};

const setPriceSection = {
    title: "Set Content Pricing",
    description: "Configure pricing for your content. Choose between API or manual pricing.",
    selectBucketLabel: "Select Bucket",
    noBucketsAvailable: "No buckets available",
    selectObjectLabel: "Select Object",
    noObjectsAvailable: "No objects available",
    pricePerByteLabel: "Price per Byte (USDC)",
    pricePlaceholder: "0.0001",
    priceHelper: "Set the price users will pay per byte consumed for this content.",
    setPriceButton: "Set Price",
    settingPrice: "Setting...",
    priceSetSuccess: "Price set successfully",
    defaultPrice: 0.0001,
};

const setSDKSection = {
    title: "Get Your API Key",
    description: "Generate your API key to integrate xByte SDK into your platform.",
    apiKeyLabel: "Your API Key",
    apiKeyPlaceholder: "Click Generate to create your API key",
    generateButton: "Generate",
    generating: "Generating...",
    apiKeyHelper: "Keep this key secure. It will be used to authenticate your platform with xByte.",
    nextStepsTitle: "Next Steps",
    nextSteps: [
        "Install xByte SDK in your project",
        "Configure the SDK with your API key",
        "Start integrating pay-per-byte payments",
    ],
    apiKeyPrefix: "XB-",
};

const onboardedSection = {
    title: "Setup Complete!",
    description: "Your xByte integration is ready. Start monetizing your content today.",
};

const errorMessages = {
    stepNotFound: "Step not found",
    failedToConnectProvider: "Failed to connect provider:",
    failedToCheckVault: "Failed to check vault:",
    failedToCreateVault: "Failed to create vault:",
    failedToLoadBuckets: "Failed to load buckets:",
    failedToLoadObjects: "Failed to load objects:",
    failedToSetPrice: "Failed to set price:",
};

const clientConfig = {
    name: "platformA",
    wallet: "0x1234567890123456789012345678901234567890",
};

const vaultConfig = {
    chainId: 84532,
    checkDelay: 3000,
};

const apiKeyConfig = {
    generationDelay: 1000,
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
        <Button onClick={handleNextStep} size="lg">
            {step === SetupStep.SetSDK ? buttonTexts.completeSetup : buttonTexts.continue}
        </Button>
    );

    return (
        <div className="space-y-12 max-w-4xl mx-auto">
            <div className="space-y-4">
                <h1 className="text-3xl font-bold">{pageHeader.title}</h1>
                <p className="text-muted-foreground">{pageHeader.description}</p>
            </div>

            <ProgressStepper currentStep={step} totalSteps={stepLabels.length} />

            <div className="bg-card border rounded-lg p-8 space-y-8">{StepSection}</div>

            <div className="flex justify-end gap-4">
                {step > SetupStep.Onboarding && <BackButton />}
                {step < SetupStep.Onboarded && <NextButton />}
            </div>
        </div>
    );
}

function ProgressStepper({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
    return (
        <div className="flex items-center justify-between">
            {stepLabels.map((label, index) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                const isUpcoming = index > currentStep;

                const className = cn(
                    "flex items-center justify-center size-10 rounded-full border-2 transition-colors",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isCurrent && "bg-primary/10 border-primary text-primary",
                    isUpcoming && "bg-muted border-muted-foreground/30 text-muted-foreground",
                );

                const labelClassName = cn(
                    "mt-2 text-xs font-medium text-center",
                    isCurrent && "text-foreground",
                    !isCurrent && "text-muted-foreground",
                );

                const separatorClassName = cn(
                    "flex-1 transition-colors",
                    isCompleted ? "bg-primary" : "bg-muted",
                );

                const stepIcon = isCompleted ? (
                    <CheckCircle2 className="size-5" />
                ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                );

                return (
                    <div key={index} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                            <div className={className}>{stepIcon}</div>
                            <span className={labelClassName}>{label}</span>
                        </div>
                        {index < totalSteps - 1 && <Separator className={separatorClassName} />}
                    </div>
                );
            })}
        </div>
    );
}

function OnboardingSection() {
    const features = feature.map((option, index) => <Feature key={index} {...option} />);

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">{onboardingSection.title}</h2>
                <p className="text-muted-foreground">{onboardingSection.description}</p>
            </div>
            <Separator />
            <Paragraph {...paragraph} title={undefined} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{features}</div>
        </div>
    );
}

function IntegrateProviderSection() {
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
            const { status: clientStatus, data: client } = await xbyteClient.createClient({
                name: clientConfig.name,
                wallet: clientConfig.wallet,
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
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">{integrateProviderSection.title}</h2>
                <p className="text-muted-foreground">{integrateProviderSection.description}</p>
            </div>

            <Separator />

            <Paragraph {...paragraph} title={undefined} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {integrationOptions.map((option, index) => (
                    <div key={index} className="relative">
                        <Optionable
                            {...option}
                            onClick={() => handleProviderClick(option.titleText)}
                        />
                        {selectedProvider === option.titleText && <SelectIcon />}
                    </div>
                ))}
            </div>

            {buckets.length > 0 && (
                <div className="space-y-4 p-6 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-primary" />
                        <h3 className="text-lg font-semibold">
                            {integrateProviderSection.connectedBucketsTitle}
                        </h3>
                    </div>
                    <div className="space-y-2">
                        {buckets.map((bucket, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 p-3 bg-background rounded-sm border"
                            >
                                <Dot className="size-8" />
                                <span className="font-mono text-sm">{bucket}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {buckets.length === 0 && !isLoading && selectedProvider && (
                <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                    {integrateProviderSection.noBucketsMessage}
                </div>
            )}
        </div>
    );
}

function SetWalletSection() {
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
        return (
            <div className="space-y-4 text-center py-8">
                <Wallet className="size-12 mx-auto text-muted-foreground" />
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                        {setWalletSection.walletNotConnectedTitle}
                    </h3>
                    <p className="text-muted-foreground">
                        {setWalletSection.walletNotConnectedMessage}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">{setWalletSection.title}</h2>
                <p className="text-muted-foreground">{setWalletSection.description}</p>
            </div>

            <Separator />

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        {setWalletSection.walletAddressLabel}
                    </label>
                    <Input value={wallet} disabled className="font-mono" />
                    <p className="text-xs text-muted-foreground">
                        {setWalletSection.walletAddressHelper}
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        {setWalletSection.vaultAddressLabel}
                    </label>
                    {isChecking ? (
                        <div className="flex items-center gap-2 p-3 bg-muted rounded border">
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                {setWalletSection.checkingVaultStatus}
                            </span>
                        </div>
                    ) : (
                        <>
                            <Input
                                value={deployedVault || setWalletSection.vaultNotComputed}
                                disabled
                                className="font-mono"
                            />
                            <p className="text-xs text-muted-foreground">
                                {setWalletSection.vaultAddressHelper}
                            </p>
                        </>
                    )}
                </div>

                {isDeployed ? (
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-5 text-primary" />
                            <span className="font-medium">
                                {setWalletSection.vaultDeployedMessage}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                {setWalletSection.createVaultDescription}
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
                                    {setWalletSection.creatingVault}
                                </>
                            ) : (
                                setWalletSection.createVaultButton
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

function SetPriceSection() {
    const [buckets, setBuckets] = useState<string[]>([]);
    const [objects, setObjects] = useState<string[]>([]);
    const [selectedBucket, setSelectedBucket] = useState<string>("");
    const [selectedObject, setSelectedObject] = useState<string>("");
    const [price, setPrice] = useState<number>(setPriceSection.defaultPrice);
    const [isLoading, setIsLoading] = useState(false);
    const [isSettingPrice, setIsSettingPrice] = useState(false);
    const [priceSet, setPriceSet] = useState(false);

    const loadBuckets = async () => {
        setIsLoading(true);
        try {
            const result = await xbyteClient.getAllBuckets();
            if (result.status === "Success") {
                setBuckets(result.data);
                if (result.data.length > 0) {
                    setSelectedBucket(result.data[0]);
                    await loadObjects(result.data[0]);
                }
            }
        } catch (error) {
            console.error(errorMessages.failedToLoadBuckets, error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadObjects = async (bucket: string) => {
        setIsLoading(true);
        try {
            const result = await xbyteClient.getAllObjects(bucket);
            if (result.status === "Success") {
                setObjects(result.data);
                if (result.data.length > 0) {
                    setSelectedObject(result.data[0]);
                }
            }
        } catch (error) {
            console.error(errorMessages.failedToLoadObjects, error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetPrice = async () => {
        if (!selectedBucket || !selectedObject) return;
        setIsSettingPrice(true);
        setPriceSet(false);
        try {
            await xbyteClient.setPrice({
                bucket: selectedBucket,
                object: selectedObject,
                price,
            });
            setPriceSet(true);
        } catch (error) {
            console.error(errorMessages.failedToSetPrice, error);
        } finally {
            setIsSettingPrice(false);
        }
    };

    useEffect(() => {
        loadBuckets();
    }, []);

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">{setPriceSection.title}</h2>
                <p className="text-muted-foreground">{setPriceSection.description}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrationOptions.slice(0, 2).map((option, index) => (
                    <Optionable key={index} {...option} onClick={loadBuckets} />
                ))}
            </div>

            <Separator />

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            {setPriceSection.selectBucketLabel}
                        </label>
                        <select
                            value={selectedBucket}
                            onChange={(e) => {
                                setSelectedBucket(e.target.value);
                                loadObjects(e.target.value);
                            }}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                            disabled={isLoading || buckets.length === 0}
                        >
                            {buckets.length === 0 ? (
                                <option>{setPriceSection.noBucketsAvailable}</option>
                            ) : (
                                buckets.map((bucket) => (
                                    <option key={bucket} value={bucket}>
                                        {bucket}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            {setPriceSection.selectObjectLabel}
                        </label>
                        <select
                            value={selectedObject}
                            onChange={(e) => setSelectedObject(e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                            disabled={isLoading || objects.length === 0}
                        >
                            {objects.length === 0 ? (
                                <option>{setPriceSection.noObjectsAvailable}</option>
                            ) : (
                                objects.map((object) => (
                                    <option key={object} value={object}>
                                        {object}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        {setPriceSection.pricePerByteLabel}
                    </label>
                    <div className="flex gap-2">
                        <Input
                            placeholder={setPriceSection.pricePlaceholder}
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            type="number"
                            step="0.00001"
                            min="0"
                            className="flex-1"
                        />
                        <Button
                            onClick={handleSetPrice}
                            disabled={isSettingPrice || !selectedObject}
                        >
                            {isSettingPrice ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    {setPriceSection.settingPrice}
                                </>
                            ) : (
                                setPriceSection.setPriceButton
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">{setPriceSection.priceHelper}</p>
                </div>

                {priceSet && (
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-5 text-primary" />
                            <span className="font-medium">{setPriceSection.priceSetSuccess}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function SetSDKSection() {
    const [apiKey, setApiKey] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState(false);

    const generateApiKey = async () => {
        setIsGenerating(true);
        await new Promise((resolve) => setTimeout(resolve, apiKeyConfig.generationDelay));
        setApiKey(
            setSDKSection.apiKeyPrefix + Math.random().toString(36).substring(2, 15).toUpperCase(),
        );
        setIsGenerating(false);
    };

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">{setSDKSection.title}</h2>
                <p className="text-muted-foreground">{setSDKSection.description}</p>
            </div>

            <Separator />

            <Paragraph {...paragraph} title={undefined} />

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">{setSDKSection.apiKeyLabel}</label>
                    <div className="flex gap-2">
                        <Input
                            value={apiKey || setSDKSection.apiKeyPlaceholder}
                            disabled
                            className="font-mono"
                        />
                        <Button onClick={generateApiKey} disabled={isGenerating || !!apiKey}>
                            {isGenerating ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    {setSDKSection.generating}
                                </>
                            ) : (
                                setSDKSection.generateButton
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">{setSDKSection.apiKeyHelper}</p>
                </div>

                {apiKey && (
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                        <h3 className="font-semibold">{setSDKSection.nextStepsTitle}</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {setSDKSection.nextSteps.map((step, index) => (
                                <li key={index}>{step}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <Feature
                    {...feature[0]}
                    className="h-100"
                    aspect="rectangle"
                    title={undefined}
                    description={undefined}
                />
            </div>
        </div>
    );
}

function OnboardedSection() {
    return (
        <div className="space-y-8 text-center">
            <div className="flex justify-center">
                <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="size-12 text-primary" />
                </div>
            </div>
            <div className="space-y-2">
                <h2 className="text-3xl font-bold">{onboardedSection.title}</h2>
                <p className="text-muted-foreground text-lg">{onboardedSection.description}</p>
            </div>
            <Separator />
            <CallToAction {...heroSection} />
        </div>
    );
}
