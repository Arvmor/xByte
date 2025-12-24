"use client";

import { useState, FormEvent } from "react";
import { xByteClient } from "xbyte-sdk";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { formatAmount } from "@/lib/utils";
import {
    DollarSign,
    CheckCircle,
    XCircle,
} from "lucide-react";

type PriceState = "idle" | "setting" | "success" | "error";

export default function PublishForm({ client }: { client: xByteClient }) {
    return (
        <div className="flex flex-col gap-6 w-full max-w-xl">
            <PriceCard client={client} />
        </div>
    );
}

function PriceCard({ client }: { client: xByteClient }) {
    const [price, setPrice] = useState<string>("");
    const [bucket, setBucket] = useState<string>("");
    const [object, setObject] = useState<string>("");
    const [priceState, setPriceState] = useState<PriceState>("idle");

    const handleSetPrice = async (e: FormEvent) => {
        e.preventDefault();
        if (!price || !bucket || !object) return;
        setPriceState("setting");

        // Format the price to 6 decimals
        const formattedPrice = formatAmount(price, 6);
        const response = await client.setPrice({
            bucket,
            object,
            price: formattedPrice
        });
        if (response.status === "Success") {
            setPriceState("success");
        } else {
            setPriceState("error");
        }
    };

    return (
        <Card>
            {/* Card Header */}
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="size-5" />
                    Set Price
                </CardTitle>
                <CardDescription>Set the price for your content (in USDC)</CardDescription>
            </CardHeader>
            {/* Card Content */}
            <form onSubmit={handleSetPrice} className="flex flex-col gap-4">
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="bucket" className="text-sm font-medium">
                            Bucket
                        </label>
                        <Input
                            id="bucket"
                            value={bucket}
                            onChange={(e) => setBucket(e.target.value)}
                            required
                            placeholder="my-bucket"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="object" className="text-sm font-medium">
                            Object
                        </label>
                        <Input
                            id="object"
                            value={object}
                            onChange={(e) => setObject(e.target.value)}
                            required
                            placeholder="path/to/object.mp4"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="price" className="text-sm font-medium">
                            Price (USDC) / 1MB
                        </label>
                        <Input
                            id="price"
                            type="number"
                            step="0.0001"
                            min="0"
                            placeholder="0.0001"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <PriceStatus state={priceState} />
                    <Button type="submit" disabled={!price || !bucket || !object || priceState === "setting"}>
                        {priceState === "setting" && <Spinner />}
                        {priceState === "setting" ? "Setting..." : "Set Price"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}

function PriceStatus({ state }: { state: PriceState }) {
    if (state === "success") {
        return (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="size-4" />
                <span className="text-sm">Price set</span>
            </div>
        );
    }
    if (state === "error") {
        return (
            <div className="flex items-center gap-2 text-destructive">
                <XCircle className="size-4" />
                <span className="text-sm">Failed</span>
            </div>
        );
    }
    return <div />;
}
