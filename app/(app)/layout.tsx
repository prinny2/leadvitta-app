import { Sidebar, MobileNav } from "@/components/nav";
import { DemoBanner } from "@/components/demo-banner";
import { OnboardingGate } from "@/components/onboarding-gate";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-nude-50">
      <OnboardingGate />
      <DemoBanner />
      <MobileNav />
      <div className="mx-auto flex w-full max-w-7xl">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
