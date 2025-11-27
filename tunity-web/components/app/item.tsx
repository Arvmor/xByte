import Image from "next/image";

/** Item component props */
export interface ItemProps {
    /** The title of the item */
    title: string;
    /** The name of the item */
    name: string;
    /** The image of the item */
    image: string;
}

/** Item component */
export default function AppItem({ title, name, image }: ItemProps) {
    return (
        <div>
            <Image src={image} alt={title} width={100} height={100} />
            <h2 className="text-md font-bold">{title}</h2>
            <h3 className="text-muted-foreground">{name}</h3>
        </div>
    );
}