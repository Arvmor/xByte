import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface FooterLinkProps {
    isTitle?: boolean;
    label: string;
    href?: string;
}

const footerLinks: FooterLinkProps[][] = [
    [
        {
            isTitle: true,
            label: "Get Started",
        },
        {
            label: "Integration",
        },
        {
            label: "Pricing",
        },
        {
            label: "Sign Up",
        },
    ],
    [
        {
            isTitle: true,
            label: "Platform",
        },
        {
            label: "xByte-SDK",
        },
        {
            label: "API Docs",
        },
        {
            label: "FAQ",
        },
    ],
    [
        {
            isTitle: true,
            label: "About",
        },
        {
            label: "Company",
        },
        {
            label: "Blog",
        },
        {
            label: "Support",
        },
    ],
    [
        {
            isTitle: true,
            label: "Legal",
        },
        {
            label: "Terms",
        },
        {
            label: "Privacy",
        },
        {
            label: "Security",
        },
    ],
];

export default function AppFooter() {
    return (
        <div className="py-16">
            <Separator className="mb-16" />

            <div className="flex justify-between">
                <h1>App Footer</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {footerLinks.map((links, index) => (
                        <div key={index} className="flex flex-col gap-2">
                            {links.map(({ isTitle, label, href }) => (
                                <Link
                                    key={label}
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
                    ))}
                </div>
            </div>
        </div>
    );
}
