"use client"

import { useCallback, useRef, useState } from "react";
import TrackItem, { ItemProps } from "@/components/track/item";
import XPay, { useXPayAsync } from "@/components/privy/pay";
import { Download, FastForward, Pause, Play, Rewind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "../ui/input";
import { UUID } from "crypto";

const PLAY_URL = `http://127.0.0.1:80/play`;

/** The MIME types */
const AUDIO_MIME = "audio/mpeg";
const VIDEO_MIME = "video/mp4";

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

/** Creates a play request body */
function createPlayRequestBody(key: UUID, offset: number, length: number): RequestInit {
    return {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, offset, length }),
    };
}

/** The track player component */
export default function TrackPlayer({title, name, image, size}: ItemProps) {
    return (
        <div className="flex flex-col gap-4">
            <TrackItem title={title} name={name} image={image} size={size} />
            <XPay>
                <StreamingPlayer mimeType={AUDIO_MIME} />
            </XPay>
        </div>
    )
}

interface StreamingPlayerProps {
    mimeType: typeof AUDIO_MIME | typeof VIDEO_MIME;
}

/** Streaming player with chunk-based payment */
export function StreamingPlayer({ mimeType }: StreamingPlayerProps) {
    const [contentKey, setContentKey] = useState("");
    const [chunkSize, setChunkSize] = useState("");
    const [chunkState, setChunkState] = useState<ChunkState | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [totalBytes, setTotalBytes] = useState(0);
    
    const isAudio = mimeType === AUDIO_MIME;
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
            url: PLAY_URL,
            body: createPlayRequestBody(contentKey as UUID, currentOffset, size),
            maxValue: MAX_PAYMENT_VALUE,
        });
        
        setIsLoading(false);
        
        if (status !== 'Success') return;
        
        const newChunk = new Uint8Array(data);
        const prevChunks = chunkState?.chunks ?? [];
        const allChunks = [...prevChunks, newChunk];
        
        setChunkState({
            key: contentKey as UUID,
            offset: currentOffset + newChunk.length,
            chunkSize: size,
            chunks: allChunks,
        });
        
        setTotalBytes(prev => prev + newChunk.length);
        
        if (ref.current) {
            updatePlayerSource(ref.current, allChunks, mimeType);
        }
    }, [contentKey, chunkSize, chunkState, isLoading, xPayAsync, mimeType]);

    const handlePlayPause = () => {
        if (!ref.current) return;
        
        setIsPlaying(prev => {
            if (prev) ref.current?.pause();
            else ref.current?.play();
            return !prev;
        });
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

    return (
        <div className="flex flex-col gap-4">
            <ContentKeyInput
                contentKey={contentKey}
                chunkSize={chunkSize}
                onKeyChange={setContentKey}
                onChunkSizeChange={setChunkSize}
                onReset={resetPlayer}
            />
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Loaded: {formatBytes(totalBytes)}</span>
                {chunkState && <span>| Chunks: {chunkState.chunks.length}</span>}
            </div>

            {isAudio 
                ? <audio ref={ref as React.RefObject<HTMLAudioElement>} onTimeUpdate={onTimeUpdate} hidden />
                : <video ref={ref as React.RefObject<HTMLVideoElement>} onTimeUpdate={onTimeUpdate} />
            }
            
            <div className="flex items-center gap-4">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handlePlayPause}
                    disabled={!hasContent}
                >
                    {isPlaying ? <Pause /> : <Play />}
                </Button>
                
                <Slider defaultValue={[0]} value={[currentTime]} max={duration || 1} />
                
                <Button variant="ghost" size="icon" disabled><Rewind /></Button>
                <Button variant="ghost" size="icon" disabled><FastForward /></Button>
                
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={fetchNextChunk}
                    disabled={!contentKey || isLoading}
                    title="Fetch & pay for next chunk"
                >
                    <Download className={isLoading ? "animate-pulse" : ""} />
                </Button>
            </div>
        </div>
    );
}

/** Movie Player component */
export function MoviePlayer({ title, name }: ItemProps) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <h2 className="text-md font-bold">{title}</h2>
                <h3 className="text-muted-foreground">{name}</h3>
            </div>
            <XPay>
                <StreamingPlayer mimeType={VIDEO_MIME} />
            </XPay>
        </div>
    );
}

/** Updates the player source by combining all chunks */
function updatePlayerSource(
    player: HTMLAudioElement | HTMLVideoElement, 
    chunks: Uint8Array[], 
    mimeType: string
) {
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const combined = new Uint8Array(totalLength);
    
    let offset = 0;
    chunks.forEach(chunk => {
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
    onReset 
}: {
    contentKey: string;
    chunkSize: string;
    onKeyChange: (key: string) => void;
    onChunkSizeChange: (size: string) => void;
    onReset: () => void;
}) {
    return (
        <div className="flex flex-col gap-2">
            <Input
                type="text"
                placeholder="Content UUID"
                value={contentKey}
                onChange={(e) => onKeyChange(e.target.value)}
            />
            <div className="flex items-center gap-2">
                <Input
                    type="number"
                    placeholder="Chunk size (MB)"
                    value={chunkSize}
                    onChange={(e) => onChunkSizeChange(e.target.value)}
                />
                <Button variant="outline" size="sm" onClick={onReset}>
                    Reset
                </Button>
            </div>
        </div>
    );
}