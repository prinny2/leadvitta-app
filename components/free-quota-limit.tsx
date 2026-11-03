import Link from "next/link";
import { Sparkles } from "lucide-react";

export function FreeQuotaLimit() {
  return (
    <div className="rounded-2xl border border-gold-500/40 bg-gold-500/10 p-6 text-center shadow-card">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/20">
        <Sparkles size={22} className="text-gold-400" />
      </div>
      <p className="mb-1 font-serif text-lg font-semibold text-champagne-300">
        Você usou suas respostas grátis 🎉
      </p>
      <p className="mx-auto mb-4 max-w-[340px] text-sm leading-relaxed text-navy-100">
        Assine o Start para continuar usando as ferramentas de IA da clínica.
      </p>
      <Link
        href="/gerador"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-bold text-navy-900 shadow-cta transition-all hover:-translate-y-0.5"
      >
        <Sparkles size={16} /> Ver planos e continuar
      </Link>
    </div>
  );
}
