/**
 * True quando rodando num ambiente de PRODUÇÃO de verdade:
 * NODE_ENV=production OU dentro do Cloud Run (K_SERVICE é setado pelo runtime).
 *
 * Fonte única para checagens "fail-closed" — o webhook do WhatsApp e o
 * api-security precisam concordar: no Cloud Run o build pode não setar
 * NODE_ENV=production, então depender só dele deixa portas abertas.
 */
export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production" || !!process.env.K_SERVICE;
}
