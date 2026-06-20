"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useShouldReduce } from "@/components/motion-gate";

// Cores da identidade LeadBellus
// gold: #C9A060 | champagne: #D4C4A0 | deep gold: #92610A | muted blue: #5a7a9a

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradientColor = "rgba(201,160,96,0.15)",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradientColor?: string;
}) {
  const reduce = useShouldReduce();
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, 15, 0] }}
        transition={
          reduce
            ? undefined
            : { duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
        }
        style={{ width, height }}
        className="relative"
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(to right, ${gradientColor}, transparent)`,
            backdropFilter: "blur(2px)",
            border: "1.5px solid rgba(201,160,96,0.12)",
            boxShadow: `0 8px 32px 0 ${gradientColor.replace(/[\d.]+\)$/, "0.08)")}`,
          }}
        />
        {/* inner radial glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(201,160,96,0.12), transparent 70%)",
          }}
        />
      </motion.div>
    </motion.div>
  );
}

export function HeroShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grande faixa superior esquerda — gold */}
      <ElegantShape
        delay={0.3}
        width={580}
        height={130}
        rotate={12}
        gradientColor="rgba(201,160,96,0.13)"
        className="left-[-8%] top-[18%]"
      />

      {/* Faixa inferior direita — champagne */}
      <ElegantShape
        delay={0.5}
        width={460}
        height={110}
        rotate={-15}
        gradientColor="rgba(212,196,160,0.11)"
        className="right-[-4%] bottom-[12%]"
      />

      {/* Pequena inferior esquerda — deep gold */}
      <ElegantShape
        delay={0.4}
        width={280}
        height={72}
        rotate={-8}
        gradientColor="rgba(146,97,10,0.14)"
        className="left-[8%] bottom-[8%]"
      />

      {/* Pequena superior direita — gold claro */}
      <ElegantShape
        delay={0.6}
        width={190}
        height={54}
        rotate={20}
        gradientColor="rgba(201,160,96,0.10)"
        className="right-[18%] top-[12%]"
      />

      {/* Mini superior centro-esquerda — muted blue-gold */}
      <ElegantShape
        delay={0.7}
        width={140}
        height={38}
        rotate={-25}
        gradientColor="rgba(90,122,154,0.10)"
        className="left-[22%] top-[6%]"
      />
    </div>
  );
}
