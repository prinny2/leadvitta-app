import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { PUBLIC_ROUTES } from "@/lib/seo";

const fonte = readFileSync(resolve(process.cwd(), "app/setup-whatsapp/page.tsx"), "utf8");

describe("página do setup de WhatsApp", () => {
  it("entra no sitemap", () => {
    expect(PUBLIC_ROUTES).toContain("/setup-whatsapp");
  });

  it("mostra preço, sinal e devolução", () => {
    expect(fonte).toContain("R$397");
    expect(fonte).toContain("R$97 de sinal");
    expect(fonte).toContain("o sinal volta no");
  });

  it("não promete resultado nem usa termo proibido", () => {
    expect(fonte).not.toMatch(/secretária|injetáveis|garantid/i);
  });
});
