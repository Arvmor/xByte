"use client";

import CallToAction, { CallToActionProps } from "@/components/platform/callToAction";
import Feature, { FeatureProps } from "@/components/platform/feature";
import Optionable, { OptionableProps } from "@/components/platform/optionable";
import Paragraph, { ParagraphProps } from "@/components/platform/paragraph";
import { Separator } from "@/components/ui/separator";
import { Building2, DollarSign, Users, Zap, Shield, Code } from "lucide-react";
import { useRouter } from "next/navigation";

export const paragraph: ParagraphProps = {
    title: "Integration Instructions",
    text: "Select your preferred data storage provider above.Follow the step-by-step xByte instructions to configure access policies and permissions on AWS, GCP, Azure, or xByte Hosting.Ensure credentials are entered securely. After setup, click the Verify button below to confirm xByte's access.If verification succeeds, you will progress to wallet setup.",
};

export const integrationOptions: OptionableProps[] = [
    {
        titleText: "AWS",
        descriptionText: "Connect Amazon",
        Icon: Building2,
    },
    {
        titleText: "GCP",
        descriptionText: "Connect Google Cloud",
        Icon: Building2,
    },
    {
        titleText: "Azure",
        descriptionText: "Connect Azure",
        Icon: Building2,
    },
];

const setContentPricing: CallToActionProps = {
    titleText: "Set Content Pricing.",
    descriptionText: "Choose API or set manually. Flexible tiers for all.",
    buttonText: "Get Started",
};

const verifySection: CallToActionProps = {
    titleText: "Ready to verify?",
    buttonText: "Verify",
};

const forPlatforms: ParagraphProps = {
    title: "For Platforms",
    text: "Entertainment platforms can reach users who prefer to pay only for what they consume, eliminating the incentive to share accounts. Drop-in infrastructure, not a competing app. Platforms own their UX; we provide metered billing as a service.",
};

const forUsers: ParagraphProps = {
    title: "For Users",
    text: "Pay only for what you watch or listen to. Web2-friendly experience—fund your account with a card or PayPal. Under the hood it's USDC and x402, but users never need to know it's crypto.",
};

const forCreators: ParagraphProps = {
    title: "For Creators & Rights Holders",
    text: "Artists receive transparent, on-chain royalties and can set dynamic pricing. If a moment in their content goes viral, they earn more as viewers rewind and rewatch that specific segment, paying for every second.",
};

export const heroSection: CallToActionProps = {
    titleText: "Integrate xByte-SDK.",
    descriptionText: "Get your API key and add xByte to your platform.",
    buttonText: "Get API Key",
    secondaryButtonText: "Documentation",
};

export const feature: FeatureProps[] = [
    {
        title: "Feature 1",
        description: "Description 1",
        Icon: Building2,
    },
    {
        title: "Feature 3",
        description: "Description 3",
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

export default function Home() {
    const router = useRouter();

    function goToSetupPage() {
        router.push("/setup");
    }

    return (
        <>
            {/* Start Integrating */}
            <CallToAction {...heroSection} buttonAction={goToSetupPage} />

            {/* Integration Options */}
            <div className="flex flex-col md:flex-row gap-4 py-18">
                {integrationOptions.map((option, index) => (
                    <Optionable key={index} {...option} />
                ))}
            </div>

            <Paragraph {...paragraph} />

            <Separator className="my-16" />

            {/* Verify Integration */}
            <CallToAction {...verifySection} />

            <div className="flex flex-col md:flex-row gap-4">
                {feature.map((feature, index) => (
                    <Feature key={index} {...feature} />
                ))}
            </div>

            <Separator className="my-16" />

            <div className="space-y-16">
                <Paragraph {...forPlatforms} />
                <Paragraph {...forUsers} />
                <Paragraph {...forCreators} />
            </div>

            <Separator className="my-16" />

            <div id="features" className="space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Why xByte?</h1>
                    <p className="text-muted-foreground mt-2">
                        Infrastructure-as-a-service for pay-per-byte monetization
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <Feature key={index} {...feature} />
                    ))}
                </div>
            </div>

            {/* Get Started */}
            <CallToAction {...setContentPricing} />
        </>
    );
}
