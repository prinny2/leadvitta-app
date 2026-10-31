"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({
  text,
  label = "Copiar",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback simples
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand("copy");
      } catch {
        /* ignora */
      }
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-navy-500 bg-navy-700 px-3 py-1.5 text-xs font-medium text-champagne-300 transition-colors hover:bg-navy-600",
        copied && "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
        className
      )}
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
      {copied ? "Copiado!" : label}
    </button>
  );
}
