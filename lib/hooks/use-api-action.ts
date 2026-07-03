"use client";

import { useState, useCallback } from "react";

type ApiActionState = {
  loading: boolean;
  erro: string;
  aviso: string;
};

type ApiActionOptions<T> = {
  url: string;
  body: Record<string, unknown>;
  onSuccess: (data: T) => void;
  demoAviso?: string;
};

export function useApiAction() {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const reset = useCallback(() => {
    setLoading(false);
    setErro("");
    setAviso("");
  }, []);

  const call = useCallback(
    async <T extends { mock?: boolean; aviso?: string; error?: string }>({
      url,
      body,
      onSuccess,
      demoAviso,
    }: ApiActionOptions<T>) => {
      setLoading(true);
      setErro("");
      setAviso("");
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data: T = await res.json();
        if (!res.ok) {
          setErro(data.error || "Não foi possível processar agora.");
          return null;
        }
        if (data.mock) {
          setAviso(data.aviso || demoAviso || "Modo demonstração ativo.");
        } else if (data.aviso) {
          setAviso(data.aviso);
        }
        onSuccess(data);
        return data;
      } catch {
        setErro("Falha de conexão. Tente novamente.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, erro, aviso, call, reset, setErro, setAviso } as const;
}
