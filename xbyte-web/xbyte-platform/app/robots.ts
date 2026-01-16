import type { MetadataRoute } from "next";

const BASE_URL = "https://xbyte.sh";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "*",
            disallow: [],
        },
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
