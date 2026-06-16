import { VisualAuthPanel } from "@/components/visual-auth-panel";
import { Card, CardBody } from "@/components/ui/card";

// Só aceita caminhos internos ("/rota"), nunca URLs absolutas ("//host" ou
// "http://"), pra evitar open redirect via ?next=.
function safeNext(next: string | string[] | undefined): string {
  const value = Array.isArray(next) ? next[0] : next;
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/dashboard";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  return (
    <Card className="w-full max-w-md">
      <CardBody className="p-6 sm:p-8">
        <VisualAuthPanel mode="login" next={safeNext(next)} />
      </CardBody>
    </Card>
  );
}
