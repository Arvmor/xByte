import { cn } from "@/lib/utils";

export interface AppLogoProps {
    isSecondary?: boolean;
}

export default function AppLogo({ isSecondary }: AppLogoProps) {
    return (
        <h1 className={cn("text-xl font-semibold", isSecondary && "text-muted-foreground")}>
            xByte
        </h1>
    );
}
