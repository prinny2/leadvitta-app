import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { PUBLIC_ROUTES } from "@/lib/seo";

const fonte = readFileSync(resolve(process.cwd(), "app/(marketing)/sites/page.tsx"), "utf8");
const cta = readFileSync(resolve(process.cwd(), "components/sites-cta.tsx"), "utf8");

describe("página do site-catálogo (/sites)", () => {
  it("entra no sitemap", () => {
    expect(PUBLIC_ROUTES).toContain("/sites");
  });

  it("mostra a oferta exata", () => {
    expect(fonte).toContain('"R$ 590"');
    expect(fonte).toContain("50% para começar, 50% na entrega");
    expect(fonte).toContain('"R$ 79/mês"');
    expect(fonte).toContain("até sexta, 4/12");
    expect(fonte).toContain("normalmente R$ 97");
  });

  it("não inventa desconto, garantia nem prova social", () => {
    expect(fonte).not.toMatch(/\bde R\$|garantid|depoimento|clientes satisfeitos|já fizemos/i);
  });

  it("CTA usa o número público e marca a origem sites", () => {
    expect(cta).toContain("NEXT_PUBLIC_WHATSAPP_NUMBER");
    expect(cta).toContain('source: "sites"');
  });
});
