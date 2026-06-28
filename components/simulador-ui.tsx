"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function SimuladorFadeUp({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SimuladorUnderline() {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: 0.6 }}
      viewBox="0 0 200 10"
      style={{
        position: "absolute",
        bottom: "-6px",
        left: 0,
        width: "100%",
        overflow: "visible",
        pointerEvents: "none",
      }}
      preserveAspectRatio="none"
    >
      <motion.path
        d="M 2 7 Q 50 2 100 7 Q 150 12 198 5"
        fill="none"
        stroke="#C9A060"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

export function SimuladorScenarioBtn({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active: boolean;
}) {
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
      <Link
        href={href}
        style={{
          display: "inline-block",
          border: active
            ? "1px solid #C9A060"
            : "1px solid rgba(201,160,96,0.4)",
          color: "#C9A060",
          borderRadius: "9999px",
          padding: "6px 16px",
          fontSize: "12px",
          fontWeight: 600,
          textDecoration: "none",
          background: active
            ? "rgba(201,160,96,0.15)"
            : "rgba(201,160,96,0.07)",
          transition:
            "background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background =
            "rgba(201,160,96,0.15)";
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "#C9A060";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow =
            "0 0 12px rgba(201,160,96,0.2)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background =
            "rgba(201,160,96,0.07)";
          (e.currentTarget as HTMLAnchorElement).style.borderColor =
            "rgba(201,160,96,0.4)";
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
        }}
      >
        {children}
      </Link>
    </motion.div>
  );
}
