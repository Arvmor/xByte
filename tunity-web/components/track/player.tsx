"use client"

import { useRef, useState } from "react";
import TrackItem, { ItemProps } from "@/components/track/item";
import XPay, { PayProps, useXPayAsync } from "@/components/privy/pay";
import { FastForward, Pause, Play, Rewind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const propPay: PayProps = {
    url: "http://localhost/play",
    maxValue: BigInt(1000),
}

const type = "audio/mpeg";

/** The track player component */
export default function TrackPlayer({title, name, image, size}: ItemProps) {
    const { url, maxValue } = propPay;

    return (
        <div className="flex flex-col gap-4">
            {/* Track info */}
            <TrackItem title={title} name={name} image={image} size={size} />
            {/* Audio element */}
            <XPay>
                <PlayIslands url={url} maxValue={maxValue} />
            </XPay>
        </div>
    )
}

/** The play islands component */
export function PlayIslands({url, maxValue}: PayProps) {
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
            const {status, data} = await XPayAsync({url, maxValue});
            if (status !== 'Success') return;
            setAudioData(data, ref.current);
            setIsPaid(true);
        }

        // Play the track
        setIsPlaying(prev => {
            if (!ref.current) return prev;
            
            // Toggle the play/pause state
            prev ? ref.current?.pause() : ref.current?.play();
            return !prev;
        });
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

/** Set the audio data to the player */
function setAudioData(data: number[], player: HTMLAudioElement) {
    const bytes = new Uint8Array(data);
    const blob = new Blob([bytes], { type });

    // Create & Clean the object URL
    URL.revokeObjectURL(player.src);
    player.src = URL.createObjectURL(blob);
}