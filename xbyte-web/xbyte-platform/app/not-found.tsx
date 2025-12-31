import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const errorMessage = {
    title: "x404",
    description: "Page Not Found",
    message: "The page you are looking for does not exist.",
    buttonLink: "/",
    buttonText: "Go Home",
    buttonIcon: <Home className="size-4 mr-2" />,
};

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
            <div className="space-y-2">
                <h1 className="text-6xl font-bold">{errorMessage.title}</h1>
                <h2 className="text-2xl font-semibold">{errorMessage.description}</h2>
                <p className="text-muted-foreground">{errorMessage.message}</p>
            </div>
            <Button asChild>
                <Link href={errorMessage.buttonLink}>
                    {errorMessage.buttonIcon}
                    {errorMessage.buttonText}
                </Link>
            </Button>
        </div>
    );
}
