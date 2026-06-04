"use client";

import { useState, useEffect } from "react";
import { getClinica } from "@/lib/store";
import { clinicaVazia, type Clinica } from "@/lib/types";

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
