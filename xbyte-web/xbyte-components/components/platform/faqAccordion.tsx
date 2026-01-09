"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FAQItem {
    question: string;
    answer: string;
}

export interface FAQAccordionProps {
    items: FAQItem[];
    className?: string;
}

export default function FAQAccordion({ items, className }: FAQAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className={cn("space-y-3", className)}>
            {items.map((item, index) => (
                <div
                    key={index}
                    className="border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow duration-200"
                >
                    <button
                        onClick={() => toggleItem(index)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
                    >
                        <h3 className="text-lg font-semibold pr-4">{item.question}</h3>
                        <ChevronDown
                            className={cn(
                                "size-5 shrink-0 text-muted-foreground transition-transform duration-200",
                                openIndex === index && "rotate-180",
                            )}
                        />
                    </button>
                    <div
                        className={cn(
                            "overflow-hidden transition-all duration-200",
                            openIndex === index ? "max-h-96" : "max-h-0",
                        )}
                    >
                        <div className="px-5 pb-5 pt-2">
                            <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
