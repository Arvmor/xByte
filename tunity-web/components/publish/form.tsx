"use client"

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { TunityClient } from "@/packages/tunity-sdk";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Upload, DollarSign, CheckCircle, XCircle, FileAudio, FileVideo, Trash2 } from "lucide-react";

type UploadState = "idle" | "uploading" | "success" | "error";
type PriceState = "idle" | "setting" | "success" | "error";

export default function PublishForm({ client }: { client: TunityClient }) {
    const [file, setFile] = useState<File | null>(null);
    const [contentKey, setContentKey] = useState<string>("");
    const [price, setPrice] = useState<string>("");
    const [uploadState, setUploadState] = useState<UploadState>("idle");
    const [priceState, setPriceState] = useState<PriceState>("idle");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        
        setFile(selectedFile);
        setUploadState("idle");
        setContentKey("");
        setErrorMessage("");
    };

    const handleRemoveFile = () => {
        setFile(null);
        setContentKey("");
        setUploadState("idle");
        setErrorMessage("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploadState("uploading");
        setErrorMessage("");

        const response = await client.uploadContent(file);
        
        if (response.status === "Success") {
            setContentKey(response.data);
            setUploadState("success");
        } else {
            setErrorMessage(response.data);
            setUploadState("error");
        }
    };

    const handleSetPrice = async (e: FormEvent) => {
        e.preventDefault();
        if (!contentKey || !price) return;

        setPriceState("setting");
        setErrorMessage("");

        const response = await client.setPrice({ price: price });

        if (response.status === "Success") {
            setPriceState("success");
        } else {
            setErrorMessage(response.data);
            setPriceState("error");
        }
    };

    const isAudio = file?.type.startsWith("audio/");
    const isVideo = file?.type.startsWith("video/");
    const FileIcon = isVideo ? FileVideo : FileAudio;

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-xl">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="size-5" />
                        Upload Content
                    </CardTitle>
                    <CardDescription>
                        Upload your audio or video content to Tunity
                    </CardDescription>
                </CardHeader>
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
                                        {formatFileSize(file.size)} - {isAudio ? "Audio" : isVideo ? "Video" : "File"}
                                    </span>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon-sm" onClick={handleRemoveFile}>
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <UploadStatus state={uploadState} />
                    <Button 
                        onClick={handleUpload} 
                        disabled={!file || uploadState === "uploading" || uploadState === "success"}
                    >
                        {uploadState === "uploading" && <Spinner />}
                        {uploadState === "uploading" ? "Uploading..." : "Upload"}
                    </Button>
                </CardFooter>
            </Card>

            <Card className={uploadState !== "success" ? "opacity-50 pointer-events-none" : ""}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="size-5" />
                        Set Price
                    </CardTitle>
                    <CardDescription>
                        Set the price for your content (in USDC)
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSetPrice}>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="content-key" className="text-sm font-medium">
                                Content Key
                            </label>
                            <Input
                                id="content-key"
                                value={contentKey}
                                readOnly
                                className="bg-muted"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="price" className="text-sm font-medium">
                                Price (USDC)
                            </label>
                            <Input
                                id="price"
                                type="number"
                                step="0.000001"
                                min="0"
                                placeholder="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                        <PriceStatus state={priceState} />
                        <Button 
                            type="submit"
                            disabled={!contentKey || !price || priceState === "setting"}
                        >
                            {priceState === "setting" && <Spinner />}
                            {priceState === "setting" ? "Setting..." : "Set Price"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                    <XCircle className="size-4" />
                    <span className="text-sm">{errorMessage}</span>
                </div>
            )}

            {priceState === "success" && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                    <CheckCircle className="size-4" />
                    <span className="text-sm">Content published successfully!</span>
                </div>
            )}
        </div>
    );
}

function UploadStatus({ state }: { state: UploadState }) {
    if (state === "success") {
        return (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="size-4" />
                <span className="text-sm">Uploaded</span>
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
