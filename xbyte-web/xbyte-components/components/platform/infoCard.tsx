import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface InfoCardProps {
    title: string;
    description?: string;
    items?: string[];
    Icon?: React.ElementType;
    variant?: "default" | "highlight";
    layout?: "compact" | "detailed";
    className?: string;
}

function CardIcon({ Icon, highlight }: { Icon: React.ElementType; highlight: boolean }) {
    const iconContainerClass = cn(
        "rounded-lg flex items-center justify-center transition-colors",
        highlight
            ? "w-14 h-14 rounded-xl bg-primary/20"
            : "w-12 h-12 bg-primary/10 group-hover:bg-primary/20",
    );

    return (
        <div className={iconContainerClass}>
            <Icon className={cn("text-primary", highlight ? "size-7" : "size-6")} />
        </div>
    );
}

function ItemList({ items, highlight }: { items: string[]; highlight: boolean }) {
    const bulletClass = cn(
        "mt-2 w-1 h-1 rounded-full shrink-0",
        highlight ? "bg-primary" : "bg-muted-foreground",
    );

    return (
        <ul className="space-y-2">
            {items.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                    <div className={bulletClass} />
                    <span className="text-sm text-muted-foreground">{item}</span>
                </li>
            ))}
        </ul>
    );
}

function DetailedLayout({
    title,
    description,
    items,
    Icon,
}: Omit<InfoCardProps, "variant" | "layout" | "className">) {
    return (
        <>
            <CardHeader>
                {Icon && (
                    <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="size-6 text-primary" />
                    </div>
                )}
                <CardTitle className="text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {description && (
                    <p className="text-muted-foreground mb-4 leading-relaxed">{description}</p>
                )}
                {items && items.length > 0 && (
                    <ul className="space-y-3">
                        {items.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                <span className="text-sm text-muted-foreground">{item}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </>
    );
}

function CompactLayout({
    title,
    description,
    items,
    Icon,
    highlight,
}: Omit<InfoCardProps, "layout" | "className"> & { highlight: boolean }) {
    const titleClass = cn("font-bold mb-2", description || items ? "text-xl mb-3" : "text-lg");

    return (
        <CardContent className="pt-6">
            <div className="flex flex-col h-full">
                {Icon && <CardIcon Icon={Icon} highlight={highlight} />}
                <h3 className={titleClass}>{title}</h3>
                {description && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {description}
                    </p>
                )}
                {items && items.length > 0 && <ItemList items={items} highlight={highlight} />}
            </div>
        </CardContent>
    );
}

export default function InfoCard({
    title,
    description,
    items,
    Icon,
    variant = "default",
    layout = "compact",
    className,
}: InfoCardProps) {
    const highlight = variant === "highlight";

    const cardClass = cn(
        "group hover:shadow-lg transition-all duration-300 hover:-translate-y-1",
        highlight ? "border-primary/50 bg-primary/5" : "hover:border-primary/50",
        className,
    );

    const content =
        layout === "detailed" ? (
            <DetailedLayout title={title} description={description} items={items} Icon={Icon} />
        ) : (
            <CompactLayout
                title={title}
                description={description}
                items={items}
                Icon={Icon}
                highlight={highlight}
            />
        );

    return <Card className={cardClass}>{content}</Card>;
}
