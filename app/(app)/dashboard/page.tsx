"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Sparkles,
  MessagesSquare,
  Send,
  ListChecks,
  History,
  Settings,
  ArrowRight,
  Flame,
  Inbox,
  Star,
} from "lucide-react";
import { getClinica, listHistorico, listConversas } from "@/lib/store";
import { StatCard } from "@/components/ui/stat-card";
import { cn } from "@/lib/utils";
import type { Conversa, Prioridade } from "@/lib/types";

const cards = [
  { href: "/gerador", title: "Gerador", desc: "Mensagem → 3 respostas", icon: Sparkles, primary: true },
  { href: "/conversas", title: "Conversas", desc: "Inbox por prioridade", icon: Inbox },
  { href: "/objecoes", title: "Objeções", desc: "‘Tá caro’, ‘vou pensar’…", icon: MessagesSquare },
  { href: "/follow-up", title: "Follow-up", desc: "Reative quem sumiu", icon: Send },
  { href: "/scripts", title: "Scripts", desc: "Fluxos até o agendamento", icon: ListChecks },
  { href: "/historico", title: "Histórico", desc: "Tudo que você gerou", icon: History },
  { href: "/configuracoes", title: "Configurações", desc: "DNA e tom da clínica", icon: Settings },
];

const TEMP: { key: Prioridade; emoji: string; label: string; dot: string }[] = [
  { key: "quente", emoji: "🔥", label: "Quente", dot: "bg-red-400" },
  { key: "morno", emoji: "🌤️", label: "Morna", dot: "bg-amber-400" },
  { key: "frio", emoji: "❄️", label: "Fria", dot: "bg-sky-400" },
];

export default function DashboardPage() {
  const [nome, setNome] = useState("");
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [totalGerado, setTotalGerado] = useState(0);
  const [favoritos, setFavoritos] = useState(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let vivo = true;
    Promise.all([getClinica(), listHistorico(), listConversas()]).then(
      ([c, hist, convs]) => {
        if (!vivo) return;
        setNome(c.nome_clinica || "");
        setTotalGerado(hist.length);
        setFavoritos(hist.filter((h) => h.favorito).length);
        setConversas(convs);
        setCarregando(false);
      }
    );
    return () => {
      vivo = false;
    };
  }, []);

  const ativas = conversas.filter((c) => !c.arquivada);
  const contagem: Record<Prioridade, number> = {
    quente: ativas.filter((c) => c.prioridade === "quente").length,
    morno: ativas.filter((c) => c.prioridade === "morno").length,
    frio: ativas.filter((c) => c.prioridade === "frio").length,
  };
  const naoLidas = ativas.filter((c) => c.nao_lida).length;
  const topLead = [...ativas]
    .filter((c) => c.prioridade === "quente")
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
  const temInbox = ativas.length > 0;

  return (
    <div>
      <header className="mb-6">
        <p className="text-sm text-muted">Bem-vinda{nome ? `, ${nome}` : ""} 💕</p>
        <h1 className="font-serif text-3xl font-semibold text-ink">
          {contagem.quente > 0
            ? `${contagem.quente} lead${contagem.quente > 1 ? "s" : ""} quente${
                contagem.quente > 1 ? "s" : ""
              } esperando você 🔥`
            : "O que vamos responder hoje?"}
        </h1>
      </header>

      {/* Métricas vivas */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Flame}
          tone="pain"
          value={contagem.quente}
          label="Leads quentes"
          hint="querem fechar agora"
        />
        <StatCard
          icon={Inbox}
          tone={naoLidas > 0 ? "pain" : "brand"}
          value={naoLidas}
          label="Sem resposta"
          hint="conversas não lidas"
        />
        <StatCard
          icon={Sparkles}
          tone="brand"
          value={carregando ? "—" : totalGerado}
          label="Respostas geradas"
        />
        <StatCard
          icon={Star}
          tone="gold"
          value={carregando ? "—" : favoritos}
          label="Favoritas"
        />
      </div>

      {/* Cockpit Lead Intelligence */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-brand-dark p-6 text-white shadow-soft sm:p-8">
        <div className="absolute right-0 top-0 p-10 opacity-10">
          <Sparkles size={120} />
        </div>
        <div className="relative z-10">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-lavender-400/30 bg-lavender-400/20 px-3 py-1 text-xs font-bold text-lavender-300">
            <Sparkles size={14} /> LEAD INTELLIGENCE
          </span>

          {temInbox ? (
            <>
              <h2 className="mb-5 font-serif text-2xl font-semibold">
                Sua fila de hoje, já priorizada
              </h2>
              <div className="mb-6 grid grid-cols-3 gap-3 sm:max-w-md">
                {TEMP.map((t) => (
                  <div
                    key={t.key}
                    className="rounded-2xl bg-white/8 p-4 text-center ring-1 ring-white/10"
                  >
                    <div className="text-2xl">{t.emoji}</div>
                    <div className="mt-1 font-serif text-3xl font-semibold tabular-nums">
                      {contagem[t.key]}
                    </div>
                    <div className="text-[11px] text-nude-200">{t.label}</div>
                  </div>
                ))}
              </div>
              {topLead && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-400/20 text-lg">
                    🔥
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {topLead.cliente_nome || topLead.cliente_numero}
                    </p>
                    <p className="truncate text-xs text-nude-200">{topLead.ultima_mensagem}</p>
                  </div>
                  <span className="shrink-0 font-serif text-xl font-semibold tabular-nums">
                    {topLead.score ?? 0}%
                  </span>
                </div>
              )}
              <Link
                href="/conversas"
                className="inline-flex items-center gap-2 rounded-xl bg-lavender-400 px-5 py-2.5 text-sm font-bold text-brand-900 transition-colors hover:bg-lavender-300"
              >
                Responder os quentes primeiro <ArrowRight size={16} />
              </Link>
            </>
          ) : (
            <>
              <h2 className="mb-3 font-serif text-2xl font-semibold">
                Cada mensagem do WhatsApp, lida e priorizada
              </h2>
              <p className="mb-5 max-w-xl text-sm leading-relaxed text-nude-200">
                A gente marca quem quer agendar agora 🔥, quem ainda tem dúvida 🌤️ e
                quem esfriou ❄️ — pra você responder primeiro quem fecha.
              </p>
              <Link
                href="/configuracoes"
                className="inline-flex items-center gap-2 rounded-xl bg-lavender-400 px-5 py-2.5 text-sm font-bold text-brand-900 transition-colors hover:bg-lavender-300"
              >
                Conectar meu WhatsApp <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Atalhos */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className={cn(
                "group rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-soft",
                c.primary
                  ? "border-brand-200 bg-gradient-to-br from-brand-50 to-lavender-50"
                  : "border-brand-100 bg-white"
              )}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white">
                <Icon size={18} />
              </div>
              <div className="flex items-center gap-1 font-serif text-base font-semibold text-ink">
                {c.title}
                <ArrowRight
                  size={15}
                  className="text-brand-500 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100"
                />
              </div>
              <p className="mt-0.5 text-xs text-muted">{c.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
