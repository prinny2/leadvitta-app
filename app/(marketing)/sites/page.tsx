import type { Metadata } from "next";
import Link from "next/link";
import { Check, Clock, MessageCircle, ShieldCheck, Sparkles } from "@/components/static-icons";
import { FadeUp } from "@/components/fade-up";
import { RevealAfter } from "@/components/reveal-after";
import { SectionTracker } from "@/components/section-tracker";
import { SitesCta } from "@/components/sites-cta";
import { EMPRESA } from "@/lib/empresa";
import { pageMetadata } from "@/lib/seo";

// Página de venda do site-catálogo para lojas locais (Belém).
// Oferta fixa: R$ 590 (50% para começar, 50% na entrega) + R$ 79/mês opcional.
// Black Friday até sexta 4/12/2026: ficha do Google arrumada junto, sem custo.
// Nada de prova social inventada (nem cliente, nem número de resultado): ainda não há caso real.

// Paleta da landing (app/(marketing)/page.tsx); verde só no que é WhatsApp.
const INK = "#0B1B33";
const INK_SOFT = "#3D5068";
const CREAM = "#FFFFFF";
const CREAM_2 = "#F3F6FB";
const NAVY = "#081426";
const GOLD = "#E4A84D";
const GOLD_DEEP = "#9A6414";
const GOLD_HOT = "#F7C96B";
const WA_GREEN = "#1FA855";

const PRECO = "R$ 590";
const MENSALIDADE = "R$ 79/mês";

const PARA_QUEM = [
  "Loja de roupa",
  "Açaiteria",
  "Loja de material de construção",
  "Pet shop",
  "Boutique",
  "Mercadinho",
];

/** Mockup do "como fica": loja fictícia, só para mostrar o formato. */
const EXEMPLO_CATEGORIAS = ["Vestidos", "Blusas", "Calças", "Acessórios"];
const EXEMPLO_PRODUTOS = [
  { nome: "Vestido midi de linho", preco: "R$ 189,90", cor: "linear-gradient(135deg, #F4E3CF, #E9C9A4)" },
  { nome: "Vestido curto estampado", preco: "R$ 129,90", cor: "linear-gradient(135deg, #DCE7F5, #B9CCE8)" },
  { nome: "Vestido longo com fenda", preco: "R$ 219,90", cor: "linear-gradient(135deg, #F3D9DE, #E5B3BD)" },
  { nome: "Vestido chemise", preco: "R$ 159,90", cor: "linear-gradient(135deg, #E1EEDF, #C1DBBD)" },
];

const COMO_FICA = [
  { t: "Cada coisa no seu lugar", c: "Produtos separados por categoria, com abas no topo. O cliente acha o que quer sem rolar a loja inteira." },
  { t: "Foto, nome e preço", c: "Tudo à vista, sem o “chama no direct que eu passo o valor”." },
  { t: "Botão de WhatsApp em cada produto", c: "O pedido chega no seu WhatsApp com o nome do produto já escrito." },
  { t: "Pix e retirada ou entrega", c: "A página mostra sua chave Pix, o endereço e como você entrega." },
];

const INCLUI = [
  "Página com seus produtos separados por categoria",
  "Foto, nome e preço de cada produto",
  "Botão “Pedir no WhatsApp” em cada produto, com mensagem pronta",
  "Chave Pix, endereço, horário e forma de entrega na página",
  "Feito para o celular, que é onde seu cliente abre",
  "Link pronto para a bio do Instagram e para a ficha do Google",
];

const PASSOS = [
  { n: "1", t: "Você manda fotos e preços", c: "Pelo WhatsApp mesmo: fotos dos produtos, nomes, preços e as categorias que você já usa na loja." },
  { n: "2", t: "Em 48h, está no ar", c: "A gente monta o site e te manda o link. O prazo conta a partir do recebimento das fotos e preços." },
  { n: "3", t: "Você aprova", c: "Olha no celular, pede os ajustes e, com tudo certo, paga os outros 50%." },
];

const FAQ = [
  {
    q: "O site cobra o cliente sozinho?",
    a: "Não. O pedido chega pronto no seu WhatsApp, com o nome do produto, e você combina pagamento e entrega como já faz hoje. A chave Pix fica à vista na página.",
  },
  {
    q: "Quando contam as 48h?",
    a: "A partir de quando a gente recebe as fotos, os nomes e os preços. Se faltar alguma coisa, a gente avisa no mesmo dia.",
  },
  {
    q: "A mensalidade é obrigatória?",
    a: `Não. Os ${MENSALIDADE} são opcionais e cobrem hospedagem, domínio e as trocas de preço e de produto. Se preferir cuidar disso por conta própria, a gente combina na conversa.`,
  },
  {
    q: "Não tenho foto profissional. Serve?",
    a: "Serve. Foto boa de celular, com luz do dia, já funciona. Na página, todas aparecem no mesmo formato, lado a lado.",
  },
  {
    q: "Precisa ser de Belém?",
    a: "Não. Tudo é feito pelo WhatsApp. A gente é daqui de Belém, mas atende loja de qualquer cidade.",
  },
];

export const metadata: Metadata = {
  ...pageMetadata({
    path: "/sites",
    title: "Site para loja em Belém: catálogo online em 48h | LeadBellus",
    description:
      "Site-catálogo para loja local em Belém: produtos separados por categoria, foto, preço e botão de pedir no WhatsApp. No ar em 48h por R$ 590.",
  }),
  keywords: [
    "site para loja em Belém",
    "catálogo online",
    "catálogo online para loja",
    "site com pedido pelo WhatsApp",
    "site para pequena loja",
  ],
};

function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Site-catálogo para lojas locais",
    serviceType: "Criação de site-catálogo",
    description:
      "Site com produtos separados por categoria, foto, nome, preço e botão de pedido pelo WhatsApp, no ar em 48h após o recebimento das fotos e preços.",
    url: "https://www.leadbellus.com.br/sites",
    inLanguage: "pt-BR",
    areaServed: { "@type": "City", name: "Belém" },
    provider: {
      "@type": "Organization",
      "@id": "https://www.leadbellus.com.br/#organization",
      name: EMPRESA.marca,
      url: "https://www.leadbellus.com.br",
      email: EMPRESA.email,
    },
    offers: {
      "@type": "Offer",
      price: "590",
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      url: "https://www.leadbellus.com.br/sites",
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function LogoMark({ size = 28, stroke = GOLD_DEEP }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M40 6 C26 14, 10 32, 10 54 C10 70, 22 82, 40 90" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M40 6 C54 14, 70 32, 70 54 C70 70, 58 82, 40 90" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />
      <line x1="40" y1="32" x2="40" y2="86" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <circle cx="40" cy="27" r="5.5" fill={stroke} />
    </svg>
  );
}

function Eyebrow({ children, onNavy }: { children: React.ReactNode; onNavy?: boolean }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        border: `1px solid ${onNavy ? "rgba(201,160,96,0.45)" : "rgba(138,99,18,0.35)"}`,
        background: onNavy ? "rgba(201,160,96,0.1)" : "rgba(201,160,96,0.14)",
        color: onNavy ? GOLD : GOLD_DEEP,
        borderRadius: "9999px",
        padding: "6px 14px",
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        marginBottom: "18px",
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children, onNavy }: { children: React.ReactNode; onNavy?: boolean }) {
  return (
    <h2
      style={{
        fontSize: "clamp(28px, 4vw, 40px)",
        fontWeight: 800,
        letterSpacing: "-0.02em",
        lineHeight: 1.12,
        color: onNavy ? "#FFFFFF" : INK,
        margin: "0 0 14px",
      }}
    >
      {children}
    </h2>
  );
}

const PRIMARY_BUTTON_STYLE: React.CSSProperties = {
  background: `linear-gradient(135deg, ${GOLD_HOT}, ${GOLD} 60%, #D18A1F)`,
  color: NAVY,
  borderRadius: "14px",
  padding: "16px 26px",
  fontSize: "16px",
  fontWeight: 800,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  boxShadow: "0 18px 44px rgba(228,168,77,0.35), inset 0 1px 0 rgba(255,255,255,0.35)",
  textAlign: "center",
};

function Navbar() {
  const links = [
    { label: "Como fica", href: "#como-fica" },
    { label: "Preço", href: "#preco" },
    { label: "Dúvidas", href: "#faq" },
  ];
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(18px) saturate(1.5)",
        WebkitBackdropFilter: "blur(18px) saturate(1.5)",
        borderBottom: "1px solid rgba(16,35,59,0.08)",
      }}
    >
      <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 20px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", flexShrink: 0 }}>
          <LogoMark />
          <span style={{ fontFamily: "var(--font-fraunces, Georgia, serif)", fontSize: "19px", fontWeight: 600, color: INK }}>LeadBellus</span>
        </Link>
        <div className="hidden md:flex" style={{ gap: "28px", alignItems: "center" }}>
          {links.map((l) => (
            <a key={l.href} href={l.href} style={{ color: INK_SOFT, fontSize: "14px", fontWeight: 500, textDecoration: "none" }}>
              {l.label}
            </a>
          ))}
        </div>
        <a href="#preco" style={{ background: INK, color: "#FFFFFF", borderRadius: "9999px", padding: "9px 18px", fontSize: "14px", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
          Ver preço
        </a>
      </div>
    </nav>
  );
}

/** Celular com uma loja fictícia: categorias em abas e produtos em grade. */
function CatalogoMockup() {
  return (
    <figure style={{ margin: 0, width: "100%", maxWidth: "340px" }}>
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "28px",
          border: "8px solid #0F223D",
          boxShadow: "0 30px 70px rgba(4,10,22,0.45)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid rgba(16,35,59,0.08)" }}>
          <p style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: INK }}>Sua Loja</p>
          <p style={{ margin: "2px 0 0", fontSize: "11px", color: INK_SOFT }}>Aberto hoje até 19h · Pix e entrega</p>
          <div style={{ display: "flex", gap: "6px", marginTop: "10px", overflow: "hidden" }}>
            {EXEMPLO_CATEGORIAS.map((c, i) => (
              <span
                key={c}
                style={{
                  flexShrink: 0,
                  fontSize: "11.5px",
                  fontWeight: 700,
                  padding: "5px 10px",
                  borderRadius: "9999px",
                  background: i === 0 ? INK : CREAM_2,
                  color: i === 0 ? "#FFFFFF" : INK_SOFT,
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
        <div style={{ padding: "12px 14px 4px" }}>
          <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: 800, color: INK, letterSpacing: "0.02em", textTransform: "uppercase" }}>Vestidos</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {EXEMPLO_PRODUTOS.map((p) => (
              <div key={p.nome} style={{ border: "1px solid rgba(16,35,59,0.08)", borderRadius: "12px", overflow: "hidden", minWidth: 0 }}>
                <div style={{ height: "74px", background: p.cor }} />
                <div style={{ padding: "7px 8px 8px" }}>
                  <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, color: INK, lineHeight: 1.25, minHeight: "28px" }}>{p.nome}</p>
                  <p style={{ margin: "3px 0 6px", fontSize: "12.5px", fontWeight: 800, color: INK }}>{p.preco}</p>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", background: WA_GREEN, color: "#FFFFFF", borderRadius: "8px", padding: "5px 4px", fontSize: "10.5px", fontWeight: 700 }}>
                    <MessageCircle size={11} /> Pedir no WhatsApp
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: "10px 14px 14px" }}>
          <p style={{ margin: 0, fontSize: "12px", fontWeight: 800, color: INK_SOFT, letterSpacing: "0.02em", textTransform: "uppercase" }}>Blusas</p>
        </div>
      </div>
      <figcaption style={{ marginTop: "12px", fontSize: "12px", color: "rgba(255,255,255,0.6)", textAlign: "center" }}>
        Exemplo ilustrativo, com produtos e preços fictícios.
      </figcaption>
    </figure>
  );
}

export default function SitesPage() {
  return (
    <div className="sites-root" style={{ fontFamily: "var(--font-inter, system-ui, sans-serif)", background: CREAM, color: INK, overflowX: "hidden" }}>
      <StructuredData />
      <Navbar />

      <main>
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section data-track-section="sites-hero" className="sites-hero" style={{ padding: "60px 20px 68px", position: "relative", overflow: "hidden", background: `linear-gradient(180deg, ${NAVY} 0%, #0D2038 100%)` }}>
          <div aria-hidden style={{ position: "absolute", top: "-180px", right: "-120px", width: "520px", height: "520px", borderRadius: "50%", background: "radial-gradient(circle, rgba(228,168,77,0.2), transparent 65%)", filter: "blur(44px)", pointerEvents: "none" }} />
          <div className="sites-hero-grid" style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr", gap: "40px", alignItems: "center" }}>
            <div style={{ minWidth: 0 }}>
              <Eyebrow onNavy>Para lojas de Belém e região</Eyebrow>
              <h1 style={{ fontSize: "clamp(30px, 8vw, 54px)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.08, margin: "0 0 18px", color: "#FFFFFF", overflowWrap: "break-word" }}>
                Um site simples, com{" "}
                <span style={{ background: `linear-gradient(100deg, ${GOLD_HOT}, ${GOLD} 55%, #D18A1F)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", fontStyle: "italic", paddingRight: "0.06em" }}>
                  cada produto no seu lugar
                </span>
                .
              </h1>
              <p style={{ fontSize: "17px", lineHeight: 1.6, color: "rgba(255,255,255,0.82)", maxWidth: "500px", margin: "0 0 26px" }}>
                Categorias claras, foto, nome e preço, e um botão para pedir no WhatsApp em cada produto. No ar em 48h.
              </p>
              <div id="sites-hero-cta" className="sites-cta-row">
                <SitesCta posicao="hero" className="sites-btn" style={PRIMARY_BUTTON_STYLE} />
              </div>
              <p style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.66)", margin: "12px 0 0" }}>
                {PRECO} · 50% para começar, 50% na entrega
              </p>
              <p style={{ display: "inline-flex", alignItems: "center", gap: "8px", margin: "16px 0 0", fontSize: "13.5px", fontWeight: 700, color: GOLD }}>
                <Sparkles size={16} /> Black Friday até sexta, 4/12: ficha do Google arrumada junto
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "center", minWidth: 0 }}>
              <CatalogoMockup />
            </div>
          </div>
        </section>

        {/* ── PARA QUEM ────────────────────────────────────────────────────── */}
        <section data-track-section="sites-para-quem" className="sites-section" style={{ background: CREAM_2, padding: "64px 20px" }}>
          <div style={{ maxWidth: "820px", margin: "0 auto", textAlign: "center" }}>
            <FadeUp>
              <Eyebrow>Para quem é</Eyebrow>
              <SectionTitle>Para a loja que vende pelo WhatsApp</SectionTitle>
              <p style={{ color: INK_SOFT, fontSize: "16px", lineHeight: 1.6, margin: "0 0 24px" }}>
                Se você passa o dia mandando foto e preço um por um, o site faz isso por você.
              </p>
            </FadeUp>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px" }}>
              {PARA_QUEM.map((s) => (
                <li key={s} style={{ background: "#FFFFFF", border: "1px solid rgba(16,35,59,0.1)", borderRadius: "9999px", padding: "10px 18px", fontSize: "15px", fontWeight: 600, color: INK }}>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── COMO FICA ────────────────────────────────────────────────────── */}
        <section id="como-fica" data-track-section="sites-como-fica" className="sites-section" style={{ background: CREAM, padding: "72px 20px", scrollMarginTop: "60px" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <FadeUp>
              <div style={{ textAlign: "center", maxWidth: "620px", margin: "0 auto 32px" }}>
                <Eyebrow>Como fica</Eyebrow>
                <SectionTitle>Simples de olhar, fácil de pedir</SectionTitle>
                <p style={{ color: INK_SOFT, fontSize: "16px", lineHeight: 1.6, margin: 0 }}>
                  Nada de site pesado. Uma página organizada, que abre rápido no celular.
                </p>
              </div>
            </FadeUp>
            <div className="sites-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              {COMO_FICA.map((s) => (
                <div key={s.t} className="sites-card" style={{ background: CREAM_2, border: "1px solid rgba(16,35,59,0.07)", borderRadius: "16px", padding: "22px" }}>
                  <span style={{ display: "inline-flex", color: GOLD_DEEP, marginBottom: "10px" }}>
                    <Check size={20} />
                  </span>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: INK, margin: "0 0 6px" }}>{s.t}</h3>
                  <p style={{ fontSize: "14px", lineHeight: 1.6, color: INK_SOFT, margin: 0 }}>{s.c}</p>
                </div>
              ))}
            </div>
            {/* TODO(demo): quando o site de demonstração tiver URL, trocar este
                comentário por um link "Ver um exemplo no ar", ex.:
                <a href="https://<url-do-demo>" target="_blank" rel="noopener noreferrer">Ver um exemplo no ar</a> */}
          </div>
        </section>

        {/* ── O QUE INCLUI + PREÇO ─────────────────────────────────────────── */}
        <section id="preco" data-track-section="sites-preco" className="sites-section" style={{ background: NAVY, padding: "76px 20px", position: "relative", overflow: "hidden", scrollMarginTop: "60px" }}>
          <div aria-hidden style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: "720px", height: "460px", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,160,96,0.14), transparent 62%)", filter: "blur(52px)", pointerEvents: "none" }} />
          <div style={{ maxWidth: "560px", margin: "0 auto", position: "relative", zIndex: 1 }}>
            <FadeUp>
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <Eyebrow onNavy>Preço</Eyebrow>
                <SectionTitle onNavy>Um preço só, sem surpresa</SectionTitle>
              </div>
            </FadeUp>

            <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid rgba(228,168,77,0.45)`, borderRadius: "22px", padding: "28px 24px" }}>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: GOLD }}>Site-catálogo em 48h</p>
              <p style={{ margin: "6px 0 2px", color: "#FFFFFF" }}>
                <span style={{ fontSize: "44px", fontWeight: 800, letterSpacing: "-0.02em" }}>{PRECO}</span>{" "}
                <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>pelo site pronto</span>
              </p>
              <p style={{ margin: "0 0 18px", fontSize: "14px", color: "rgba(255,255,255,0.72)" }}>
                50% para começar, 50% na entrega.
              </p>
              <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>O que inclui</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "grid", gap: "10px" }}>
                {INCLUI.map((i) => (
                  <li key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "14.5px", lineHeight: 1.5, color: "rgba(255,255,255,0.88)" }}>
                    <span style={{ color: GOLD, flexShrink: 0, marginTop: "2px", display: "inline-flex" }}>
                      <Check size={17} />
                    </span>
                    {i}
                  </li>
                ))}
              </ul>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "16px", marginBottom: "20px" }}>
                <p style={{ margin: 0, fontSize: "14.5px", color: "#FFFFFF", fontWeight: 700 }}>
                  + {MENSALIDADE} <span style={{ fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>(opcional)</span>
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "13.5px", lineHeight: 1.55, color: "rgba(255,255,255,0.7)" }}>
                  Hospedagem, domínio e troca de preços e produtos sempre que você precisar.
                </p>
              </div>

              <div style={{ background: "rgba(228,168,77,0.12)", border: "1px dashed rgba(228,168,77,0.6)", borderRadius: "14px", padding: "14px 16px", marginBottom: "22px" }}>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: GOLD_HOT }}>Black Friday até sexta, 4/12</p>
                <p style={{ margin: "4px 0 0", fontSize: "13.5px", lineHeight: 1.55, color: "rgba(255,255,255,0.85)" }}>
                  Quem fechar leva a ficha do Google arrumada junto, sem custo (normalmente R$ 97): link do site, WhatsApp, horário e fotos certos.
                </p>
              </div>

              <SitesCta posicao="preco" className="sites-btn" style={{ ...PRIMARY_BUTTON_STYLE, width: "100%", boxSizing: "border-box", fontSize: "15px", padding: "15px 22px" }} />
            </div>
          </div>
        </section>

        {/* ── COMO FUNCIONA ────────────────────────────────────────────────── */}
        <section id="como-funciona" data-track-section="sites-como-funciona" className="sites-section" style={{ background: CREAM_2, padding: "72px 20px" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <FadeUp>
              <div style={{ textAlign: "center", maxWidth: "620px", margin: "0 auto 32px" }}>
                <Eyebrow>Como funciona</Eyebrow>
                <SectionTitle>Três passos, tudo pelo WhatsApp</SectionTitle>
              </div>
            </FadeUp>
            <ol className="sites-grid" style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              {PASSOS.map((s) => (
                <li key={s.n} className="sites-card" style={{ background: "#FFFFFF", border: "1px solid rgba(16,35,59,0.07)", borderRadius: "16px", padding: "22px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <span style={{ width: "36px", height: "36px", borderRadius: "10px", background: INK, color: GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>{s.n}</span>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: INK, margin: "0 0 6px" }}>{s.t}</h3>
                    <p style={{ fontSize: "14px", lineHeight: 1.6, color: INK_SOFT, margin: 0 }}>{s.c}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="sites-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginTop: "22px" }}>
              {[
                { icon: <Clock size={18} />, t: "48h a partir das fotos e preços" },
                { icon: <ShieldCheck size={18} />, t: "Você só paga o resto depois de aprovar" },
              ].map((s) => (
                <p key={s.t} style={{ margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "14px", fontWeight: 600, color: INK }}>
                  <span style={{ color: GOLD_DEEP, display: "inline-flex" }}>{s.icon}</span>
                  {s.t}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section id="faq" data-track-section="sites-faq" className="sites-section" style={{ background: CREAM, padding: "72px 20px", scrollMarginTop: "60px" }}>
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            <FadeUp>
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <Eyebrow>Dúvidas</Eyebrow>
                <SectionTitle>Antes de fechar</SectionTitle>
              </div>
            </FadeUp>
            <div style={{ display: "grid", gap: "10px" }}>
              {FAQ.map((item, i) => (
                <details key={item.q} open={i === 0} style={{ borderRadius: "14px", border: "1px solid rgba(16,35,59,0.1)", background: "#FFFFFF", overflow: "hidden" }}>
                  <summary style={{ padding: "18px 22px", cursor: "pointer", fontWeight: 700, fontSize: "15px", color: INK }}>{item.q}</summary>
                  <p style={{ padding: "14px 22px 20px", fontSize: "14px", color: INK_SOFT, lineHeight: 1.7, margin: 0, borderTop: "1px solid rgba(16,35,59,0.06)" }}>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────────────────────── */}
        <section data-track-section="sites-cta-final" className="sites-section" style={{ background: NAVY, padding: "76px 20px" }}>
          <div style={{ maxWidth: "620px", margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.02em", color: "#FFFFFF", margin: "0 0 14px", lineHeight: 1.12 }}>
              Manda as fotos hoje. Em 48h sua loja está no ar.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "16px", lineHeight: 1.6, margin: "0 auto 24px", maxWidth: "480px" }}>
              {PRECO}, metade para começar. Fechando até sexta, 4/12, a ficha do Google vai junto.
            </p>
            <SitesCta posicao="final" className="sites-btn sites-final-cta" style={PRIMARY_BUTTON_STYLE} />
          </div>
        </section>
      </main>

      <footer style={{ background: NAVY, borderTop: "1px solid rgba(255,255,255,0.08)", padding: "28px 20px", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
          {EMPRESA.marca} · CNPJ {EMPRESA.cnpj} · {EMPRESA.email}
        </p>
        <p style={{ margin: "6px 0 0", fontSize: "13px", lineHeight: 1.7 }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.75)" }}>Início</Link>
          <span style={{ color: "rgba(255,255,255,0.3)" }}> · </span>
          <Link href="/termos" style={{ color: "rgba(255,255,255,0.75)" }}>Termos</Link>
          <span style={{ color: "rgba(255,255,255,0.3)" }}> · </span>
          <Link href="/privacidade" style={{ color: "rgba(255,255,255,0.75)" }}>Privacidade</Link>
        </p>
      </footer>

      <style>{`
        .sites-btn { transition: transform .2s ease, box-shadow .2s ease; }
        .sites-btn:hover { transform: translateY(-2px); }
        .sites-card { transition: transform .25s ease, box-shadow .25s ease; }
        .sites-card:hover { transform: translateY(-3px); box-shadow: 0 18px 40px rgba(16,35,59,0.08); }
        .sites-mobile-bar { display: none; }
        @media (prefers-reduced-motion: reduce) { .sites-btn, .sites-card { transition: none; } }
        @media (min-width: 900px) { .sites-hero-grid { grid-template-columns: 1.1fr 0.9fr !important; } }
        @media (max-width: 767px) {
          .sites-root { max-width: 100vw; }
          .sites-hero { padding: 44px 16px 52px !important; }
          .sites-section { padding: 56px 16px !important; }
          .sites-cta-row .sites-btn, .sites-final-cta { box-sizing: border-box; width: 100%; }
          .sites-card:hover { transform: none; }
          .sites-grid { gap: 10px !important; }
          .sites-mobile-bar { display: flex; }
          .sites-mobile-spacer { height: 88px; }
        }
      `}</style>
      <div className="sites-mobile-spacer" style={{ background: NAVY }} />
      {/* Barra fixa do mobile: aparece depois que o CTA do hero sai da tela. */}
      <RevealAfter targetId="sites-hero-cta">
        <div
          className="sites-mobile-bar"
          style={{
            position: "fixed",
            left: "12px",
            right: "12px",
            bottom: "calc(10px + env(safe-area-inset-bottom))",
            zIndex: 58,
            alignItems: "center",
            gap: "10px",
            boxSizing: "border-box",
            maxWidth: "520px",
            margin: "0 auto",
            background: "rgba(255,255,255,0.97)",
            border: "1px solid rgba(201,160,96,0.24)",
            borderRadius: "18px",
            boxShadow: "0 18px 48px rgba(11,26,46,0.22)",
            padding: "10px 10px 10px 14px",
          }}
        >
          <div style={{ lineHeight: 1.2, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: INK }}>Site-catálogo em 48h</p>
            <p style={{ margin: "3px 0 0", fontSize: "11.5px", color: INK_SOFT }}>{PRECO} · Black Friday até 4/12</p>
          </div>
          <SitesCta
            posicao="mobile_bar"
            label="Quero"
            style={{ marginLeft: "auto", background: WA_GREEN, color: "#FFFFFF", fontWeight: 700, fontSize: "14px", borderRadius: "12px", padding: "11px 16px", textDecoration: "none", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "6px" }}
          />
        </div>
      </RevealAfter>
      <SectionTracker contentType="sites" />
    </div>
  );
}
