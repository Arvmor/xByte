import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";

interface CardData {
    title: string;
    description: string;
    link: string;
    buttonText: string;
    buttonVariant: "primary" | "secondary";
}

const DOCUMENTATION_CARDS: CardData[] = [
    {
        title: "Get Started",
        description:
            "Install the SDK and make your first API call in minutes. Learn how to set up clients, buckets, and content pricing.",
        link: "/docs/getting-started",
        buttonText: "Get Started →",
        buttonVariant: "primary",
    },
    {
        title: "Examples",
        description:
            "Practical code examples showing common use cases, integration patterns, and best practices.",
        link: "/docs/examples",
        buttonText: "View Examples →",
        buttonVariant: "secondary",
    },
];

const HERO_SECTION = {
    title: "xByte SDK",
    description: "Infra for Pay-per-Byte Monetization",
    content:
        "TypeScript SDK for pay-per-byte content monetization through x402 payments. Enable content creators to monetize their content on a per-byte basis. Perfect for audio, video, and file streaming.",
};

const QUICK_INSTALLATION = {
    title: "Quick Installation",
    content: "npm install xbyte-sdk",
    buttonText: "Read Documentation",
};

function DocumentationCard({ title, description, link, buttonText, buttonVariant }: CardData) {
    return (
        <div className="col col--6">
            <div
                className="card margin-bottom--md flex flex-col"
                style={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
                <div className="card__header">
                    <h3>{title}</h3>
                </div>
                <div
                    className="card__body"
                    style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
                >
                    <p style={{ flexGrow: 1 }}>{description}</p>
                    <Link className={`button button--${buttonVariant} button--block`} to={link}>
                        {buttonText}
                    </Link>
                </div>
            </div>
        </div>
    );
}

function HeroSection() {
    return (
        <div className="text--center margin-bottom--xl">
            <h1 className="hero__title">{HERO_SECTION.title}</h1>
            <p className="hero__subtitle">{HERO_SECTION.description}</p>
            <p
                className="text--lg margin-top--md"
                style={{ maxWidth: "600px", margin: "1rem auto 0" }}
            >
                {HERO_SECTION.content}
            </p>
        </div>
    );
}

function InstallationSection() {
    return (
        <div className="text--center margin-top--xl">
            <h2>{QUICK_INSTALLATION.title}</h2>
            <div className="margin-top--md">
                <pre
                    className="language-bash"
                    style={{
                        padding: "1rem 1.5rem",
                        borderRadius: "1.25rem",
                        textAlign: "left",
                        display: "inline-block",
                        margin: "0 auto",
                    }}
                >
                    <code>{QUICK_INSTALLATION.content}</code>
                </pre>
            </div>
            <div className="margin-top--md">
                <Link className="button button--primary button--lg" to="/docs/getting-started">
                    {QUICK_INSTALLATION.buttonText}
                </Link>
            </div>
        </div>
    );
}

function DocumentationGrid() {
    return (
        <div className="row margin-top--lg flex">
            {DOCUMENTATION_CARDS.map((card, index) => (
                <DocumentationCard {...card} key={index} />
            ))}
        </div>
    );
}

export default function Home() {
    return (
        <Layout
            title="xByte Documentation"
            description="Infra for Pay-per-Byte Monetization - TypeScript SDK for pay-per-byte content monetization through x402 payments"
        >
            <div className="container margin-vert--xl">
                <div className="row">
                    <div className="col col--8 col--offset-2">
                        <HeroSection />
                        <DocumentationGrid />
                        <InstallationSection />
                    </div>
                </div>
            </div>
        </Layout>
    );
}
