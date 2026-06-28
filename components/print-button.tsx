"use client";

import { Printer } from "lucide-react";
import { cn } from "@/lib/utils";

/** Aciona a impressão do navegador (que permite "Salvar como PDF"). */
export function PrintButton({
  label = "Exportar / Imprimir",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50",
        className,
      )}
    >
      <Printer size={15} /> {label}
    </button>
  );
}
