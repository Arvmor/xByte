import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE_URL = "https://xbyte.sh";

export default function sitemap(): MetadataRoute.Sitemap {
    const routes = ["/", "/setup", "/privacy", "/terms", "/payout"];

    return routes.map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
    }));
}
