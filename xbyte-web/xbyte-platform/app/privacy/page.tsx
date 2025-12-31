import { Separator } from "@/components/ui/separator";

const PRIVACY_SECTIONS = [
    {
        title: "Information We Collect",
        content:
            "We collect information that you provide directly to us, including account information, payment details, and content usage data. We also automatically collect certain information about your device and how you interact with our platform.",
    },
    {
        title: "How We Use Your Information",
        content:
            "We use the information we collect to provide, maintain, and improve our services, process payments, communicate with you, and ensure platform security. We do not sell your personal information to third parties.",
    },
    {
        title: "Payment Information",
        content:
            "Payment processing is handled through secure third-party providers. xByte processes payments using USDC and x402 protocols. We store minimal payment information necessary for transaction processing and compliance.",
    },
    {
        title: "Data Storage and Security",
        content:
            "We implement industry-standard security measures to protect your information. Your data may be stored on cloud infrastructure including AWS, GCP, Azure, or xByte hosting, depending on your configuration.",
    },
    {
        title: "Blockchain and On-Chain Data",
        content:
            "xByte uses blockchain technology for payment processing and royalty distribution. Some transaction data is recorded on-chain and is publicly visible. We take measures to minimize personally identifiable information on-chain.",
    },
    {
        title: "Cookies and Tracking",
        content:
            "We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and improve our services. You can control cookie preferences through your browser settings.",
    },
    {
        title: "Your Rights",
        content:
            "You have the right to access, update, or delete your personal information. You may also opt out of certain data collection practices. Contact us to exercise these rights.",
    },
    {
        title: "Third-Party Services",
        content:
            "Our platform integrates with third-party services for payment processing, storage, and analytics. These services have their own privacy policies, and we encourage you to review them.",
    },
    {
        title: "Changes to This Policy",
        content:
            'We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last updated" date.',
    },
    {
        title: "Contact Us",
        content:
            "If you have questions about this Privacy Policy or our data practices, please contact us through our support channels.",
    },
];

const PAGE_DETAILS = {
    title: "Privacy Policy",
    lastUpdated: new Date("2025-12-31").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }),
};

export default function PrivacyPage() {
    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold mb-4">{PAGE_DETAILS.title}</h1>
                    <p className="text-muted-foreground">Updated {PAGE_DETAILS.lastUpdated}</p>
                </div>

                <Separator />

                {PRIVACY_SECTIONS.map((section, index) => (
                    <section key={index} className="space-y-4">
                        <h2 className="text-2xl font-semibold">{section.title}</h2>
                        <p className="text-muted-foreground">{section.content}</p>
                    </section>
                ))}
            </div>
        </div>
    );
}
