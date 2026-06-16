import Link from "next/link";
import { SearchX } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-nude-50 p-4">
      <Card className="w-full max-w-lg">
        <CardBody className="flex flex-col items-center gap-5 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lavender-100 text-lavender-700">
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
            className="inline-flex w-full items-center justify-center rounded-xl bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-soft transition-colors hover:bg-brand-600 sm:w-auto"
          >
            Voltar para a página inicial
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
