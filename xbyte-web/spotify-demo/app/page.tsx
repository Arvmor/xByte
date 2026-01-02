import TrackItem from "@/components/track/item";
import Link from "next/link";
import { trending } from "@/lib/data";

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

                {trending.map(({ title, items }) => {
                    const href = title === "Featured Movies" ? `/movie` : `/track`;
                    const content = items.map(({ uuid, title, name, image, size }, index) => (
                        <Link key={index} href={`${href}/${uuid}`} className="group">
                            <TrackItem title={title} name={name} image={image} size={size} />
                        </Link>
                    ));

                    return (
                        <section key={title} className="mb-12 sm:mb-16">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
                                <h3 className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Show all
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
                                {content}
                            </div>
                        </section>
                    );
                })}
            </main>
        </div>
    );
}
