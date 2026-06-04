"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.fallback) return this.fallback;

      return (
        <div className="flex min-h-[400px] items-center justify-center p-6">
          <Card className="max-w-md border-red-100 bg-red-50">
            <CardBody className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertCircle size={24} />
              </div>
              <h2 className="text-xl font-semibold text-ink">Ops! Algo deu errado</h2>
              <p className="text-sm text-muted">
                Ocorreu um erro inesperado nesta parte do aplicativo.
              </p>
              <Button
                variant="outline"
                className="w-full border-red-200 hover:bg-red-100"
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={16} /> Recarregar página
              </Button>
            </CardBody>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
