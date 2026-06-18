import { LucideIcon } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  mensagem,
  tone = "light",
}: {
  icon: LucideIcon;
  mensagem: React.ReactNode;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <Card className={dark ? "border-navy-500 bg-navy-700" : undefined}>
      <CardBody
        className={cn(
          "flex flex-col items-center gap-3 py-14 text-center",
          dark ? "text-navy-100" : "text-muted"
        )}
      >
        <Icon size={28} className={dark ? "text-navy-300" : "text-brand-300"} aria-hidden="true" />
        <p className="max-w-xs text-sm">{mensagem}</p>
      </CardBody>
    </Card>
  );
}
