"use client"

import { Dispatch, SetStateAction, useRef, useState } from "react";
import TrackItem, { ItemProps } from "@/components/track/item";
import XPay, { PayProps, useXPayAsync } from "@/components/privy/pay";
import { FastForward, Pause, Play, Rewind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

/** The MIME types */
const AUDIO_MIME = "audio/mpeg";
const VIDEO_MIME = "video/mp4";

/** The payment properties for the audio track */
const propPay: PayProps = {
    url: "http://localhost/play",
    body: {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            file: "./sample.mp3",
            offset: 0,
            length: 700_000,
        }),
    },
    maxValue: BigInt(1000),
}

/** The payment properties for the video track */
const propPay2: PayProps = {
    ...propPay,
    body: {
        ...propPay.body,
        body: JSON.stringify({
            file: "./sample_frag.mp4",
            offset: 0,
            length: 700_000,
        }),
    },
}

/** The track player component */
export default function TrackPlayer({title, name, image, size}: ItemProps) {
    const { url, body, maxValue } = propPay;

    return (
        <div className="flex flex-col gap-4">
            {/* Track info */}
            <TrackItem title={title} name={name} image={image} size={size} />
            {/* Audio element */}
            <XPay>
                <PlayIslands url={url} body={body} maxValue={maxValue} />
            </XPay>
        </div>
    )
}

/** The play islands component */
export function PlayIslands({url, body, maxValue}: PayProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const ref = useRef<HTMLAudioElement | null>(null);
    const XPayAsync = useXPayAsync();

    // Function to handle time update of the track
    const onTimeUpdate = () => {
        if (ref.current) {
            setCurrentTime(ref.current.currentTime);
            setDuration(ref.current.duration);
        }
    };

    /** Handles paying, playing and pausing the track */
    const handlePlay = async () => {
        if (!ref.current) return;

        // Check if the user has paid for the track
        if (!isPaid) {
            const {status, data} = await XPayAsync({url, body, maxValue});
            if (status !== 'Success') return;
            setPlayerData(data, ref.current, AUDIO_MIME);
            setIsPaid(true);
        }

        // Play the track
        handlePlayPause(setIsPlaying, ref.current);
    }

    return (
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={handlePlay}>
                {isPlaying ? <Pause /> : <Play /> }
            </Button>
            <Slider defaultValue={[0]} value={[currentTime]} max={duration} />
            <Button variant="ghost" size="icon"><Rewind /></Button>
            <Button variant="ghost" size="icon"><FastForward /></Button>
            <audio ref={ref} onTimeUpdate={onTimeUpdate} hidden/>
        </div>
    )
}

/** Movie Player component */
export function MoviePlayer({title, name}: ItemProps) {
    const { url, body, maxValue } = propPay2;

    return (
        <div className="flex flex-col gap-4">
            {/* Track info */}
            <div className="flex flex-col">
                <h2 className="text-md font-bold">{title}</h2>
                <h3 className="text-muted-foreground">{name}</h3>
            </div>
            {/* Audio element */}
            <XPay>
                <MoviePlayIslands url={url} body={body} maxValue={maxValue} />
            </XPay>
        </div>
    )
}

/** The movie play islands component */
export function MoviePlayIslands({url, body, maxValue}: PayProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const ref = useRef<HTMLVideoElement | null>(null);
    const XPayAsync = useXPayAsync();

    // Function to handle time update of the movie
    const onTimeUpdate = () => {
        if (ref.current) {
            setCurrentTime(ref.current.currentTime);
            setDuration(ref.current.duration);
        }
    };

    // Function to handle playing and pausing the movie
    const handlePlay = async () => {
        if (!ref.current) return;

        // Check if the user has paid for the movie
        if (!isPaid) {
            const {status, data} = await XPayAsync({url, body, maxValue});
            if (status !== 'Success') return;
            setPlayerData(data, ref.current, VIDEO_MIME);
            setIsPaid(true);
        }

        handlePlayPause(setIsPlaying, ref.current);
    }

    return (
        <div className="flex flex-col">
            <video ref={ref} onTimeUpdate={onTimeUpdate} controls/>
            <div className="flex w-full items-center gap-4">
                <Button variant="outline" size="icon" onClick={handlePlay}>
                    {isPlaying ? <Pause /> : <Play /> }
                </Button>
                <Slider defaultValue={[0]} value={[currentTime]} max={duration} />
                <Button variant="ghost" size="icon"><Rewind /></Button>
                <Button variant="ghost" size="icon"><FastForward /></Button>
            </div>
        </div>
    )
}

/** Handle the play/pause state */
function handlePlayPause(setState: Dispatch<SetStateAction<boolean>>, player: HTMLAudioElement | HTMLVideoElement) {
    setState((prev: boolean) => {
        // Play/pause the player
        if (prev) player.pause(); 
        else player.play();
        
        return !prev;
    });
}

/** Set the audio data to the player */
function setPlayerData(data: number[], player: HTMLAudioElement | HTMLVideoElement, type: string) {
    const bytes = new Uint8Array(data);
    const blob = new Blob([bytes], { type });

    // Create & Clean the object URL
    URL.revokeObjectURL(player.src);
    player.src = URL.createObjectURL(blob);
}