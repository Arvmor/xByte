import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import AppHeader, { HeaderLinkProps } from "@/components/app/appHeader";
import AppFooter, { FooterLinkProps } from "@/components/app/appFooter";
import Providers from "@/components/privy/provider";
import "xbyte-components/styles/globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL("https://xbyte.sh"),
    title: {
        default: "xByte - Pay-per-Byte Content Monetization",
        template: "%s | xByte",
    },
    description:
        "Infrastructure for pay-per-byte content monetization. Add metered billing to your streaming platform in minutes with transparent, on-chain payments.",
    keywords: [
        "pay-per-byte",
        "content monetization",
        "streaming",
        "x402",
        "USDC",
        "metered billing",
        "blockchain payments",
        "content platform",
    ],
    authors: [{ name: "xByte Team" }],
    creator: "xByte",
    publisher: "xByte",
    robots: { index: true, follow: true },
    icons: { icon: "/icon.png", apple: "/icon.png" },
    openGraph: {
        type: "website",
        siteName: "xByte",
        title: "xByte - Pay-per-Byte Content Monetization",
        description:
            "Infrastructure for pay-per-byte content monetization. Add metered billing to your streaming platform in minutes with transparent, on-chain payments.",
        url: "https://xbyte.sh",
    },
    twitter: {
        card: "summary_large_image",
        title: "xByte - Pay-per-Byte Content Monetization",
        description:
            "Infrastructure for pay-per-byte content monetization. Add metered billing to your streaming platform in minutes with transparent, on-chain payments.",
    },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Organization",
            name: "xByte",
            url: "https://xbyte.sh",
            logo: "https://xbyte.sh/icon.png",
            sameAs: ["https://github.com/Arvmor/xByte"],
        },
        {
            "@type": "WebSite",
            name: "xByte",
            url: "https://xbyte.sh",
        },
    ],
};

const headerLinks: HeaderLinkProps[] = [
    {
        label: "Setup",
        href: "/setup",
    },
    {
        label: "Payout",
        href: "/payout",
    },
    {
        label: "Demo",
        href: "https://demo.xbyte.sh",
    },
    {
        label: "API Docs",
        href: "https://docs.xbyte.sh",
    },
];

const footerLinks: FooterLinkProps[][] = [
    [
        {
            isTitle: true,
            label: "Get Started",
        },
        {
            label: "Payout",
            href: "/payout",
        },
        {
            label: "Setup",
            href: "/setup",
        },
    ],
    [
        {
            isTitle: true,
            label: "Platform",
        },
        {
            label: "FAQ",
        },
        {
            label: "API Docs",
        },
        {
            label: "xByte SDK",
            href: "https://github.com/Arvmor/xByte/tree/master/xbyte-web/xbyte-sdk",
        },
    ],
    [
        {
            isTitle: true,
            label: "Legal",
        },
        {
            label: "Terms",
            href: "/terms",
        },
        {
            label: "Privacy",
            href: "/privacy",
        },
    ],
];

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased p-8 max-w-5xl mx-auto`}
            >
                <Script
                    id="json-ld"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <Providers>
                    <AppHeader links={headerLinks} />
                    <main className="min-h-screen">{children}</main>
                    <AppFooter links={footerLinks} />
                </Providers>
            </body>
        </html>
    );
}
