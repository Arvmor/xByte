import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Setup Integration",
    description:
        "Set up your xByte vault, connect storage providers, and start monetizing content in minutes.",
};

export default function SetupLayout({ children }: { children: React.ReactNode }) {
    return children;
}
