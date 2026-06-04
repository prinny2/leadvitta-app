import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[110px] w-full rounded-xl border border-brand-200 bg-white px-3.5 py-3 text-sm leading-relaxed text-ink placeholder:text-muted/70 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
