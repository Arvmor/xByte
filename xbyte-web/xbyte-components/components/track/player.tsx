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
    TrendingUp,
    Save,
    Repeat2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { UUID } from "crypto";
import { xByteClient } from "xbyte-sdk";
import { formatFromDecimals } from "@/lib/utils";
import {
    InputGroup,
    InputGroupInput,
    InputGroupAddon,
    InputGroupButton,
} from "@/components/ui/input-group";
import { useXBytePrivy } from "@/hooks/useXBytePrivy";

const PLAY_URL = `${process.env.NEXT_PUBLIC_XBYTE_URL}/s3/bucket`;

/** The MIME types */
export type MimeType = "audio/mpeg" | "video/mp4";

/** Default chunk size in bytes (1MB) */
const DEFAULT_CHUNK_SIZE = 1024 * 1024;

/** Maximum payment value per chunk */
const MAX_PAYMENT_VALUE = BigInt(10000000);

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
    const { ready, authenticated, login } = useXBytePrivy();
    const [chunkSize, setChunkSize] = useState(0.5);
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
        if (!contentKey || isLoading || !ready) return;
        if (!authenticated) return login();

        const size = Math.round(chunkSize * DEFAULT_CHUNK_SIZE);
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
            handlePlayPause();
        }
    }, [contentKey, chunkSize, chunkState, isLoading, xPayAsync, mimeType]);

    const handlePlayPause = async () => {
        if (!ref.current) return;

        if (isPlaying) ref.current?.pause();
        else await ref.current?.play();

        setIsPlaying(!isPlaying);
    };

    const hasContent = chunkState !== null && chunkState.chunks.length > 0;

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
            onEnded={handlePlayPause}
            hidden
        />
    ) : (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
            <video
                ref={ref as React.RefObject<HTMLVideoElement>}
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onTimeUpdate}
                onEnded={handlePlayPause}
                className="w-full h-full object-contain"
                controls={false}
            />
        </div>
    );

    return (
        <div className="flex flex-col gap-6 w-full">
            {PlayerElement}

            <PlayerSlider
                currentTime={currentTime}
                duration={duration}
                handleSeek={handleSeek}
                hasContent={hasContent}
            />

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
        <div className="flex flex-col gap-4 w-fit mx-auto">
            {/* Player controls */}
            <div className="flex items-center justify-center gap-2 sm:gap-4">
                <Button variant="ghost" size="icon" disabled={!hasContent}>
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

                <Button variant="ghost" size="icon" disabled={!hasContent}>
                    <FastForward className="size-5" />
                </Button>
            </div>

            {/* Pay to play button */}
            <Button onClick={onFetchNextChunk} disabled={!contentKey || isLoading}>
                <Download className="size-5" />
                Pay
            </Button>
        </div>
    );
}

export interface PlayerSliderProps {
    currentTime: number;
    duration: number;
    handleSeek: (value: number[]) => void;
    hasContent: boolean;
}

export function PlayerSlider({ currentTime, duration, handleSeek, hasContent }: PlayerSliderProps) {
    const formatTime = (seconds: number): string => {
        if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
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

            <div className="text-xs sm:text-sm text-muted-foreground">
                {formatTime(currentTime)} / {formatTime(duration)}
            </div>
        </div>
    );
}

/** Updates the player source by combining all chunks */
function updatePlayerSource(
    player: HTMLAudioElement | HTMLVideoElement,
    chunks: Uint8Array[],
    type: string,
) {
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const combined = new Uint8Array(totalLength);

    let offset = 0;
    chunks.forEach((chunk) => {
        combined.set(chunk, offset);
        offset += chunk.length;
    });

    const blob = new Blob([combined], { type });
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
    loadedBytes,
}: {
    chunkSize: number;
    onChunkSizeChange: (size: number) => void;
    price: number;
    loadedBytes: number;
}) {
    const pricePerChunk = price * chunkSize;
    const totalCost = price * (loadedBytes / DEFAULT_CHUNK_SIZE);

    return (
        <div className="flex flex-col gap-4 p-4 sm:p-5 rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {/* Chunk size input */}
                <InputGroup>
                    <InputGroupInput
                        placeholder="Chunk size in Megabytes"
                        type="number"
                        min={0}
                        step={0.25}
                        value={chunkSize}
                        onChange={(e) => onChunkSizeChange(Number(e.target.value))}
                    />
                    <InputGroupAddon>
                        <Save />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                        <InputGroupButton disabled>MB</InputGroupButton>
                    </InputGroupAddon>
                </InputGroup>

                <span>
                    <Repeat2 className="size-6 text-muted-foreground" />
                </span>

                {/* Total cost input */}
                <InputGroup>
                    <InputGroupInput
                        placeholder="Total cost in USDC"
                        type="number"
                        min={0}
                        step={0.0001}
                        value={formatFromDecimals(BigInt(Math.round(pricePerChunk)), 6n)}
                        onChange={(e) => {
                            const inputValue = parseFloat(e.target.value);
                            if (isNaN(inputValue) || price === 0) return;
                            const priceInSmallestUnit = Math.round(inputValue * 1e6);
                            const newChunkSize = priceInSmallestUnit / price;
                            onChunkSizeChange(Math.max(0, newChunkSize));
                        }}
                    />
                    <InputGroupAddon>
                        <DollarSign />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                        <InputGroupButton disabled>USDC</InputGroupButton>
                    </InputGroupAddon>
                </InputGroup>
            </div>

            <div className="flex items-center gap-6 text-sm pt-4 border-t text-green-600 dark:text-green-400 font-medium">
                <span className="flex items-center gap-1.5">
                    <Save className="size-3.5" />
                    Paid for {formatBytes(loadedBytes)}
                </span>

                <span className="flex items-center gap-1.5">
                    <TrendingUp className="size-3.5" />$
                    {formatFromDecimals(BigInt(Math.round(totalCost)), 6n)} Total Spent
                </span>
            </div>
        </div>
    );
}
