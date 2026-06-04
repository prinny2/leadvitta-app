import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-xl border border-brand-200 bg-white px-3.5 text-sm text-ink placeholder:text-muted/70 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
