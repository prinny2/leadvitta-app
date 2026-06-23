"use client";

import { useEffect } from "react";
import { trackEvent } from "@/components/Analytics";

const DEPTHS = [25, 50, 75, 90];
const SECTION_IDS = ["hero", "simulador", "prova", "precos", "cta-final"];
const SECTION_VISIBILITY_THRESHOLD = 0.45;

export function LandingAnalytics() {
  useEffect(() => {
    const trackedDepths = new Set<number>();
    const trackedSections = new Set<string>();

    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      const progress = Math.round((window.scrollY / maxScroll) * 100);

      for (const depth of DEPTHS) {
        if (progress >= depth && !trackedDepths.has(depth)) {
          trackedDepths.add(depth);
          trackEvent("landing_scroll_depth", { depth });
        }
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const sectionId = entry.target.getAttribute("id");
          if (!sectionId || trackedSections.has(sectionId)) continue;

          trackedSections.add(sectionId);
          trackEvent("landing_section_view", { sectionId });
        }
      },
      // 45% balances early detection with a stronger signal that the section was
      // actually seen, avoiding accidental views from tiny scroll peeks.
      { threshold: SECTION_VISIBILITY_THRESHOLD }
    );

    SECTION_IDS.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) observer.observe(element);
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return null;
}
