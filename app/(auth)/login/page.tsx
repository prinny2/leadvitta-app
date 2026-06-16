import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

/** Login não bloqueia o funil — manda pro onboarding. */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const q = new URLSearchParams();
  if (params.next) q.set("next", params.next);
  const suffix = q.toString() ? `?${q.toString()}` : "";
  redirect(`/onboarding${suffix}`);
}