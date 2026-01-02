import { notFound } from "next/navigation";
import TrackPlayer, { MimeType } from "@/components/track/player";
import { Card, CardContent } from "@/components/ui/card";
import { movies } from "@/lib/data";
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

    const { title, name } = movie;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                <div className="max-w-5xl mx-auto">
                    <Card className="overflow-hidden">
                        <CardContent className="p-6 sm:p-8 lg:p-12">
                            <div className="flex flex-col items-center gap-8">
                                <div className="w-full text-center space-y-2 mb-4">
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                                        {title}
                                    </h1>
                                    <p className="text-lg sm:text-xl text-muted-foreground">
                                        {name}
                                    </p>
                                </div>
                                <div className="w-full">
                                    <TrackPlayer mimeType={MimeType.Video} contentKey={id} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
