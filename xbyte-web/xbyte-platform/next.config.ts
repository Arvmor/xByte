import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "export",
    transpilePackages: ["xbyte-sdk"],
    /* config options here */
};

export default nextConfig;
