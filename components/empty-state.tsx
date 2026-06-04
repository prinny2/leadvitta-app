import { LucideIcon } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";

export function EmptyState({
  icon: Icon,
  mensagem,
}: {
  icon: LucideIcon;
  mensagem: React.ReactNode;
}) {
  return (
    <Card>
      <CardBody className="flex flex-col items-center gap-3 py-14 text-center text-muted">
        <Icon size={28} className="text-brand-300" />
        <p className="max-w-xs text-sm">{mensagem}</p>
      </CardBody>
    </Card>
  );
}
