import type { MetadataRoute } from "next";
import { CANONICAL_HOST } from "@/lib/canonical-host";

export default function robots(): MetadataRoute.Robots {
  const origin = `https://${CANONICAL_HOST}`;
  return {
    // Páginas do app não entram aqui: elas respondem noindex (o Google
    // precisa conseguir rastreá-las para ler essa instrução).
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
