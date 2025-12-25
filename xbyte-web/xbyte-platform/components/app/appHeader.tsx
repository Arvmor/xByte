import Link from "next/link";
import AppLogo from "@/components/app/appLogo";

export interface HeaderLinkProps {
    label: string;
    href?: string;
}

export default function AppHeader({ links }: { links: HeaderLinkProps[] }) {
    const headerLinks = links.map(({ label, href }, index) => (
        <Link key={index} href={href ?? "#"} className="text-sm text-muted-foreground">
            {label}
        </Link>
    ));

    return (
        <div className="flex justify-between items-center pb-16">
            <AppLogo />

            <div className="flex items-center gap-4">{headerLinks}</div>
        </div>
    );
}
