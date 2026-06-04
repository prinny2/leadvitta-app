import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export type SelectOption = { value: string; label: string };

export function Select({
  value,
  onChange,
  options,
  placeholder,
  className,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  id?: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-11 w-full appearance-none rounded-xl border border-brand-200 bg-white px-3.5 pr-10 text-sm text-ink focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200",
          className
        )}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  );
}
