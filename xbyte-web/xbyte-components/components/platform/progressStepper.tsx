"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { motion, Variants } from "motion/react";

export interface ProgressStepperProps {
    labels: string[];
    currentStep: number;
    className?: string;
}

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const staggerItem: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

type StepState = "completed" | "current" | "upcoming";

function getStepState(index: number, currentStep: number): StepState {
    if (index < currentStep) return "completed";
    if (index === currentStep) return "current";
    return "upcoming";
}

function StepIndicator({ index, state }: { index: number; state: StepState }) {
    const indicatorClass = cn(
        "flex items-center justify-center size-10 rounded-full border-2 transition-colors",
        state === "completed" && "bg-primary border-primary text-primary-foreground",
        state === "current" && "bg-primary/10 border-primary text-primary",
        state === "upcoming" && "bg-muted border-muted-foreground/30 text-muted-foreground",
    );

    const content =
        state === "completed" ? (
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
                <CheckCircle2 className="size-5" />
            </motion.div>
        ) : (
            <span className="text-sm font-semibold">{index + 1}</span>
        );

    return (
        <motion.div
            className={indicatorClass}
            animate={state === "current" ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
        >
            {content}
        </motion.div>
    );
}

function StepLabel({ label, isCurrent }: { label: string; isCurrent: boolean }) {
    const labelClass = cn(
        "mt-2 text-xs font-medium text-center whitespace-nowrap",
        isCurrent ? "text-foreground" : "text-muted-foreground",
    );

    return <span className={labelClass}>{label}</span>;
}

function StepConnector({ completed }: { completed: boolean }) {
    const connectorClass = cn(
        "h-0.5 transition-colors",
        completed ? "bg-primary" : "bg-muted-foreground/30",
    );

    return (
        <motion.div className="flex-1 px-8" variants={staggerItem}>
            <div className={connectorClass} />
        </motion.div>
    );
}

function Step({ label, index, state }: { label: string; index: number; state: StepState }) {
    return (
        <motion.div className="flex flex-col items-center" variants={staggerItem}>
            <StepIndicator index={index} state={state} />
            <StepLabel label={label} isCurrent={state === "current"} />
        </motion.div>
    );
}

export default function ProgressStepper({ labels, currentStep, className }: ProgressStepperProps) {
    const items = labels.flatMap((label, index) => {
        const step = (
            <Step
                key={`step-${index}`}
                label={label}
                index={index}
                state={getStepState(index, currentStep)}
            />
        );

        if (index === labels.length - 1) return [step];

        const connector = (
            <StepConnector key={`connector-${index}`} completed={index < currentStep} />
        );

        return [step, connector];
    });

    return (
        <motion.div
            className={cn("flex items-center", className)}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
        >
            {items}
        </motion.div>
    );
}
