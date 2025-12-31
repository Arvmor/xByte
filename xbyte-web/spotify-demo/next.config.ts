import type { NextConfig } from "next";
import { loadEnvFile } from "process";

try {
    loadEnvFile("../../.env");
} catch (error) {
    console.warn("Error loading .env file", error);
}

const nextConfig: NextConfig = {
    output: "export",
    transpilePackages: ["xbyte-sdk"],
    /* config options here */
};

export default nextConfig;
