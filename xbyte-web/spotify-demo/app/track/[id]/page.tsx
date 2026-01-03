import Image from "next/image";
import { notFound } from "next/navigation";
import TrackPlayer from "@/components/track/player";
import { Card, CardContent } from "@/components/ui/card";
import { tracks } from "@/lib/data";
import { UUID } from "crypto";

export function generateStaticParams() {
    return tracks.map((track) => ({
        id: track.uuid,
    }));
}

interface TrackPageProps {
    params: Promise<{ id: UUID }>;
}

export default async function TrackPage({ params }: TrackPageProps) {
    const { id } = await params;
    const track = tracks.find((t) => t.uuid === id);
    if (!track) {
        notFound();
    }

    const { title, name, image, size } = track;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                <div className="max-w-4xl mx-auto">
                    <Card className="overflow-hidden">
                        <CardContent className="p-6 sm:p-8 lg:p-12">
                            <div className="flex flex-col items-center gap-8">
                                <div className="w-full max-w-sm">
                                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted shadow-2xl">
                                        <Image
                                            src={image}
                                            alt={title}
                                            width={size}
                                            height={size}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="w-full text-center space-y-2">
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                                        {title}
                                    </h1>
                                    <p className="text-lg sm:text-xl text-muted-foreground">
                                        {name}
                                    </p>
                                </div>
                                <div className="w-full">
                                    <TrackPlayer mimeType="audio/mpeg" contentKey={id} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
