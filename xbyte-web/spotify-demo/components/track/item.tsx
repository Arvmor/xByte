import Image from "next/image";

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
    <div className="flex flex-col gap-2">
      <Image src={image} alt={title} width={size} height={size} />
      <h2 className="text-md font-bold">{title}</h2>
      <h3 className="text-muted-foreground">{name}</h3>
    </div>
  );
}
