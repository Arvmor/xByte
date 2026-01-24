import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
    title: "xByte",
    tagline: "Infra for Pay-per-Byte Monetization",
    favicon: "img/logo-foreground.png",

    // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
    future: {
        v4: true, // Improve compatibility with the upcoming Docusaurus v4
    },

    // Set the production url of your site here
    url: "https://docs.xbyte.sh",
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: "/",

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: "xByte", // Usually your GitHub org/user name.
    projectName: "xByte-SDK", // Usually your repo name.

    onBrokenLinks: "throw",

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: "en",
        locales: ["en"],
    },

    presets: [
        [
            "classic",
            {
                docs: {
                    sidebarPath: "./sidebars.ts",
                    editUrl: "https://github.com/Arvmor/xbyte/tree/main/xbyte-docs",
                },
                blog: false,
                theme: {
                    customCss: "./src/css/custom.css",
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        // Replace with your project's social card
        image: "img/docusaurus-social-card.jpg",
        colorMode: {
            respectPrefersColorScheme: true,
        },
        navbar: {
            title: "xByte",
            logo: {
                alt: "xByte Logo",
                src: "img/logo.png",
                srcDark: "img/logo-foreground.png",
            },
            items: [
                {
                    type: "docSidebar",
                    sidebarId: "tutorialSidebar",
                    position: "left",
                    label: "Documentation",
                },
                {
                    label: "Platform",
                    href: "https://xbyte.sh",
                    position: "right",
                },
            ],
        },
        footer: {
            style: "dark",
            links: [
                {
                    title: "Get Started",
                    items: [
                        {
                            label: "Getting Started",
                            to: "/docs/getting-started",
                        },
                        {
                            label: "Setup",
                            href: "https://xbyte.sh/setup",
                        },
                        {
                            label: "Payout",
                            href: "https://xbyte.sh/payout",
                        },
                    ],
                },
                {
                    title: "Platform",
                    items: [
                        {
                            label: "API Docs",
                            to: "/docs/api-client",
                        },
                        {
                            label: "Examples",
                            to: "/docs/examples",
                        },
                        {
                            label: "xByte SDK",
                            href: "https://github.com/Arvmor/xByte",
                        },
                    ],
                },
                {
                    title: "Legal",
                    items: [
                        {
                            label: "Terms",
                            href: "https://xbyte.sh/terms",
                        },
                        {
                            label: "Privacy",
                            href: "https://xbyte.sh/privacy",
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} xByte`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
