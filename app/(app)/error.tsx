"use client";

import { useEffect } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Pode logar para um serviço de erro como Sentry aqui.
    console.error("ErrorBoundary capturou erro:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardBody className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Ops, algo deu errado!
            </h2>
            <p className="text-sm text-muted">
              Tivemos um problema inesperado ao carregar esta página.
            </p>
          </div>
          <Button onClick={reset} variant="outline" className="w-full">
            Tentar novamente
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
