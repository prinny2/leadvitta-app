import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      // Espelha o path alias do tsconfig: "@/*" -> raiz do projeto.
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["lib/**/*.ts", "data/**/*.ts"],
      exclude: [
        // Módulos que só inicializam SDKs externos (Firebase/Stripe) e
        // dependem de ambiente — sem lógica pura para cobrir em unidade.
        "lib/firebase/**",
        "lib/stripe/**",
        "lib/store.ts",
        "lib/hooks/**",
        "lib/types.ts",
        "**/*.d.ts",
      ],
    },
  },
});
