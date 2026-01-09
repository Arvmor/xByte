import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FlowStep {
    label: string;
    Icon?: React.ElementType;
}

export interface PaymentFlowProps {
    steps: FlowStep[];
    className?: string;
}

function StepIcon({ step, index }: { step: FlowStep; index: number }) {
    const content = step.Icon ? (
        <step.Icon className="size-8" />
    ) : (
        <span className="text-2xl font-bold">{index + 1}</span>
    );

    return (
        <div className="w-16 h-16 rounded-xl bg-linear-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center shadow-lg">
            {content}
        </div>
    );
}

function FlowStepItem({ step, index, isLast }: { step: FlowStep; index: number; isLast: boolean }) {
    return (
        <div className="flex items-center gap-2 flex-1 w-full md:w-auto">
            <div className="flex flex-col items-center gap-3 flex-1">
                <StepIcon step={step} index={index} />
                <p className="text-sm text-center font-medium max-w-[180px]">{step.label}</p>
            </div>

            {!isLast && (
                <ArrowRight className="hidden md:block size-6 text-muted-foreground shrink-0 -mx-2" />
            )}
        </div>
    );
}

export default function PaymentFlow({ steps, className }: PaymentFlowProps) {
    return (
        <div className={cn("relative", className)}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
                {steps.map((step, index) => (
                    <FlowStepItem
                        key={index}
                        step={step}
                        index={index}
                        isLast={index === steps.length - 1}
                    />
                ))}
            </div>
        </div>
    );
}
