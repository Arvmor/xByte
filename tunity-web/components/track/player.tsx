import TrackItem, { ItemProps } from "@/components/track/item";
import XPay, { PayProps } from "@/components/privy/pay";

const propPay: PayProps = {
    url: "https://api.example.com/premium",
    action: "Play",
    maxValue: BigInt(1000),
}

export default function TrackPlayer({title, name, image, size}: ItemProps) {
    const { url, action, maxValue } = propPay;

    return (
        <div>
            <h1 className="text-2xl font-bold">Track Player</h1>
            {/* Track info */}
            <TrackItem title={title} name={name} image={image} size={size} />
            {/* Play button */}
            <XPay url={url} action={action} maxValue={maxValue} />
        </div>
    )
}