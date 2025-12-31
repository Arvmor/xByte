import { Button } from "@/components/ui/button";

export interface CallToActionProps {
    titleText: string;
    descriptionText?: string;
    buttonText?: string;
    buttonAction?: () => void;
    secondaryButtonText?: string;
    secondaryButtonAction?: () => void;
}

export default function CallToAction({
    titleText,
    descriptionText,
    buttonText,
    buttonAction,
    secondaryButtonText,
    secondaryButtonAction,
}: CallToActionProps) {
    const primaryButton = buttonText && (
        <Button size="sm" onClick={buttonAction}>
            {buttonText}
        </Button>
    );

    const secondaryButton = secondaryButtonText && (
        <Button size="sm" variant="secondary" onClick={secondaryButtonAction}>
            {secondaryButtonText}
        </Button>
    );

    return (
        <div className="flex flex-col items-center justify-center gap-8 py-36">
            <div className="text-center space-y-1">
                <h1 className="text-4xl font-bold">{titleText}</h1>
                <h1 className="text-3xl font-medium text-muted-foreground/80">{descriptionText}</h1>
            </div>

            <div className="flex items-center gap-2">
                {primaryButton}
                {secondaryButton}
            </div>
        </div>
    );
}
