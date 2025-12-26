"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { paragraph, feature, integrationOptions, heroSection } from "../page";
import Paragraph from "@/components/platform/paragraph";
import Feature from "@/components/platform/feature";
import Optionable from "@/components/platform/optionable";
import CallToAction from "@/components/platform/callToAction";

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
    const options = integrationOptions
        .slice(0, 2)
        .map((option, index) => <Optionable key={index} {...option} />);

    return (
        <>
            <h1 className="text-2xl font-bold">Set Price</h1>
            <Paragraph {...paragraph} title={undefined} />

            {/* Options for price */}
            <div className="flex flex-col md:flex-row gap-6">{options}</div>
            <Paragraph {...paragraph} />

            {/* Form set price */}
            <div className="flex gap-2">
                <Input placeholder="e.g. a12add23-1234-1234-1234-12345678" className="w-1/3" />
                <Input
                    placeholder="e.g. 0.0001"
                    defaultValue={0.0001}
                    type="number"
                    step="0.00001"
                    min="0"
                    className="w-1/6"
                />
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
