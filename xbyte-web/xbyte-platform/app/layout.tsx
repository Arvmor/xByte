import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppHeader from "@/components/app/appHeader";
import AppFooter from "@/components/app/appFooter";
import "./globals.css";

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
                <AppHeader />
                {children}
                <AppFooter />
            </body>
        </html>
    );
}
