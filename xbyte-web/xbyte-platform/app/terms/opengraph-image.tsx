import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "xByte Terms of Service";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #6366f1 100%)",
                    position: "relative",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: 40,
                        left: 50,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: "rgba(255, 255, 255, 0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 24,
                            fontWeight: 700,
                            color: "white",
                        }}
                    >
                        xB
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 600, color: "white" }}>xByte</div>
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 24,
                    }}
                >
                    <div
                        style={{
                            fontSize: 72,
                            fontWeight: 700,
                            color: "white",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Terms of Service
                    </div>
                    <div
                        style={{
                            fontSize: 32,
                            color: "rgba(255, 255, 255, 0.9)",
                            fontWeight: 500,
                            maxWidth: 800,
                            textAlign: "center",
                        }}
                    >
                        Terms and conditions for using the xByte platform
                    </div>
                </div>

                <div
                    style={{
                        position: "absolute",
                        bottom: 40,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "rgba(255, 255, 255, 0.7)",
                        fontSize: 20,
                    }}
                >
                    xbyte.sh/terms
                </div>
            </div>
        ),
        { ...size },
    );
}
