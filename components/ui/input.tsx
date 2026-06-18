import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-navy-500 bg-navy-800 px-3.5 text-sm text-champagne-300 placeholder:text-navy-100/60 focus:border-gold-500/50 focus:outline-none focus:ring-2 focus:ring-gold-500/20",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
