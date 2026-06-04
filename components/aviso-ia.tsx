import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function AvisoIA({ 
  aviso, 
  className 
}: { 
  aviso?: string; 
  className?: string 
}) {
  if (!aviso) return null;

  return (
    <div className={cn(
      "flex items-start gap-2 rounded-xl border border-lavender-200 bg-lavender-50 px-3.5 py-2.5 text-xs text-lavender-700",
      className
    )}>
      <Info size={15} className="mt-0.5 shrink-0" />
      <span>{aviso}</span>
    </div>
  );
}
