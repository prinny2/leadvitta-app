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
        "inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50",
        copied && "border-green-300 bg-green-50 text-green-700",
        className
      )}
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
      {copied ? "Copiado!" : label}
    </button>
  );
}
