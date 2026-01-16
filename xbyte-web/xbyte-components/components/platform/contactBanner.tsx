import { Mail } from "lucide-react";

export interface ContactBannerProps {
    email: string;
    message?: string;
}

const DEFAULT_MESSAGE = "If you're interested, contact us at";

export default function ContactBanner({
    email,
    message = DEFAULT_MESSAGE,
}: ContactBannerProps) {
    return (
        <div className="flex items-center justify-center gap-2 py-4 px-6 bg-muted/50 rounded-lg border border-dashed">
            <Mail className="size-4 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">
                {message}{" "}
                <a
                    href={`mailto:${email}`}
                    className="font-medium text-primary hover:underline"
                >
                    {email}
                </a>
            </p>
        </div>
    );
}
