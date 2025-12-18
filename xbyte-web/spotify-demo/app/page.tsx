import TrackItem, { ItemProps } from "@/components/track/item";
import Link from "next/link";

const trending: { title: string; items: ItemProps[] }[] = [
    {
        title: "Trending Songs",
        items: [
            {
                title: "Song 1",
                name: "Artist 1",
                image: "/placeholder.jpg",
                size: 100,
            },
        ],
    },
    {
        title: "Popular Artists",
        items: [
            {
                title: "Podcast 1",
                name: "Artist 1",
                image: "/placeholder.jpg",
                size: 100,
            },
        ],
    },
    {
        title: "Featured",
        items: [
            {
                title: "Podcast 1",
                name: "Artist 1",
                image: "/placeholder.jpg",
                size: 100,
            },
        ],
    },
];

export default function Home() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <main className="flex min-h-screen w-full flex-col justify-between py-32 px-16">
                {/* Content */}
                {trending.map(({ title, items }) => (
                    <div key={title} className="flex flex-col gap-4">
                        <h1 className="text-2xl font-bold">{title}</h1>
                        {items.map(({ title, name, image, size }) => (
                            <Link key={title} href="/track">
                                <TrackItem title={title} name={name} image={image} size={size} />
                            </Link>
                        ))}
                    </div>
                ))}
            </main>
        </div>
    );
}
