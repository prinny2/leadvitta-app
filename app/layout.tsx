import "./globals.css";
import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
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
  title: "LeadBellus — Responda melhor. Agende mais.",
  description:
    "Inteligência de conversão para clínicas de estética: gere respostas estratégicas para o WhatsApp, quebre objeções e transforme dúvidas em agendamentos.",
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
      </body>
    </html>
  );
}
