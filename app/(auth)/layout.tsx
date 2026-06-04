import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-hero flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="mb-8">
        <Logo
          href="/"
          markSize={22}
          markClass="h-11 w-11"
          textClass="text-xl text-ink"
        />
      </div>
      {children}
    </div>
  );
}
