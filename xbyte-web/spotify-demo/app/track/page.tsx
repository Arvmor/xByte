import { ItemProps } from "@/components/track/item";
import TrackPlayer from "@/components/track/player";

const propTrack: ItemProps = {
  title: "Track 1",
  name: "Artist 1",
  image: "/placeholder.jpg",
  size: 500,
};

export default function TrackPage() {
  const { title, name, image, size } = propTrack;

  return (
    <div className="flex text-center items-center justify-center">
      <TrackPlayer title={title} name={name} image={image} size={size} />
    </div>
  );
}
