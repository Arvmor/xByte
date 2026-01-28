import { generateOGImage, OG_SIZE, OG_CONTENT_TYPE } from "@/og-image";

export const dynamic = "force-static";
export const alt = "xByte Payout & Withdrawals";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
    return generateOGImage({
        title: "Payout & Withdrawals",
        description: "View balances and withdraw earnings from your vault",
        path: "/payout",
    });
}
