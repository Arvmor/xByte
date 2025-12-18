"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
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
import { formatAmount, formatFileSize } from "@/lib/utils";
import {
    Upload,
    DollarSign,
    CheckCircle,
    XCircle,
    FileIcon,
    Trash2,
    ExternalLink,
} from "lucide-react";
import { UUID } from "crypto";

type UploadState = "idle" | "uploading" | "success" | "error";
type PriceState = "idle" | "setting" | "success" | "error";

export default function PublishForm({ client }: { client: xByteClient }) {
    return (
        <div className="flex flex-col gap-6 w-full max-w-xl">
            <UploadCard client={client} />
            <PriceCard client={client} />
        </div>
    );
}

function UploadCard({ client }: { client: xByteClient }) {
    const [file, setFile] = useState<File | null>(null);
    const [key, setKey] = useState<UUID | null>(null);
    const [uploadState, setUploadState] = useState<UploadState>("idle");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setUploadState("idle");
    };

    const handleRemoveFile = () => {
        setFile(null);
        setUploadState("idle");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploadState("uploading");

        const response = await client.uploadContent(file);
        if (response.status === "Success") {
            setKey(response.data as UUID);
            setUploadState("success");
        } else {
            setUploadState("error");
        }
    };

    return (
        <Card>
            {/* Card Header */}
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="size-5" />
                    Upload Content
                </CardTitle>
                <CardDescription>
                    Upload your audio or video content to start monetizing
                </CardDescription>
            </CardHeader>
            {/* Card Content */}
            <CardContent className="flex flex-col gap-4">
                <Input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,video/*"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                />
                {file && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-accent">
                        <div className="flex items-center gap-3">
                            <FileIcon className="size-8 text-muted-foreground" />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium truncate max-w-[200px]">
                                    {file.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {formatFileSize(file.size)}
                                </span>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon-sm" onClick={handleRemoveFile}>
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                )}
            </CardContent>
            {/* Card Footer */}
            <CardFooter className="flex justify-between items-center">
                <UploadStatus state={uploadState} contentKey={key} />
                <Button
                    onClick={handleUpload}
                    disabled={!file || uploadState === "uploading" || uploadState === "success"}
                >
                    {uploadState === "uploading" && <Spinner />}
                    {uploadState === "uploading" ? "Uploading..." : "Upload"}
                </Button>
            </CardFooter>
        </Card>
    );
}

function PriceCard({ client }: { client: xByteClient }) {
    const [price, setPrice] = useState<string>("");
    const [key, setKey] = useState<UUID | null>(null);
    const [priceState, setPriceState] = useState<PriceState>("idle");

    const handleSetPrice = async (e: FormEvent) => {
        e.preventDefault();
        if (!price || !key) return;
        setPriceState("setting");

        // Format the price to 6 decimals
        const formattedPrice = formatAmount(price, 6);
        const response = await client.setPrice({ key, price: formattedPrice });
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
                        <label htmlFor="key" className="text-sm font-medium">
                            Key
                        </label>
                        <Input
                            id="key"
                            value={key ?? ""}
                            onChange={(e) => setKey(e.target.value as UUID)}
                            required
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
                    <Button type="submit" disabled={!price || priceState === "setting"}>
                        {priceState === "setting" && <Spinner />}
                        {priceState === "setting" ? "Setting..." : "Set Price"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}

function UploadStatus({ state, contentKey }: { state: UploadState; contentKey: UUID | null }) {
    if (state === "success" && contentKey) {
        return (
            <div className="flex flex-col gap-2 text-sm">
                <Link
                    href={`/movie?key=${contentKey}`}
                    className="flex items-center gap-2 underline"
                    target="_blank"
                >
                    <ExternalLink className="size-4" />
                    Click to Pay & View
                </Link>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="size-4" />
                    <span className="text-sm">Uploaded {contentKey}</span>
                </div>
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
