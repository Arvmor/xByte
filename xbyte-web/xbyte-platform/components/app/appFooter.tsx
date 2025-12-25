import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";
import AppLogo from "@/components/app/appLogo";

export interface FooterLinkProps {
    isTitle?: boolean;
    label: string;
    href?: string;
}

export default function AppFooter({ links }: { links: FooterLinkProps[][] }) {
    const footerLinks = links.map((links, index) => (
        <div key={index} className="flex flex-col gap-2">
            {links.map(({ isTitle, label, href }, index) => (
                <Link
                    key={index}
                    href={href ?? "#"}
                    className={cn(
                        isTitle && "font-semibold text-primary!",
                        "text-sm text-muted-foreground",
                    )}
                >
                    {label}
                </Link>
            ))}
        </div>
    ));

    return (
        <div className="py-16">
            <Separator className="mb-16" />

            <div className="flex flex-col md:flex-row justify-between gap-16">
                <AppLogo isSecondary />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-16">
                    {footerLinks}
                </div>
            </div>
        </div>
    );
}
