"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import XPay, { useXPayAsync } from "@/components/privy/pay";
import {
    Download,
    FastForward,
    Pause,
    Play,
    Rewind,
    DollarSign,
    Package,
    TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "../ui/input";
import { UUID } from "crypto";
import { xByteClient } from "xbyte-sdk";
import { formatFromDecimals } from "@/lib/utils";

const PLAY_URL = `${process.env.NEXT_PUBLIC_XBYTE_URL}/s3/bucket`;

/** The MIME types */
export type MimeType = "audio/mpeg" | "video/mp4";

/** Default chunk size in bytes (1MB) */
const DEFAULT_CHUNK_SIZE = 1024 * 1024;

/** Maximum payment value per chunk */
const MAX_PAYMENT_VALUE = BigInt(1000);

const client = new xByteClient(process.env.NEXT_PUBLIC_XBYTE_URL);

/** Chunk state for managing streaming */
interface ChunkState {
    key: UUID;
    offset: number;
    chunkSize: number;
    chunks: Uint8Array[];
}

/** The track player component */
export default function TrackPlayer({ mimeType, contentKey }: StreamingPlayerProps) {
    return (
        <XPay>
            <StreamingPlayer mimeType={mimeType} contentKey={contentKey} />
        </XPay>
    );
}

interface StreamingPlayerProps {
    contentKey: string;
    mimeType: MimeType;
}

/** Streaming player with chunk-based payment */
export function StreamingPlayer({ mimeType, contentKey }: StreamingPlayerProps) {
    const [chunkSize, setChunkSize] = useState("0.5");
    const [chunkState, setChunkState] = useState<ChunkState | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [totalBytes, setTotalBytes] = useState(0);
    const [price, setPrice] = useState(0);

    const isAudio = mimeType === "audio/mpeg";
    const ref = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);
    const xPayAsync = useXPayAsync();

    const onTimeUpdate = () => {
        if (!ref.current) return;
        setCurrentTime(ref.current.currentTime);
        setDuration(ref.current.duration);
    };

    useEffect(() => {
        const getPrice = async () => {
            const result = await client.getPrice("xbyte-runtime", contentKey);
            if (result.status !== "Success") return setPrice(1000);
            setPrice(result.data);
        };
        getPrice();
    }, [contentKey]);

    const fetchNextChunk = useCallback(async () => {
        if (!contentKey || isLoading) return;

        const size = Number(chunkSize) * DEFAULT_CHUNK_SIZE;
        const currentOffset = chunkState?.offset ?? 0;

        setIsLoading(true);

        const { status, data } = await xPayAsync({
            url: `${PLAY_URL}/xbyte-runtime/object/${contentKey}?offset=${currentOffset}&length=${size}`,
            body: {},
            maxValue: MAX_PAYMENT_VALUE,
        });

        setIsLoading(false);

        if (status !== "Success") return;

        const newChunk = new Uint8Array(data);
        const prevChunks = chunkState?.chunks ?? [];
        const allChunks = [...prevChunks, newChunk];

        setChunkState({
            key: contentKey as UUID,
            offset: currentOffset + newChunk.length,
            chunkSize: size,
            chunks: allChunks,
        });

        setTotalBytes((prev) => prev + newChunk.length);

        if (ref.current) {
            updatePlayerSource(ref.current, allChunks, mimeType);
        }
    }, [contentKey, chunkSize, chunkState, isLoading, xPayAsync, mimeType]);

    const handlePlayPause = async () => {
        if (!ref.current) return;

        if (isPlaying) ref.current?.pause();
        else await ref.current?.play();

        setIsPlaying(!isPlaying);
    };

    const hasContent = chunkState !== null && chunkState.chunks.length > 0;

    const formatTime = (seconds: number): string => {
        if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleSeek = (value: number[]) => {
        if (ref.current && duration > 0) {
            ref.current.currentTime = value[0];
            setCurrentTime(value[0]);
        }
    };

    const PlayerElement = isAudio ? (
        <audio
            ref={ref as React.RefObject<HTMLAudioElement>}
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onTimeUpdate}
            hidden
        />
    ) : (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
            <video
                ref={ref as React.RefObject<HTMLVideoElement>}
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onTimeUpdate}
                className="w-full h-full object-contain"
                controls={false}
            />
        </div>
    );

    return (
        <div className="flex flex-col gap-6 w-full">
            {PlayerElement}

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <Slider
                        value={[currentTime]}
                        max={duration || 1}
                        step={0.1}
                        onValueChange={handleSeek}
                        className="flex-1"
                        disabled={!hasContent}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <span>{formatTime(currentTime)}</span>
                        <span>/</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>Loaded: {formatBytes(totalBytes)}</span>
                        {chunkState && <span>• {chunkState.chunks.length} chunks</span>}
                    </div>
                </div>
            </div>

            <PlayerControllers
                isPlaying={isPlaying}
                hasContent={hasContent}
                onPlayPause={handlePlayPause}
                onFetchNextChunk={fetchNextChunk}
                contentKey={contentKey}
                isLoading={isLoading}
            />

            <ContentKeyInput
                price={price}
                loadedBytes={totalBytes}
                chunkSize={chunkSize}
                onChunkSizeChange={setChunkSize}
                chunkState={chunkState}
            />
        </div>
    );
}

interface PlayerControllersProps {
    isPlaying: boolean;
    hasContent: boolean;
    onPlayPause: () => void;
    onFetchNextChunk: () => void;
    contentKey: string;
    isLoading: boolean;
}

export function PlayerControllers({
    isPlaying,
    hasContent,
    onPlayPause,
    onFetchNextChunk,
    contentKey,
    isLoading,
}: PlayerControllersProps) {
    const playerIcon = isPlaying ? (
        <Pause className="size-6 sm:size-7 fill-current" />
    ) : (
        <Play className="size-6 sm:size-7 fill-current ml-0.5" />
    );

    return (
        <div className="flex items-center justify-center gap-2 sm:gap-4">
            <Button
                variant="ghost"
                size="icon"
                disabled={!hasContent}
                className="size-10 sm:size-12"
            >
                <Rewind className="size-5" />
            </Button>

            <Button
                variant="default"
                size="icon"
                onClick={onPlayPause}
                disabled={!hasContent}
                className="size-14 sm:size-16 rounded-full shadow-lg hover:scale-105 transition-transform"
            >
                {playerIcon}
            </Button>

            <Button
                variant="ghost"
                size="icon"
                disabled={!hasContent}
                className="size-10 sm:size-12"
            >
                <FastForward className="size-5" />
            </Button>

            <Button
                variant="secondary"
                size="icon"
                onClick={onFetchNextChunk}
                disabled={!contentKey || isLoading}
                title="Fetch & pay for next chunk"
                className="size-10 sm:size-12"
            >
                <Download className={`size-5 ${isLoading ? "animate-pulse" : ""}`} />
            </Button>
        </div>
    );
}

/** Updates the player source by combining all chunks */
function updatePlayerSource(
    player: HTMLAudioElement | HTMLVideoElement,
    chunks: Uint8Array[],
    mimeType: string,
) {
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const combined = new Uint8Array(totalLength);

    let offset = 0;
    chunks.forEach((chunk) => {
        combined.set(chunk, offset);
        offset += chunk.length;
    });

    const blob = new Blob([combined], { type: mimeType });
    const currentTime = player.currentTime;

    URL.revokeObjectURL(player.src);
    player.src = URL.createObjectURL(blob);
    player.currentTime = currentTime;
}

/** Formats bytes to human readable string */
function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function ContentKeyInput({
    chunkSize,
    onChunkSizeChange,
    price,
    chunkState,
    loadedBytes,
}: {
    chunkSize: string;
    onChunkSizeChange: (size: string) => void;
    price: number;
    chunkState: ChunkState | null;
    loadedBytes: number;
}) {
    const chunkSizeNum = parseFloat(chunkSize) || 0;
    const pricePerChunk = price * chunkSizeNum;
    const numChunks = chunkState?.chunks.length ?? 0;
    const totalCost = pricePerChunk * (loadedBytes / 1024 / 1024);
    const isValidChunkSize = chunkSizeNum > 0;

    return (
        <div className="flex flex-col gap-4 p-4 sm:p-5 rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground">Chunk Size</label>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md">
                        <DollarSign className="size-3" />
                        <span className="font-medium">
                            {formatFromDecimals(BigInt(price), 6n)} USDC / MB
                        </span>
                    </div>
                </div>
                <div className="relative">
                    <Input
                        type="number"
                        step="0.25"
                        placeholder="Enter chunk size (e.g. 1)"
                        value={chunkSize}
                        onChange={(e) => onChunkSizeChange(e.target.value)}
                        min="0"
                        className={`w-full transition-all ${
                            isValidChunkSize
                                ? "border-primary/50 focus-visible:border-primary"
                                : "border-input"
                        }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <span className="text-xs text-muted-foreground font-medium">MB</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 text-sm pt-2 border-t">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                    <DollarSign className="size-3.5" />
                    {formatFromDecimals(BigInt(pricePerChunk), 6n)} / chunk
                </span>

                <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Package className="size-3.5" />
                    {numChunks} {numChunks === 1 ? "chunk" : "chunks"}
                </span>

                <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium">
                    <TrendingUp className="size-3.5" />${formatFromDecimals(BigInt(totalCost), 6n)}{" "}
                    Total Spent
                </span>
            </div>
        </div>
    );
}
