import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    description?: string;
    align?: "left" | "center" | "right";
    className?: string;
}

export default function SectionHeader({
    title,
    subtitle,
    description,
    align = "center",
    className,
}: SectionHeaderProps) {
    const alignmentClasses = {
        left: "text-left items-start",
        center: "text-center items-center",
        right: "text-right items-end",
    };

    return (
        <div className={cn("flex flex-col space-y-3 mb-12", alignmentClasses[align], className)}>
            {subtitle && <p className="text-sm font-semibold text-primary uppercase tracking-wider">{subtitle}</p>}

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>

            {description && <p className="text-lg text-muted-foreground max-w-2xl">{description}</p>}
        </div>
    );
}
