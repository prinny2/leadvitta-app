import type { MetadataRoute } from "next";
import { CANONICAL_HOST } from "@/lib/canonical-host";
import { PUBLIC_ROUTES } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = `https://${CANONICAL_HOST}`;
  return PUBLIC_ROUTES.map((path) => ({
    url: `${origin}${path === "/" ? "" : path}`,
    changeFrequency: path === "/" ? "weekly" : "yearly",
    priority: path === "/" ? 1 : 0.3,
  }));
}
