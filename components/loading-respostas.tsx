import { Loader2 } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";

export function LoadingRespostas({ 
  mensagem = "Escrevendo as melhores respostas..." 
}: { 
  mensagem?: string 
}) {
  return (
    <Card>
      <CardBody className="flex flex-col items-center gap-3 py-14 text-muted">
        <Loader2 size={28} className="animate-spin text-brand-400" />
        <p className="text-sm">{mensagem}</p>
      </CardBody>
    </Card>
  );
}
