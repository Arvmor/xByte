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
        <div>
            <h1 className="text-2xl font-bold">Track Player</h1>
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
    const ref = useRef<HTMLAudioElement | null>(null);
    const XPayAsync = useXPayAsync();

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
            if (!ref.current || !isPaid) return prev;
            
            // Toggle the play/pause state
            prev ? ref.current?.pause() : ref.current?.play();
            return !prev;
        });
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePlay}>
                    {isPlaying ? <Pause /> : <Play /> }
                </Button>
                <Slider defaultValue={[0.8]} />
                <Button variant="ghost" size="icon"><Rewind /></Button>
                <Button variant="ghost" size="icon"><FastForward /></Button>
            </div>
            <audio ref={ref} hidden/>
        </>
    )
}

/** Set the audio data to the player */
function setAudioData(data: number[], player: HTMLAudioElement) {
    const bytes = new Uint8Array(data);
    const blob = new Blob([bytes], { type });
    const objectUrl = URL.createObjectURL(blob);

    // Set the audio data to the player
    const previousUrl = player.src;
    player.src = objectUrl;

    // Revoke the object URL
    URL.revokeObjectURL(objectUrl);
    if (previousUrl && previousUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previousUrl);
    }
}