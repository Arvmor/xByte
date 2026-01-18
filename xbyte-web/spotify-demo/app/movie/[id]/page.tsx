import { notFound } from "next/navigation";
import TrackPlayer from "@/components/track/player";
import { Card, CardContent } from "@/components/ui/card";
import { movies, TrackItem } from "@/lib/data";
import { UUID } from "crypto";

export function generateStaticParams() {
    return movies.map((movie) => ({
        id: movie.uuid,
    }));
}

interface MoviePageProps {
    params: Promise<{ id: UUID }>;
}

export default async function MoviePage({ params }: MoviePageProps) {
    const { id } = await params;
    const movie = movies.find((m) => m.uuid === id);
    if (!movie) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
                <div className="max-w-3xl mx-auto">
                    <MovieCard {...movie} />
                </div>
            </div>
        </div>
    );
}

function MovieCard({ title, name, uuid }: TrackItem) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-full text-center space-y-1 mb-2">
                        <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
                        <p className="text-sm sm:text-base text-muted-foreground">{name}</p>
                    </div>
                    <div className="w-full">
                        <TrackPlayer mimeType="video/mp4" contentKey={uuid} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
