"use client"

import { useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { TunityClient } from "@/lib/tunity-client";
import PublishForm from "@/components/publish/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_TUNITY_API_URL ?? "http://localhost:80";

export default function PublishPage() {
    const { user, ready, connectOrCreateWallet } = usePrivy();

    const client = useMemo(
        () => TunityClient.builder().baseUrl(API_BASE_URL).build(),
        []
    );

    if (!ready) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
                            <Upload className="size-6 text-primary" />
                        </div>
                        <CardTitle>Publisher Panel</CardTitle>
                        <CardDescription>
                            Connect your wallet to start publishing content on Tunity
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Button onClick={connectOrCreateWallet} size="lg">
                            Connect Wallet
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <main className="flex w-full flex-col items-center gap-8 py-16">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Publisher Panel</h1>
                    <p className="mt-2 text-muted-foreground">
                        Upload your content and set prices for your audience
                    </p>
                </div>
                <PublishForm client={client} />
            </main>
        </div>
    );
}
