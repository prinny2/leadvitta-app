import { parseBillingPlan } from "@/lib/billing";
import { VisualAuthPanel } from "@/components/visual-auth-panel";
import { Card, CardBody } from "@/components/ui/card";

// Só aceita caminhos internos ("/rota"), nunca URLs absolutas ("//host" ou
// "http://"), pra evitar open redirect via ?next=.
function safeNext(next: string | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/dashboard";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; plan?: string | string[] }>;
}) {
  const sp = await searchParams;
  const next = Array.isArray(sp.next) ? sp.next[0] : sp.next;
  const planRaw = Array.isArray(sp.plan) ? sp.plan[0] : sp.plan;

  // Mantém o funil de checkout ao vir de /signup -> "Entrar".
  const plan = parseBillingPlan(planRaw ?? null);
  const checkoutAfter = next === "checkout";

  return (
    <Card className="w-full max-w-md">
      <CardBody className="p-6 sm:p-8">
        <VisualAuthPanel
          mode="login"
          plan={plan ?? undefined}
          checkoutAfter={checkoutAfter}
          next={safeNext(next)}
          compact
        />
      </CardBody>
    </Card>
  );
}
