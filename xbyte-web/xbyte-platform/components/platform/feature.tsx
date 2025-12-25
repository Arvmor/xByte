import Image from "next/image";
import { cn } from "@/lib/utils";

export interface FeatureProps {
    title?: string;
    description?: string;
    Icon?: React.ElementType;
    imageSrc?: string;
}

export default function Feature({
    title,
    description,
    Icon,
    imageSrc,
    className,
}: FeatureProps & React.ComponentProps<"div">) {
    return (
        <div className={cn("space-y-4 w-full aspect-square", className)}>
            {/* Icon / Image */}
            <div className="flex items-center justify-center bg-muted rounded-sm text-background h-full">
                {Icon && <Icon className="size-24" />}
                {imageSrc && <Image src={imageSrc} alt={title ?? ""} width={100} height={100} />}
            </div>

            {/* Title */}
            <div className="text-2xl">
                <h1 className="font-bold">{title}</h1>
                <p className="font-medium text-muted-foreground/80">{description}</p>
            </div>
        </div>
    );
}
