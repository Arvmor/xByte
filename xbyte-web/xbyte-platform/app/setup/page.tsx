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
import { CheckCircle2, Loader2, Wallet, CheckCircle } from "lucide-react";
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

/**
 * The next step for each step.
 */
const nextStep = new Map<SetupStep, SetupStep>([
    [SetupStep.Onboarding, SetupStep.SetupProvider],
    [SetupStep.SetupProvider, SetupStep.SetWallet],
    [SetupStep.SetWallet, SetupStep.SetPrice],
    [SetupStep.SetPrice, SetupStep.SetSDK],
    [SetupStep.SetSDK, SetupStep.Onboarded],
    [SetupStep.Onboarded, SetupStep.Onboarded],
]);

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

const stepLabels = [
    "Welcome",
    "Connect Storage",
    "Set Wallet",
    "Set Pricing",
    "Get SDK",
    "Complete",
];

export default function SetupPage() {
    const [step, setStep] = useState<SetupStep>(SetupStep.Onboarding);

    const StepSection = stepSection.get(step);
    if (!StepSection) {
        return <div>Step not found</div>;
    }

    const handleNextStep = async () => {
        const next = nextStep.get(step) ?? SetupStep.Onboarding;
        setStep(next);
    };

    const currentStepIndex = step;
    const totalSteps = stepLabels.length;

    return (
        <div className="space-y-12 max-w-4xl mx-auto">
            <div className="space-y-4">
                <h1 className="text-3xl font-bold">Setup xByte Integration</h1>
                <p className="text-muted-foreground">
                    Follow these steps to integrate xByte into your platform
                </p>
            </div>

            <ProgressStepper currentStep={currentStepIndex} totalSteps={totalSteps} />

            <div className="bg-card border rounded-lg p-8 space-y-8">{StepSection}</div>

            {step !== SetupStep.Onboarded && (
                <div className="flex justify-end gap-4">
                    {step > SetupStep.Onboarding && (
                        <Button
                            variant="outline"
                            onClick={() => setStep((prev) => Math.max(0, prev - 1))}
                        >
                            Back
                        </Button>
                    )}
                    <Button onClick={handleNextStep} size="lg">
                        {step === SetupStep.SetSDK ? "Complete Setup" : "Continue"}
                    </Button>
                </div>
            )}
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

                return (
                    <div key={index} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                            <div
                                className={cn(
                                    "flex items-center justify-center size-10 rounded-full border-2 transition-colors",
                                    isCompleted &&
                                        "bg-primary border-primary text-primary-foreground",
                                    isCurrent && "bg-primary/10 border-primary text-primary",
                                    isUpcoming &&
                                        "bg-muted border-muted-foreground/30 text-muted-foreground",
                                )}
                            >
                                {isCompleted ? (
                                    <CheckCircle2 className="size-5" />
                                ) : (
                                    <span className="text-sm font-semibold">{index + 1}</span>
                                )}
                            </div>
                            <span
                                className={cn(
                                    "mt-2 text-xs font-medium text-center",
                                    isCurrent && "text-foreground",
                                    !isCurrent && "text-muted-foreground",
                                )}
                            >
                                {label}
                            </span>
                        </div>
                        {index < totalSteps - 1 && (
                            <div
                                className={cn(
                                    "h-0.5 flex-1 mx-2 transition-colors",
                                    isCompleted ? "bg-primary" : "bg-muted",
                                )}
                            />
                        )}
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
                <h2 className="text-2xl font-bold">Welcome to xByte Setup</h2>
                <p className="text-muted-foreground">
                    Get started by following these simple steps to integrate xByte into your
                    platform.
                </p>
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

    const handleProviderClick = async (providerName: string) => {
        setSelectedProvider(providerName);
        setIsLoading(true);
        setIsConnected(false);

        try {
            const { status: clientStatus, data: client } = await xbyteClient.createClient({
                name: "platformA",
                wallet: "0x1234567890123456789012345678901234567890",
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
            console.error("Failed to connect provider:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Connect Your Data Storage</h2>
                <p className="text-muted-foreground">
                    Select your preferred data storage provider to connect with xByte.
                </p>
            </div>

            <Separator />

            <Paragraph {...paragraph} title={undefined} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {integrationOptions.map((option, index) => (
                    <div
                        key={index}
                        className={cn(
                            "relative",
                            selectedProvider === option.titleText && "ring-2 ring-primary",
                        )}
                    >
                        <Optionable
                            {...option}
                            onClick={() => handleProviderClick(option.titleText)}
                        />
                        {selectedProvider === option.titleText && isConnected && (
                            <div className="absolute top-2 right-2">
                                <CheckCircle className="size-5 text-primary" />
                            </div>
                        )}
                        {selectedProvider === option.titleText && isLoading && (
                            <div className="absolute top-2 right-2">
                                <Loader2 className="size-5 text-primary animate-spin" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {buckets.length > 0 && (
                <div className="space-y-4 p-6 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-primary" />
                        <h3 className="text-lg font-semibold">Connected Buckets</h3>
                    </div>
                    <div className="space-y-2">
                        {buckets.map((bucket, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 p-3 bg-background rounded border"
                            >
                                <div className="size-2 rounded-full bg-primary" />
                                <span className="font-mono text-sm">{bucket}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {buckets.length === 0 && !isLoading && selectedProvider && (
                <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                    No buckets found. Please ensure your storage provider is properly configured.
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
            setIsDeployed(vault.length !== 0);
        } catch (error) {
            console.error("Failed to check vault:", error);
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
                chainId: 84532,
            });
            setTimeout(() => checkVault(), 3000);
        } catch (error) {
            console.error("Failed to create vault:", error);
        } finally {
            setIsCreating(false);
        }
    }

    if (!wallet) {
        return (
            <div className="space-y-4 text-center py-8">
                <Wallet className="size-12 mx-auto text-muted-foreground" />
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Wallet Not Connected</h3>
                    <p className="text-muted-foreground">
                        Please connect your wallet to continue with the setup.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Configure Your Wallet</h2>
                <p className="text-muted-foreground">
                    Set up your wallet address and create a vault to receive payments.
                </p>
            </div>

            <Separator />

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Your Wallet Address</label>
                    <Input value={wallet} disabled className="font-mono" />
                    <p className="text-xs text-muted-foreground">
                        This wallet will receive payments from content consumption.
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Vault Address</label>
                    {isChecking ? (
                        <div className="flex items-center gap-2 p-3 bg-muted rounded border">
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                Checking vault status...
                            </span>
                        </div>
                    ) : (
                        <>
                            <Input
                                value={deployedVault || "Not computed"}
                                disabled
                                className="font-mono"
                            />
                            <p className="text-xs text-muted-foreground">
                                Your unique vault address for receiving x402 payments.
                            </p>
                        </>
                    )}
                </div>

                {isDeployed ? (
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-5 text-primary" />
                            <span className="font-medium">Vault is deployed and ready</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                Create a vault contract to receive and manage payments. This is a
                                one-time transaction.
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
                                    Creating Vault...
                                </>
                            ) : (
                                "Create Vault"
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
    const [price, setPrice] = useState<number>(0.0001);
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
            console.error("Failed to load buckets:", error);
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
            console.error("Failed to load objects:", error);
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
            console.error("Failed to set price:", error);
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
                <h2 className="text-2xl font-bold">Set Content Pricing</h2>
                <p className="text-muted-foreground">
                    Configure pricing for your content. Choose between API or manual pricing.
                </p>
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
                        <label className="text-sm font-medium">Select Bucket</label>
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
                                <option>No buckets available</option>
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
                        <label className="text-sm font-medium">Select Object</label>
                        <select
                            value={selectedObject}
                            onChange={(e) => setSelectedObject(e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                            disabled={isLoading || objects.length === 0}
                        >
                            {objects.length === 0 ? (
                                <option>No objects available</option>
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
                    <label className="text-sm font-medium">Price per Byte (USDC)</label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="0.0001"
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
                                    Setting...
                                </>
                            ) : (
                                "Set Price"
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Set the price users will pay per byte consumed for this content.
                    </p>
                </div>

                {priceSet && (
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-5 text-primary" />
                            <span className="font-medium">Price set successfully</span>
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
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setApiKey("XB-" + Math.random().toString(36).substring(2, 15).toUpperCase());
        setIsGenerating(false);
    };

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Get Your API Key</h2>
                <p className="text-muted-foreground">
                    Generate your API key to integrate xByte SDK into your platform.
                </p>
            </div>

            <Separator />

            <Paragraph {...paragraph} title={undefined} />

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Your API Key</label>
                    <div className="flex gap-2">
                        <Input
                            value={apiKey || "Click Generate to create your API key"}
                            disabled
                            className="font-mono"
                        />
                        <Button onClick={generateApiKey} disabled={isGenerating || !!apiKey}>
                            {isGenerating ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                "Generate"
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Keep this key secure. It will be used to authenticate your platform with
                        xByte.
                    </p>
                </div>

                {apiKey && (
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                        <h3 className="font-semibold">Next Steps</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            <li>Install xByte SDK in your project</li>
                            <li>Configure the SDK with your API key</li>
                            <li>Start integrating pay-per-byte payments</li>
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
                <h2 className="text-3xl font-bold">Setup Complete!</h2>
                <p className="text-muted-foreground text-lg">
                    Your xByte integration is ready. Start monetizing your content today.
                </p>
            </div>
            <Separator />
            <CallToAction {...heroSection} />
        </div>
    );
}
