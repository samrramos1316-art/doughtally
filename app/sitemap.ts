import type { MetadataRoute } from "next";

const SITE = "https://doughtally.app";

// The public pages, for search engines. The signed-in app isn't listed.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: [string, number][] = [
    ["/", 1],
    ["/food", 0.8],
    ["/florists", 0.7],
    ["/jewelry", 0.7],
    ["/fabrication", 0.7],
    ["/signup", 0.6],
    ["/privacy", 0.2],
    ["/terms", 0.2],
    ["/cookies", 0.2],
  ];
  return pages.map(([path, priority]) => ({ url: `${SITE}${path}`, changeFrequency: "monthly", priority }));
}
