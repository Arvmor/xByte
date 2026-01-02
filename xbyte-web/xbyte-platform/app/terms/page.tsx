import AppLegal, { LegalProps, LegalSection } from "@/components/app/appLegal";

const TERMS_SECTIONS: LegalSection[] = [
    {
        title: "Acceptance of Terms",
        content:
            "By accessing and using xByte, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
    },
    {
        title: "Description of Service",
        content:
            "xByte provides pay-per-byte infrastructure for content monetization. Our platform enables platforms to monetize content consumption, users to pay only for what they consume, and creators to receive transparent, on-chain royalties.",
    },
    {
        title: "User Responsibilities",
        content:
            "Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account. You agree to immediately notify xByte of any unauthorized use of your account.",
    },
    {
        title: "Payment Terms",
        content:
            "Payments are processed on a pay-per-byte basis. All payments are final and non-refundable unless otherwise stated. xByte uses USDC and x402 protocols for payment processing.",
    },
    {
        title: "Intellectual Property",
        content:
            "The xByte platform, including its software, design, and content, is protected by intellectual property laws. Users retain ownership of their content but grant xByte a license to use, display, and distribute content through the platform.",
    },
    {
        title: "Limitation of Liability",
        content:
            "xByte shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use the service.",
    },
    {
        title: "Modifications to Terms",
        content:
            "xByte reserves the right to modify these terms at any time. Users will be notified of significant changes. Continued use of the service after changes constitutes acceptance of the new terms.",
    },
    {
        title: "Contact Information",
        content:
            "If you have any questions about these Terms of Service, please contact us through our support channels.",
    },
];

const PAGE_DETAILS: LegalProps = {
    title: "Terms of Service",
    lastUpdated: new Date("2025-12-31"),
    sections: TERMS_SECTIONS,
};

export default function TermsPage() {
    return (
        <AppLegal
            title={PAGE_DETAILS.title}
            lastUpdated={PAGE_DETAILS.lastUpdated}
            sections={PAGE_DETAILS.sections}
        />
    );
}
