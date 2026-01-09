import { cn } from "@/lib/utils";

export interface ProcessStep {
    title: string;
    description: string;
    Icon?: React.ElementType;
}

export interface ProcessStepsProps {
    steps: ProcessStep[];
    orientation?: "vertical" | "horizontal";
    className?: string;
}

function StepIndicator({ step, index }: { step: ProcessStep; index: number }) {
    const content = step.Icon ? <step.Icon className="size-6" /> : index + 1;

    return (
        <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg z-10 relative">
            {content}
        </div>
    );
}

function StepConnector({ vertical }: { vertical: boolean }) {
    const connectorClass = cn(
        "bg-gradient-to-b from-primary/50 to-primary/20",
        vertical ? "w-0.5 h-16 -my-2" : "h-0.5 w-full flex-1",
    );

    return <div className={connectorClass} />;
}

function StepContent({ step, vertical }: { step: ProcessStep; vertical: boolean }) {
    return (
        <div className={cn("flex-1", !vertical && "text-center")}>
            <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
        </div>
    );
}

function ProcessStepItem({
    step,
    index,
    isLast,
    vertical,
}: {
    step: ProcessStep;
    index: number;
    isLast: boolean;
    vertical: boolean;
}) {
    const itemClass = cn("relative flex gap-4", vertical ? "flex-row" : "flex-col min-w-[280px]");
    const indicatorContainerClass = cn(
        "flex",
        vertical ? "flex-col items-center" : "flex-row items-center gap-3",
    );

    return (
        <div className={itemClass}>
            <div className={indicatorContainerClass}>
                <StepIndicator step={step} index={index} />
                {!isLast && <StepConnector vertical={vertical} />}
            </div>
            <StepContent step={step} vertical={vertical} />
        </div>
    );
}

export default function ProcessSteps({
    steps,
    orientation = "vertical",
    className,
}: ProcessStepsProps) {
    const vertical = orientation === "vertical";
    const containerClass = cn(
        "relative",
        vertical ? "space-y-8" : "flex gap-4 overflow-x-auto pb-4",
        className,
    );

    return (
        <div className={containerClass}>
            {steps.map((step, index) => (
                <ProcessStepItem
                    key={index}
                    step={step}
                    index={index}
                    isLast={index === steps.length - 1}
                    vertical={vertical}
                />
            ))}
        </div>
    );
}
