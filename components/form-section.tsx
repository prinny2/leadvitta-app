import type { ReactNode } from "react";

type FormSectionProps = {
  titulo: string;
  children: ReactNode;
};

export function FormSection({ titulo, children }: FormSectionProps) {
  return (
    <div className="rounded-2xl border border-navy-500 bg-navy-700 shadow-card">
      <div className="border-b border-brand-50 px-5 py-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-navy-100">
          {titulo}
        </p>
      </div>
      <div className="space-y-4 p-5 sm:p-6">{children}</div>
    </div>
  );
}
