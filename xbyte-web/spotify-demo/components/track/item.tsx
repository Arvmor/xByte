import Image from "next/image";
import { Play } from "lucide-react";

/** Item component props */
export interface ItemProps {
    /** The title of the item */
    title: string;
    /** The name of the item */
    name: string;
    /** The image of the item */
    image: string;
    /** The image size */
    size: number;
}

/** Item component */
export default function TrackItem({ title, name, image, size }: ItemProps) {
    return (
        <div className="flex flex-col gap-3 group/item">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted shadow-lg transition-all duration-300 group-hover/item:shadow-xl">
                <Image
                    src={image}
                    alt={title}
                    width={size}
                    height={size}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/item:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover/item:translate-y-0">
                        <div className="bg-primary rounded-full p-3 shadow-lg">
                            <Play className="size-5 text-primary-foreground fill-primary-foreground ml-0.5" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-1 min-h-[3.5rem]">
                <h2 className="text-sm sm:text-base font-semibold line-clamp-1 group-hover/item:text-primary transition-colors">
                    {title}
                </h2>
                <h3 className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{name}</h3>
            </div>
        </div>
    );
}
