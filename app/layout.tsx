import "./globals.css";
import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Analytics from "@/components/Analytics";

// next/font: self-host + fallback com métricas ajustadas (size-adjust), o que
// zera o layout shift quando a webfont chega (CLS era 0,20 só por causa disso).
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-fraunces",
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
  return (
    <html lang="pt-BR" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-nude-50 font-sans text-ink antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
