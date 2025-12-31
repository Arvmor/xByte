import type { NextConfig } from "next";
import { loadEnvFile } from "process";

loadEnvFile("../../.env");

const nextConfig: NextConfig = {
    output: "export",
    transpilePackages: ["xbyte-sdk"],
    /* config options here */
};

export default nextConfig;
