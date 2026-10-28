import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import Ga4Analytics from "@/components/Analytics";
import { FirebaseSessionSync } from "@/components/firebase-session-sync";
import { isClerkClientConfigured } from "@/lib/config";

// Fontes versionadas em app/fonts (variáveis, subset latin — Fontsource 5.3.0,
// licença OFL ao lado). Antes vinham do Google Fonts no build e o CI quebrava
// quando o download falhava. next/font/local mantém o fallback com métricas
// ajustadas (size-adjust), que zera o layout shift quando a webfont chega
// (CLS era 0,20 só por causa disso).
const inter = localFont({
  src: "./fonts/inter-latin-wght.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-inter",
  adjustFontFallback: "Arial",
});

const fraunces = localFont({
  src: "./fonts/fraunces-latin-wght.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-fraunces",
  adjustFontFallback: "Times New Roman",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.leadbellus.com.br"),
  title: "LeadBellus — Respostas para WhatsApp na Estética",
  description:
    "Respostas curtas e estratégicas para clínicas de estética venderem melhor no WhatsApp, sem texto longo nem robô genérico.",
  keywords: [
    "respostas WhatsApp estética",
    "IA para clínica de estética",
    "automação WhatsApp estética",
    "script de vendas estética",
    "follow-up WhatsApp clínica",
    "objeções estética",
    "LeadBellus",
  ],
  authors: [{ name: "Vinicius Paes da Serra Freire", url: "https://leadbellus.com.br" }],
  publisher: "Vinicius Paes da Serra Freire (MEI)",
  alternates: {
    canonical: "https://www.leadbellus.com.br",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "LeadBellus — Respostas para WhatsApp na Estética",
    description:
      "Transforme preço, objeção e cliente que sumiu em respostas prontas para copiar e mandar no WhatsApp.",
    url: "https://www.leadbellus.com.br",
    siteName: "LeadBellus",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "LeadBellus — Respostas para WhatsApp na Estética",
    description: "3 respostas curtas, no tom da sua clínica, para copiar e mandar no WhatsApp.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "kvQ3hzLyDrC4JxQpwNrfeCPHrTTbjHCHYi0WZOlLpL0",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const app = (
    <>
      {isClerkClientConfigured && <FirebaseSessionSync />}
      {children}
      <Ga4Analytics />
      {/* Só existe na Vercel; fora dela o script /_vercel/insights dá 404. */}
      {process.env.VERCEL && <VercelAnalytics />}
    </>
  );

  return (
    <html lang="pt-BR" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-navy-900 font-sans text-ink antialiased">
        {isClerkClientConfigured ? (
          <ClerkProvider localization={ptBR}>{app}</ClerkProvider>
        ) : (
          app
        )}
      </body>
    </html>
  );
}
