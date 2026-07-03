"use client";

import { useState, useEffect } from "react";
import { getClinica } from "@/lib/store";
import { clinicaVazia, type Clinica } from "@/lib/types";

export function buildClinicaDnaPayload(clinica: Clinica | null | undefined): Partial<Clinica> | undefined {
  if (!clinica) return undefined;
  return {
    nome_clinica: clinica.nome_clinica,
    cidade: clinica.cidade,
    procedimentos: clinica.procedimentos,
    formalidade: clinica.formalidade,
    como_chamar: clinica.como_chamar,
    cta_preferido: clinica.cta_preferido,
  };
}

export function useClinica() {
  const [clinica, setClinica] = useState<Clinica>(clinicaVazia);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getClinica().then((c) => {
      if (active) {
        setClinica(c);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return { clinica, loading };
}
