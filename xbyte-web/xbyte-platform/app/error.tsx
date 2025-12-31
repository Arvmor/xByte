"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const errorMessage = {
    description: "Something went wrong!",
    message: "An unexpected error occurred",
    buttonText: "Try again",
};

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
            <AlertCircle className="size-12 text-destructive" />
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">{errorMessage.description}</h2>
                <p className="text-muted-foreground">{error.message || errorMessage.message}</p>
            </div>
            <Button onClick={reset} variant="outline">
                {errorMessage.buttonText}
            </Button>
        </div>
    );
}
