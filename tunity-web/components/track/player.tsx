"use client"

import { useEffect, useState } from "react";
import TrackItem, { ItemProps } from "@/components/track/item";
import XPay, { PayProps } from "@/components/privy/pay";

const propPay: PayProps = {
    url: "http://localhost/play",
    action: "Play",
    maxValue: BigInt(1000),
}

export default function TrackPlayer({title, name, image, size}: ItemProps) {
    const { url, action, maxValue } = propPay;
    const [data, setData] = useState();

    // Incoming Data Callback
    useEffect(() => {
        console.log(data);
    }, [data]);

    return (
        <div>
            <h1 className="text-2xl font-bold">Track Player</h1>
            {/* Track info */}
            <TrackItem title={title} name={name} image={image} size={size} />
            {/* Play button */}
            <XPay url={url} action={action} maxValue={maxValue} setData={setData} />
        </div>
    )
}