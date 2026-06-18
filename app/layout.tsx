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
  title: "LeadBellus — Agendamento Inteligente para Estética",
  description:
    "Aumente os agendamentos da sua clínica com inteligência de conversão. Transforme dúvidas do WhatsApp em vendas reais com respostas estratégicas e seguras.",
  authors: [{ name: "Vinicius Paes da Serra Freire", url: "https://leadbellus.com.br" }],
  publisher: "Vinicius Paes da Serra Freire (MEI)",
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
      </body>
    </html>
  );
}
