import { Sidebar, MobileNav } from "@/components/nav";
import { DemoBanner } from "@/components/demo-banner";
import { ErrorBoundary } from "@/components/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-navy-900 md:flex md:flex-col app-root">
        <DemoBanner />
        <MobileNav />
        <div className="mx-auto flex w-full max-w-7xl">
          <Sidebar />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-10 bg-navy-900">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
