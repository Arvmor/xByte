import type { NextConfig } from "next";
import { loadEnvFile } from "process";

try {
    loadEnvFile("../../.env");
} catch {
    console.warn("Error loading .env file");
}

const nextConfig: NextConfig = {
    output: "export",
    images: {
        unoptimized: true,
    },
    transpilePackages: ["xbyte-sdk", "xbyte-components"],
    /* config options here */
};

export default nextConfig;
