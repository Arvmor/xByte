import { Button } from "@/components/ui/button";

export interface CallToActionProps {
    titleText: string;
    descriptionText?: string;
    buttonText?: string;
    buttonAction?: () => void;
}

export default function CallToAction({
    titleText,
    descriptionText,
    buttonText,
    buttonAction,
}: CallToActionProps) {
    const description = descriptionText ? (
        <h1 className="text-muted-foreground/80">{descriptionText}</h1>
    ) : null;

    const button = buttonText ? (
        <Button size="sm" onClick={buttonAction}>
            {buttonText}
        </Button>
    ) : null;

    return (
        <div className="flex flex-col items-center justify-center gap-4 py-36">
            <div className="text-4xl font-bold text-center">
                <h1>{titleText}</h1>
                {description}
            </div>

            {button}
        </div>
    );
}
