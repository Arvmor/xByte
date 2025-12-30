"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { paragraph, feature, integrationOptions, heroSection } from "../page";
import Paragraph from "@/components/platform/paragraph";
import Feature from "@/components/platform/feature";
import Optionable from "@/components/platform/optionable";
import CallToAction from "@/components/platform/callToAction";
import { xByteClient, xByteEvmClient } from "xbyte-sdk";
import { usePrivy } from "@privy-io/react-auth";
import { XBYTE_FACTORY_ADDRESS } from "xbyte-sdk";

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

    return (
        <div className="space-y-8">
            {StepSection}
            <Button onClick={handleNextStep}>Next</Button>
        </div>
    );
}

function OnboardingSection() {
    const features = feature.map((option, index) => <Feature key={index} {...option} />);

    return (
        <>
            <h1 className="text-2xl font-bold">Onboarding</h1>
            <Paragraph {...paragraph} title={undefined} />
            <div className="flex flex-col md:flex-row gap-4">{features}</div>
        </>
    );
}

function IntegrateProviderSection() {
    const [data, setData] = useState<string[]>(["Currently None, Integrate to show."]);

    const onClick = async () => {
        const { status: clientStatus, data: client } = await xbyteClient.createClient({
            name: "platformA",
            wallet: "0x1234567890123456789012345678901234567890",
        });
        if (clientStatus !== "Success" || !client.id) return;

        const { status, data } = await xbyteClient.getAllBuckets();
        if (status !== "Success") return;

        setData(data);
        for (const bucket of data) {
            await xbyteClient.registerBucket({
                bucket,
                client: client.id,
            });
        }
    };

    const options = integrationOptions.map((option, index) => (
        <Optionable key={index} {...option} onClick={onClick} />
    ));

    return (
        <>
            <h1 className="text-2xl font-bold">Integrate Data Provider</h1>
            <Paragraph {...paragraph} title={undefined} />
            <div className="flex flex-col md:flex-row gap-4">{options}</div>
            <div>
                <h1 className="text-lg font-bold">Your Buckets</h1>
                {data.map((bucket, index) => (
                    <h2 key={index} className="font-medium text-muted-foreground">
                        {bucket}
                    </h2>
                ))}
            </div>
        </>
    );
}

function SetWalletSection() {
    const [deployedVault, setDeployedVault] = useState("");
    const { sendTransaction, user } = usePrivy();
    const wallet = user?.wallet?.address as `0x${string}`;

    useEffect(() => {
        checkVault();
    }, [user?.wallet?.address]);

    async function checkVault() {
        const vault = await xbyteEvmClient.getVault(wallet);
        setDeployedVault(vault as string);
    }

    async function createVault() {
        sendTransaction({
            to: XBYTE_FACTORY_ADDRESS,
            data: xbyteEvmClient.signatureCreateVault(),
            chainId: 84532,
        });
    }

    return (
        <>
            <h1 className="text-2xl font-bold">Set Wallet</h1>
            <Paragraph {...paragraph} title={undefined} />
            <Input value={wallet} disabled />
            <Button onClick={createVault} disabled={deployedVault !== ""}>
                Create Vault
            </Button>
            <Feature {...feature[0]} className="w-100" />
            <Feature {...feature[0]} className="w-100 justify-self-end" />
        </>
    );
}

function SetPriceSection() {
    const [buckets, setBuckets] = useState<string[]>([]);
    const [objects, setObjects] = useState<string[]>(["Currently None, Integrate to show."]);
    const [price, setPrice] = useState<number>(0.0001);

    const onClick = async () => {
        const buckets = await xbyteClient.getAllBuckets();
        if (buckets.status !== "Success") return;
        setBuckets(buckets.data);

        const objects = await xbyteClient.getAllObjects(buckets.data[0]);
        if (objects.status === "Success") setObjects(objects.data);
    };

    const onClickSetPrice = async () => {
        const object = objects.at(0);
        const bucket = buckets.at(0);

        if (!object || !bucket) return;
        await xbyteClient.setPrice({
            bucket,
            object,
            price,
        });
    };

    const options = integrationOptions
        .slice(0, 2)
        .map((option, index) => <Optionable key={index} {...option} onClick={onClick} />);

    return (
        <>
            {/* Options for price */}
            <h1 className="text-2xl font-bold">Set Price</h1>
            <div className="flex flex-col md:flex-row gap-6">{options}</div>
            <Paragraph {...paragraph} />

            {/* Object List */}
            <div>
                <h1 className="text-lg font-bold">Your Objects</h1>
                {objects.map((object, index) => (
                    <h2 key={index} className="font-medium text-muted-foreground">
                        {object}
                    </h2>
                ))}
            </div>

            {/* Form set price */}
            <div className="flex gap-2">
                <Input placeholder="e.g. a12add23-1234-1234-1234-12345678" className="w-1/3" />
                <Input
                    placeholder="e.g. 0.0001"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    type="number"
                    step="0.00001"
                    min="0"
                    className="w-1/6"
                />
                <Button onClick={onClickSetPrice}>Set Price</Button>
            </div>
        </>
    );
}

function SetSDKSection() {
    return (
        <>
            <h1 className="text-2xl font-bold">Set SDK</h1>
            <Paragraph {...paragraph} title={undefined} />
            <Feature
                {...feature[0]}
                className="h-100"
                aspect="rectangle"
                title={undefined}
                description={undefined}
            />
        </>
    );
}

function OnboardedSection() {
    return (
        <>
            <h1 className="text-2xl font-bold">Onboarded</h1>
            <Paragraph {...paragraph} title={undefined} />
            <CallToAction {...heroSection} />
        </>
    );
}
