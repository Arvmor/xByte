import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE_URL = "https://xbyte.sh";

export default function sitemap(): MetadataRoute.Sitemap {
    const routes = [
        { path: "/", priority: 1.0 },
        { path: "/setup", priority: 0.8 },
        { path: "/privacy", priority: 0.3 },
        { path: "/terms", priority: 0.3 },
        { path: "/payout", priority: 0.7 },
    ];

    return routes.map((route) => ({
        url: `${BASE_URL}${route.path}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: route.priority,
    }));
}
