import { Separator } from "@/components/ui/separator";

const TERMS_SECTIONS = [
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

const PAGE_DETAILS = {
    title: "Terms of Service",
    lastUpdated: new Date("2025-12-31").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }),
};

export default function TermsPage() {
    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold mb-4">{PAGE_DETAILS.title}</h1>
                    <p className="text-muted-foreground">Updated {PAGE_DETAILS.lastUpdated}</p>
                </div>

                <Separator />

                {TERMS_SECTIONS.map((section, index) => (
                    <section key={index} className="space-y-4">
                        <h2 className="text-2xl font-semibold">{section.title}</h2>
                        <p className="text-muted-foreground">{section.content}</p>
                    </section>
                ))}
            </div>
        </div>
    );
}
