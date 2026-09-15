import Link from "next/link";
import { SearchX } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 p-4">
      <Card className="w-full max-w-lg">
        <CardBody className="flex flex-col items-center gap-5 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-500/15 text-gold-300">
            <SearchX size={28} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
              404
            </p>
            <h1 className="font-serif text-3xl font-semibold text-ink">
              Esta página não foi encontrada
            </h1>
            <p className="text-sm text-muted">
              O link pode estar quebrado ou o conteúdo pode ter sido movido.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-xl bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-900 shadow-cta transition-colors hover:bg-gold-400 sm:w-auto"
          >
            Voltar para a página inicial
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
