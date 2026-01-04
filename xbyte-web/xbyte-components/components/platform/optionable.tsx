export interface OptionableProps {
    titleText: string;
    descriptionText?: string;
    Icon?: React.ElementType;
    onClick?: () => void;
}

export default function Option({ titleText, descriptionText, Icon, onClick }: OptionableProps) {
    return (
        <div
            className="flex flex-col items-center bg-muted rounded-sm p-8 h-100 w-full cursor-pointer hover:border-muted-foreground/30 border-transparent border-2 transition-all duration-300"
            onClick={onClick}
        >
            <div className="flex items-center justify-center h-full text-background">
                {Icon && <Icon className="size-24" />}
            </div>

            <div className="flex flex-col items-center justify-center text-center">
                <h1 className="text-sm text-muted-foreground">{titleText}</h1>
                <h2 className="text-xl font-bold">{descriptionText}</h2>
            </div>
        </div>
    );
}
