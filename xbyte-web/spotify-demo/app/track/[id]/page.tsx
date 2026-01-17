import Image from "next/image";
import { notFound } from "next/navigation";
import TrackPlayer from "@/components/track/player";
import { Card, CardContent } from "@/components/ui/card";
import { TrackItem, tracks } from "@/lib/data";
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

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
                <div className="max-w-2xl mx-auto">
                    <TrackCard {...track} />
                </div>
            </div>
        </div>
    );
}

function TrackCard({ title, name, image, size, uuid }: TrackItem) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-full max-w-xs">
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted shadow-xl">
                            <Image
                                src={image}
                                alt={title}
                                width={size}
                                height={size}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    <div className="w-full text-center space-y-1">
                        <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
                        <p className="text-sm sm:text-base text-muted-foreground">{name}</p>
                    </div>
                    <div className="w-full">
                        <TrackPlayer mimeType="audio/mpeg" contentKey={uuid} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
