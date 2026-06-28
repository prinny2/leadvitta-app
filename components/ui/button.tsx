import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "cta" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  cta: "bg-gold-500 text-navy-900 hover:bg-gold-400 shadow-cta font-semibold",
  primary:
    "bg-navy-600 border border-gold-500/30 text-champagne-300 hover:border-gold-400 hover:bg-navy-500",
  secondary: "bg-navy-600 text-champagne-400 hover:bg-navy-500",
  outline:
    "border border-navy-500 text-champagne-400 hover:bg-navy-600 hover:border-navy-400",
  ghost: "text-champagne-400 hover:bg-navy-600",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
