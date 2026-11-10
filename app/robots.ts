import type { MetadataRoute } from "next";

// Search engines get the public pages; the signed-in app, the API and the
// auth flows stay out of results (they're behind a login anyway).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/auth/",
        "/sheet/",
        "/dashboard",
        "/add",
        "/admin",
        "/alerts",
        "/ingredients",
        "/invoices",
        "/margins",
        "/market",
        "/menu",
        "/onboarding",
        "/plan",
        "/quote",
        "/recipes",
        "/review",
        "/seasons",
        "/settings",
        "/reset-password",
      ],
    },
    sitemap: "https://doughtally.app/sitemap.xml",
  };
}
