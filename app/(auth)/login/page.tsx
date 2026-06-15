import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams: Promise<{ next?: string; erro?: string }>;
};

/** Login vive no funil visual — esta rota só preserva links antigos. */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const q = new URLSearchParams();
  q.set("entrar", "1");
  if (params.next) q.set("next", params.next);
  if (params.erro) q.set("erro", params.erro);
  redirect(`/onboarding?${q.toString()}`);
}