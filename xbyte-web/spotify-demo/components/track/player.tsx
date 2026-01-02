"use client";

import { useCallback, useRef, useState } from "react";
import XPay, { useXPayAsync } from "@/components/privy/pay";
import { Download, FastForward, Pause, Play, Rewind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "../ui/input";
import { UUID } from "crypto";

const PLAY_URL = `${process.env.NEXT_PUBLIC_XBYTE_URL}/s3/bucket`;

/** The MIME types */
export enum MimeType {
    Audio = "audio/mpeg",
    Video = "video/mp4",
}

/** Default chunk size in bytes (1MB) */
const DEFAULT_CHUNK_SIZE = 1024 * 1024;

/** Maximum payment value per chunk */
const MAX_PAYMENT_VALUE = BigInt(1000);

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
export function StreamingPlayer({ mimeType, contentKey: initialKey }: StreamingPlayerProps) {
    const [contentKey, setContentKey] = useState(initialKey);
    const [chunkSize, setChunkSize] = useState("0.5");
    const [chunkState, setChunkState] = useState<ChunkState | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [totalBytes, setTotalBytes] = useState(0);

    const isAudio = mimeType === MimeType.Audio;
    const ref = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);
    const xPayAsync = useXPayAsync();

    const onTimeUpdate = () => {
        if (!ref.current) return;
        setCurrentTime(ref.current.currentTime);
        setDuration(ref.current.duration);
    };

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

    const resetPlayer = () => {
        setChunkState(null);
        setTotalBytes(0);
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
        if (ref.current) {
            URL.revokeObjectURL(ref.current.src);
            ref.current.src = "";
        }
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

    return (
        <div className="flex flex-col gap-6 w-full">
            <ContentKeyInput
                contentKey={contentKey}
                chunkSize={chunkSize}
                onKeyChange={setContentKey}
                onChunkSizeChange={setChunkSize}
                onReset={resetPlayer}
            />

            {isAudio ? (
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
            )}

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
                        onClick={handlePlayPause}
                        disabled={!hasContent}
                        className="size-14 sm:size-16 rounded-full shadow-lg hover:scale-105 transition-transform"
                    >
                        {isPlaying ? (
                            <Pause className="size-6 sm:size-7 fill-current" />
                        ) : (
                            <Play className="size-6 sm:size-7 fill-current ml-0.5" />
                        )}
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
                        onClick={fetchNextChunk}
                        disabled={!contentKey || isLoading}
                        title="Fetch & pay for next chunk"
                        className="size-10 sm:size-12"
                    >
                        <Download className={`size-5 ${isLoading ? "animate-pulse" : ""}`} />
                    </Button>
                </div>
            </div>
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
    contentKey,
    chunkSize,
    onKeyChange,
    onChunkSizeChange,
    onReset,
}: {
    contentKey: string;
    chunkSize: string;
    onKeyChange: (key: string) => void;
    onChunkSizeChange: (size: string) => void;
    onReset: () => void;
}) {
    return (
        <div className="flex flex-col gap-3 p-4 rounded-lg border bg-muted/50">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Content Key</label>
                <Input
                    type="text"
                    placeholder="Enter content UUID"
                    value={contentKey}
                    onChange={(e) => onKeyChange(e.target.value)}
                    className="w-full"
                />
            </div>
            <div className="flex items-end gap-2">
                <div className="flex-1 flex flex-col gap-2">
                    <label className="text-sm font-medium">Chunk Size (MB)</label>
                    <Input
                        type="number"
                        step="0.25"
                        placeholder="e.g. 1 (MB)"
                        value={chunkSize}
                        onChange={(e) => onChunkSizeChange(e.target.value)}
                        min="0"
                        className="w-full"
                    />
                </div>
                <Button variant="outline" size="default" onClick={onReset} className="mb-0">
                    Reset
                </Button>
            </div>
        </div>
    );
}
