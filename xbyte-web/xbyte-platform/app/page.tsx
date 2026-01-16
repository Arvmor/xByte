"use client";

import CallToAction, { CallToActionProps } from "@/components/platform/callToAction";
import SectionHeader, { SectionHeaderProps } from "@/components/platform/sectionHeader";
import InfoCard, { InfoCardProps } from "@/components/platform/infoCard";
import ProcessSteps, { ProcessStep } from "@/components/platform/processSteps";
import PaymentFlow, { FlowStep } from "@/components/platform/paymentFlow";
import FAQAccordion, { FAQItem } from "@/components/platform/faqAccordion";
import Optionable, { OptionableProps } from "@/components/platform/optionable";
import ContactBanner, { ContactBannerProps } from "@/components/platform/contactBanner";
import { Separator } from "@/components/ui/separator";
import {
    Building2,
    DollarSign,
    Users,
    Zap,
    Shield,
    Code,
    Cloud,
    Wallet,
    Settings,
    Smartphone,
    TrendingUp,
    Layers,
    FileCode,
    Podcast,
    GraduationCap,
    Briefcase,
    Play,
    Coins,
    Lock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, useInView, Variants } from "motion/react";
import { useRef } from "react";

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
};

const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
};

const staggerItem: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 100, damping: 15 },
    },
};

const slideInFromLeft: Variants = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 },
};

const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
};

interface AnimatedSectionProps {
    children: React.ReactNode;
    className?: string;
    variants?: Variants;
    delay?: number;
}

function AnimatedSection({
    children,
    className,
    variants = fadeInUp,
    delay = 0,
}: AnimatedSectionProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={variants}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

interface StaggeredGridProps {
    children: React.ReactNode;
    className?: string;
}

function StaggeredGrid({ children, className }: StaggeredGridProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className={className}
        >
            {children}
        </motion.div>
    );
}

const heroSection: CallToActionProps = {
    titleText: "Infra for Pay-per-Byte Monetization",
    subtitleText: "Add metered billing to your content platform in minutes.",
    buttonText: "Start Integrating",
    secondaryButtonText: "Learn More",
};

const sectionKeyFeatures: SectionHeaderProps = {
    title: "Key Features",
    subtitle: "Why xByte?",
};

const sectionHowItWorks: SectionHeaderProps = {
    title: "How It Works",
    subtitle: "Integration Steps",
};

const sectionPaymentFlow: SectionHeaderProps = {
    title: "Payment Flow",
    subtitle: "Simple & Transparent",
};

const sectionStorageOptions: SectionHeaderProps = {
    title: "Storage Options",
    subtitle: "Connect Your Data",
};

const sectionUseCases: SectionHeaderProps = {
    title: "Use Cases",
    subtitle: "Built For",
};

const sectionBenefits: SectionHeaderProps = {
    title: "Benefits",
    subtitle: "For Everyone",
};

const sectionWhyChoose: SectionHeaderProps = {
    title: "Why Choose xByte?",
    subtitle: "Trust & Transparency",
    description: "Infrastructure-as-a-service, not a competing app",
};

const sectionFAQ: SectionHeaderProps = {
    title: "Frequently Asked Questions",
    subtitle: "Got Questions?",
};

const ctaFinal: CallToActionProps = {
    titleText: "Ready to Start Monetizing?",
    descriptionText:
        "Integrate xByte SDK and begin earning from your content in minutes. Transform your streaming service with pay-per-byte monetization.",
    buttonText: "Get Started",
};

const integrationOptions: OptionableProps[] = [
    {
        titleText: "AWS S3",
        descriptionText: "Connect your Amazon S3 buckets",
        Icon: Cloud,
    },
    {
        titleText: "Google Cloud",
        descriptionText: "Integrate with Google Cloud Storage",
        Icon: Cloud,
    },
    {
        titleText: "Azure Blob",
        descriptionText: "Link your Azure Blob Storage",
        Icon: Cloud,
    },
];

const keyFeatures: InfoCardProps[] = [
    {
        title: "Transparent Pricing",
        description:
            "Set clear, per-byte pricing with flexible models. Your users see exactly what they pay for.",
        Icon: DollarSign,
    },
    {
        title: "Simple Integration",
        description:
            "Drop-in SDK integration takes minutes. Works with any content type (audio, video, live, or VOD).",
        Icon: Code,
    },
    {
        title: "Trustless Payments",
        description:
            "On-chain settlement via x402 ensures transparent, automated payment distribution. No intermediaries.",
        Icon: Shield,
    },
    {
        title: "Content-Agnostic",
        description: "Works with any media type. Meter bytes delivered, not content format.",
        Icon: Users,
    },
    {
        title: "Enterprise Ready",
        description: "Support for AWS, GCP, Azure, or xByte hosting. Scalable infrastructure.",
        Icon: Building2,
    },
    {
        title: "Instant Settlement",
        description: "Real-time payment processing. Receive as users consume content.",
        Icon: Zap,
    },
];

const howItWorksSteps: ProcessStep[] = [
    {
        title: "Connect Your Storage",
        description:
            "Link AWS S3, Google Cloud, Azure, or xByte hosting. Verify access in minutes.",
        Icon: Cloud,
    },
    {
        title: "Set Your Wallet",
        description: "Configure wallet to receive payments. MetaMask, Privy, and more supported.",
        Icon: Wallet,
    },
    {
        title: "Configure Pricing",
        description: "Set per-byte pricing. Support for tiered pricing, discounts, and curves.",
        Icon: Settings,
    },
    {
        title: "Integrate SDK",
        description: "Simple API calls: start stream, update usage, close stream.",
        Icon: FileCode,
    },
    {
        title: "Start Earning",
        description: "Users pay per byte. Withdraw funds anytime (99% to you, 1% platform fee).",
        Icon: TrendingUp,
    },
];

const paymentFlowSteps: FlowStep[] = [
    { label: "User consumes bytes", Icon: Play },
    { label: "Triggers x402 payment", Icon: Zap },
    { label: "Payments to your vault", Icon: Lock },
    { label: "Funds accumulate", Icon: Layers },
    { label: "Withdraw anytime", Icon: Coins },
];

const useCases: InfoCardProps[] = [
    {
        title: "Content Platforms",
        items: [
            "Streaming services (video, music, podcasts)",
            "Live streaming platforms",
            "Digital content marketplaces",
            "File hosting with metered access",
        ],
        Icon: Play,
        layout: "detailed",
    },
    {
        title: "Creator Economy",
        items: [
            "Individual artists selling content access",
            "Educational content providers",
            "Premium newsletters & blogs",
            "Exclusive community content",
        ],
        Icon: GraduationCap,
        layout: "detailed",
    },
    {
        title: "B2B Applications",
        items: [
            "API providers charging per request/byte",
            "Data providers with usage-based billing",
            "Infrastructure services with metered consumption",
        ],
        Icon: Briefcase,
        layout: "detailed",
    },
];

const benifis: InfoCardProps[] = [
    {
        title: "For End Users",
        description:
            "Pay only for what you consume. Web2-friendly payments (card or PayPal). USDC and x402 under the hood.",
        Icon: Users,
    },
    {
        title: "For Streaming Platforms",
        items: [
            "Experiment with new pricing models without rebuilding billing",
            "Transparent unit economics per GB streamed",
            "Solve account sharing with pay-per-byte model",
            "Works with any media type",
        ],
        Icon: Smartphone,
        variant: "highlight",
    },
    {
        title: "For Content Creators",
        description:
            "Revenue scales with consumption. Transparent on-chain royalties. Instant settlement with 1% platform fee.",
        Icon: Podcast,
    },
];

const whyChooseItems: InfoCardProps[] = [
    {
        title: "Infrastructure, Not Competition",
        description:
            "We provide rails, not a competing app. You own your UX; we provide metered billing as a service.",
    },
    {
        title: "Proven Technology",
        items: [
            "2nd Place: AVAX x402 Hackathon",
            "Built on x402 payment standard",
            "EVM Compatible (Base Sepolia & more)",
        ],
    },
    {
        title: "Developer-Friendly",
        items: [
            "First stream in under an hour",
            "Comprehensive docs & SDKs",
            "Full TypeScript support",
        ],
    },
    {
        title: "Transparent & Trustless",
        items: ["On-chain settlement", "Smart contract fee enforcement", "1% platform fee"],
    },
];

const faqItems: FAQItem[] = [
    {
        question: "How does pay-per-byte pricing work?",
        answer: "Users pay based on actual bytes consumed. Example: 0.001 USDC per 1MB means a 100MB video costs 0.1 USDC.",
    },
    {
        question: "What content types does xByte support?",
        answer: "xByte is content-agnostic. Works with audio, video, live streams, or data files.",
    },
    {
        question: "How do users pay?",
        answer: "Fund accounts with card or PayPal. USDC and x402 run under the hood-users never need to know it's crypto.",
    },
    {
        question: "What are the fees?",
        answer: "1% platform commission. 99% goes to you. Enforced at smart contract level.",
    },
    {
        question: "How quickly can I integrate?",
        answer: "Minutes, not weeks. Most platforms integrate in under an hour.",
    },
    {
        question: "Do I need blockchain knowledge?",
        answer: "No. xByte abstracts complexity. Simple API calls handle everything.",
    },
    {
        question: "Can I use my existing storage?",
        answer: "Yes. AWS S3, Google Cloud, Azure Blob, or xByte hosting supported.",
    },
    {
        question: "How do I receive payments?",
        answer: "Direct to your vault contract. Withdraw anytime. Native tokens (ETH, AVAX) or ERC20 (USDC) supported.",
    },
];

const contactBanner: ContactBannerProps = {
    message: "Want to learn more? Reach us at",
    email: "contact@xbyte.sh",
};

export default function Home() {
    const router = useRouter();

    function goToSetupPage() {
        router.push("/setup");
    }

    function goToLearnMorePage() {
        router.replace("https://docs.xbyte.sh");
    }

    return (
        <>
            {/* Start Integrating */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
                <CallToAction
                    {...heroSection}
                    buttonAction={goToSetupPage}
                    secondaryButtonAction={goToLearnMorePage}
                />
            </motion.div>

            {/* Payment Flow */}
            <AnimatedSection className="my-16" variants={scaleIn}>
                <SectionHeader {...sectionPaymentFlow} />
                <PaymentFlow steps={paymentFlowSteps} />
            </AnimatedSection>

            <AnimatedSection variants={fadeIn}>
                <Separator className="my-16" />
            </AnimatedSection>

            {/* Key Features */}
            <div>
                <AnimatedSection>
                    <SectionHeader {...sectionKeyFeatures} />
                </AnimatedSection>
                <StaggeredGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {keyFeatures.map((feature, index) => (
                        <motion.div key={index} variants={staggerItem}>
                            <InfoCard {...feature} />
                        </motion.div>
                    ))}
                </StaggeredGrid>
            </div>

            <AnimatedSection variants={fadeInUp} className="mt-12">
                <ContactBanner {...contactBanner} />
            </AnimatedSection>

            <AnimatedSection variants={fadeIn}>
                <Separator className="my-16" />
            </AnimatedSection>

            {/* How It Works */}
            <div>
                <AnimatedSection>
                    <SectionHeader {...sectionHowItWorks} />
                </AnimatedSection>
                <AnimatedSection variants={slideInFromLeft} delay={0.2}>
                    <ProcessSteps steps={howItWorksSteps} />
                </AnimatedSection>
            </div>

            <AnimatedSection variants={fadeIn}>
                <Separator className="my-16" />
            </AnimatedSection>

            {/* Storage Options */}
            <div>
                <AnimatedSection>
                    <SectionHeader {...sectionStorageOptions} />
                </AnimatedSection>
                <StaggeredGrid className="flex flex-col md:flex-row gap-4">
                    {integrationOptions.map((option, index) => (
                        <motion.div key={index} variants={staggerItem} className="flex-1">
                            <Optionable {...option} />
                        </motion.div>
                    ))}
                </StaggeredGrid>
            </div>

            <AnimatedSection variants={fadeIn}>
                <Separator className="my-16" />
            </AnimatedSection>

            {/* Use Cases */}
            <div>
                <AnimatedSection>
                    <SectionHeader {...sectionUseCases} />
                </AnimatedSection>
                <StaggeredGrid className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {useCases.map((useCase, index) => (
                        <motion.div key={index} variants={staggerItem}>
                            <InfoCard {...useCase} />
                        </motion.div>
                    ))}
                </StaggeredGrid>
            </div>

            <AnimatedSection variants={fadeIn}>
                <Separator className="my-16" />
            </AnimatedSection>

            {/* Benefits */}
            <div>
                <AnimatedSection>
                    <SectionHeader {...sectionBenefits} />
                </AnimatedSection>
                <StaggeredGrid className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {benifis.map((benefit, index) => (
                        <motion.div key={index} variants={staggerItem}>
                            <InfoCard {...benefit} />
                        </motion.div>
                    ))}
                </StaggeredGrid>
            </div>

            <AnimatedSection variants={fadeIn}>
                <Separator className="my-16" />
            </AnimatedSection>

            {/* Why Choose xByte? */}
            <div>
                <AnimatedSection>
                    <SectionHeader {...sectionWhyChoose} />
                </AnimatedSection>
                <StaggeredGrid className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {whyChooseItems.map((item, index) => (
                        <motion.div key={index} variants={staggerItem}>
                            <InfoCard {...item} />
                        </motion.div>
                    ))}
                </StaggeredGrid>
            </div>

            <AnimatedSection variants={fadeIn}>
                <Separator className="my-16" />
            </AnimatedSection>

            {/* FAQ Section */}
            <div>
                <AnimatedSection>
                    <SectionHeader {...sectionFAQ} />
                </AnimatedSection>
                <AnimatedSection variants={fadeInUp} delay={0.15}>
                    <FAQAccordion items={faqItems} />
                </AnimatedSection>
            </div>

            <AnimatedSection variants={fadeIn}>
                <Separator className="my-16" />
            </AnimatedSection>

            <AnimatedSection variants={scaleIn}>
                <CallToAction {...ctaFinal} buttonAction={goToSetupPage} />
            </AnimatedSection>
        </>
    );
}
