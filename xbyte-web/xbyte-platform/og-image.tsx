import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

interface OGImageProps {
    title: string;
    description?: string;
    path?: string;
}

export async function generateOGImage({ title, description, path }: OGImageProps) {
    return new ImageResponse(
        <div tw="h-full w-full flex flex-col items-center justify-center bg-black">
            <div tw="absolute top-12 left-15 flex items-center">
                <span tw="text-4xl font-semibold text-white">xByte</span>
            </div>

            <div tw="flex flex-col items-center justify-center px-20">
                <div tw="text-6xl font-bold text-white text-center tracking-tight">{title}</div>
                {description && (
                    <div tw="text-3xl text-gray-400 text-center mt-5 max-w-4xl">{description}</div>
                )}
            </div>

            <div tw="absolute bottom-12 flex items-center text-xl text-gray-500">
                {path ? `xbyte.sh${path}` : "xbyte.sh"}
            </div>
        </div>,
        { ...OG_SIZE },
    );
}
