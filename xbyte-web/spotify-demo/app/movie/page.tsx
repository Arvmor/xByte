import { ItemProps } from "@/components/track/item";
import { MoviePlayer } from "@/components/track/player";
import { Card, CardContent } from "@/components/ui/card";

const propTrack: ItemProps = {
    title: "Movie 1",
    name: "Actor 1",
    image: "/placeholder.jpg",
    size: 400,
};

export default function MoviePage() {
    const { title, name } = propTrack;

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
                                    <MoviePlayer />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
