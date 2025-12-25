"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { paragraph, feature, integrationOptions } from "../page";
import Paragraph from "@/components/platform/paragraph";
import Feature from "@/components/platform/feature";
import Optionable from "@/components/platform/optionable";

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

    const handleNextStep = () => {
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
    const options = integrationOptions.map((option, index) => (
        <Optionable key={index} {...option} />
    ));

    return (
        <>
            <h1 className="text-2xl font-bold">Integrate Data Provider</h1>
            <Paragraph {...paragraph} title={undefined} />
            <div className="flex flex-col md:flex-row gap-4">{options}</div>
        </>
    );
}

function SetWalletSection() {
    return (
        <>
            <h1 className="text-2xl font-bold">Set Wallet</h1>
            <Paragraph {...paragraph} title={undefined} />
            <Input placeholder="e.g. 0xYourAddress" />
            <Feature {...feature[0]} className="w-100" />
            <Feature {...feature[0]} className="w-100 justify-self-end" />
        </>
    );
}

function SetPriceSection() {
    return (
        <div>
            <h1>Set Price</h1>
        </div>
    );
}

function SetSDKSection() {
    return (
        <div>
            <h1>Set SDK</h1>
        </div>
    );
}

function OnboardedSection() {
    return (
        <div>
            <h1>Onboarded</h1>
        </div>
    );
}
