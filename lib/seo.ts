import type { Metadata } from "next";

/** Rotas públicas indexáveis — fonte única para o sitemap. */
export const PUBLIC_ROUTES = ["/", "/termos", "/privacidade", "/reembolso"] as const;

export const NOINDEX: Metadata = { robots: { index: false, follow: false } };

/**
 * Imagem gerada por app/opengraph-image.tsx. Vai explícita porque um
 * `openGraph` definido na página descarta a imagem herdada do arquivo.
 */
const SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "LeadBellus — a secretária de WhatsApp da clínica de estética",
};

/**
 * Metadata de uma página com canonical, Open Graph e Twitter próprios.
 *
 * O merge de metadata do Next é raso: uma página que define `openGraph`
 * substitui o objeto inteiro do layout. Por isso cada página monta o bloco
 * completo aqui, e o layout raiz não fixa canonical/og:url (senão toda página
 * herdava o da home e o Google tratava as demais como duplicadas).
 * Caminhos relativos resolvem contra o `metadataBase` do layout raiz.
 */
export function pageMetadata({
  path,
  title,
  description,
  index = true,
}: {
  path: string;
  title: string;
  description: string;
  index?: boolean;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: "LeadBellus",
      url: path,
      title,
      description,
      images: [SHARE_IMAGE],
    },
    twitter: { card: "summary_large_image", title, description, images: [SHARE_IMAGE.url] },
    ...(index ? {} : NOINDEX),
  };
}
