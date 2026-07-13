"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/components/theme-provider";
import type { LeadIntelligenceResult } from "@/app/api/lead-intelligence/route";

/**
 * Recharts-based radar chart showing the five lead-profile dimensions.
 * Extracted into a separate module so it can be loaded with next/dynamic,
 * keeping Recharts (~450 KB parsed) out of the initial page bundle.
 */
export default function LeadRadar({ eixos }: { eixos: LeadIntelligenceResult["eixos"] }) {
  const { theme } = useTheme();
  const light = theme === "light";

  const data = [
    { axis: "Urgência",   val: eixos.urgencia      },
    { axis: "Intenção",   val: eixos.intencao      },
    { axis: "Confiança",  val: eixos.confianca     },
    { axis: "Receptiv.",  val: eixos.receptividade },
    { axis: "Maturidade", val: eixos.maturidade    },
  ];

  return (
    <ResponsiveContainer width="100%" height={230}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke={light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"} />
        <PolarAngleAxis dataKey="axis" tick={{ fill: light ? "#6B7280" : "#8aacc8", fontSize: 11, fontWeight: 600 }} />
        <Radar name="Lead" dataKey="val" stroke="#C9A060" strokeWidth={2} fill="#C9A060" fillOpacity={0.18}
          dot={{ fill: "#C9A060", r: 4, strokeWidth: 0 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
