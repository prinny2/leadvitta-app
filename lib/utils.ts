import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Junta classes do Tailwind resolvendo conflitos. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Só os dígitos de um número (remove +, espaços, máscara). */
export function numeroDigits(n: string | undefined | null): string {
  return (n ?? "").replace(/[^\d]/g, "");
}

/**
 * Variantes de um número p/ casar com/sem DDI 55 (Brasil) e com/sem o 9.
 * Usado no servidor para achar a clínica mesmo se ela digitou o número
 * num formato diferente do que o provedor entrega. Máx. 10 (limite do `in`).
 */
export function candidatosNumero(n: string | undefined | null): string[] {
  const d = numeroDigits(n);
  if (!d) return [];
  const set = new Set<string>([d]);
  if (d.startsWith("55")) set.add(d.slice(2));
  else set.add("55" + d);
  return Array.from(set).slice(0, 10);
}

/** Formata uma data ISO para algo legível em pt-BR. */
export function formatarData(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
