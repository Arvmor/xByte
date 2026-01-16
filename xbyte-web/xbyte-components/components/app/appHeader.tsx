"use client";

import Link from "next/link";
import AppLogo from "@/components/app/appLogo";
import { Connect } from "@/components/privy/connect";
import ProfilePopover from "@/components/privy/profile";
import { useXBytePrivy } from "@/hooks/useXBytePrivy";

export interface HeaderLinkProps {
    label: string;
    href?: string;
}

export default function AppHeader({ links }: { links: HeaderLinkProps[] }) {
    const { authenticated } = useXBytePrivy();

    const headerLinks = links.map(({ label, href }, index) => (
        <Link
            key={index}
            href={href ?? "#"}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
            {label}
        </Link>
    ));

    return (
        <div className="flex justify-between items-center pb-16">
            <AppLogo />

            <div className="flex items-center gap-4">
                {headerLinks}
                {authenticated ? <ProfilePopover /> : <Connect />}
            </div>
        </div>
    );
}
