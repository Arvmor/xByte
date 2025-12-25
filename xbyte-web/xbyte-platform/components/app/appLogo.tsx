import { cn } from "@/lib/utils";
import Link from "next/link";

export interface AppLogoProps {
    isSecondary?: boolean;
}

export default function AppLogo({ isSecondary }: AppLogoProps) {
    const className = cn("text-xl font-semibold", isSecondary && "text-muted-foreground");

    return (
        <Link href="/" className={className}>
            xByte
        </Link>
    );
}
