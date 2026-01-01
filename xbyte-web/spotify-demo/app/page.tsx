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
                size: 200,
            },
            {
                title: "Song 2",
                name: "Artist 2",
                image: "/placeholder.jpg",
                size: 200,
            },
            {
                title: "Song 3",
                name: "Artist 3",
                image: "/placeholder.jpg",
                size: 200,
            },
            {
                title: "Song 4",
                name: "Artist 4",
                image: "/placeholder.jpg",
                size: 200,
            },
        ],
    },
    {
        title: "Featured Movies",
        items: [
            {
                title: "Movie 1",
                name: "Actor 1",
                image: "/placeholder.jpg",
                size: 200,
            },
            {
                title: "Movie 2",
                name: "Actor 2",
                image: "/placeholder.jpg",
                size: 200,
            },
            {
                title: "Movie 3",
                name: "Actor 3",
                image: "/placeholder.jpg",
                size: 200,
            },
            {
                title: "Movie 4",
                name: "Actor 4",
                image: "/placeholder.jpg",
                size: 200,
            },
        ],
    },
];

export default function Home() {
    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                        Good evening
                    </h1>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        Discover your next favorite track or movie
                    </p>
                </div>

                {trending.map(({ title, items }) => (
                    <section key={title} className="mb-12 sm:mb-16">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
                            {title === "Trending Songs" && (
                                <Link
                                    href="/track"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Show all
                                </Link>
                            )}
                            {title === "Featured Movies" && (
                                <Link
                                    href="/movie"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Show all
                                </Link>
                            )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
                            {items.map((item) => (
                                <Link
                                    key={item.title}
                                    href={title === "Featured Movies" ? "/movie" : "/track"}
                                    className="group"
                                >
                                    <TrackItem
                                        title={item.title}
                                        name={item.name}
                                        image={item.image}
                                        size={item.size}
                                    />
                                </Link>
                            ))}
                        </div>
                    </section>
                ))}
            </main>
        </div>
    );
}
