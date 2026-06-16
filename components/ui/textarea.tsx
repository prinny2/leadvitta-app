import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[110px] w-full rounded-xl border border-navy-500 bg-navy-800 px-3.5 py-3 text-sm leading-relaxed text-champagne-300 placeholder:text-navy-100/60 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
