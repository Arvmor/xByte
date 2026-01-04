import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    title: "Xbyte",
    description: "xByte, the Pay-per-Byte infra.",
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
        label: "API Docs",
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
                <Providers>
                    <AppHeader links={headerLinks} />
                    <main className="min-h-screen">{children}</main>
                    <AppFooter links={footerLinks} />
                </Providers>
            </body>
        </html>
    );
}
