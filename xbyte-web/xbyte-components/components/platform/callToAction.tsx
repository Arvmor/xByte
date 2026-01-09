import { Button } from "@/components/ui/button";

export interface CallToActionProps {
    titleText: string;
    subtitleText?: string;
    descriptionText?: string;
    buttonText?: string;
    buttonAction?: () => void;
    secondaryButtonText?: string;
    secondaryButtonAction?: () => void;
}

export default function CallToAction({
    titleText,
    subtitleText,
    descriptionText,
    buttonText,
    buttonAction,
    secondaryButtonText,
    secondaryButtonAction,
}: CallToActionProps) {
    const primaryButton = buttonText && (
        <Button size="lg" onClick={buttonAction} className="font-semibold">
            {buttonText}
        </Button>
    );

    const secondaryButton = secondaryButtonText && (
        <Button size="lg" variant="outline" onClick={secondaryButtonAction} className="font-semibold">
            {secondaryButtonText}
        </Button>
    );

    return (
        <div className="flex flex-col items-center justify-center text-center space-y-8 py-20">

            <div className="space-y-4 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {titleText}
                </h1>

                {subtitleText && (
                    <p className="text-2xl md:text-3xl text-muted-foreground font-medium">{subtitleText}</p>
                )}

                {descriptionText && <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{descriptionText}</p>}
            </div>

            <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                {primaryButton}
                {secondaryButton}
            </div>
        </div>
    );
}
