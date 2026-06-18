"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, Sparkles, MessagesSquare, Send, ListChecks, History, Settings, LogOut, Brain, Users,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { isFirebaseConfigured } from "@/lib/config";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/dashboard",          label: "Início",             icon: Home,          pro: false },
  { href: "/gerador",            label: "Gerador",            icon: Sparkles,      pro: false },
  { href: "/lead-intelligence",  label: "Lead Intelligence",  icon: Brain,         pro: true  },
  { href: "/equipe",             label: "Equipe",             icon: Users,         pro: false },
  { href: "/objecoes",           label: "Objeções",           icon: MessagesSquare,pro: false },
  { href: "/follow-up",          label: "Follow-up",          icon: Send,          pro: false },
  { href: "/scripts",            label: "Scripts",            icon: ListChecks,    pro: false },
  { href: "/historico",          label: "Histórico",          icon: History,       pro: false },
  { href: "/configuracoes",      label: "Configurações",      icon: Settings,      pro: false },
];

function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Folha esquerda — arco da ponta superior até a ponta inferior */}
      <path d="M40 6 C26 14, 10 32, 10 54 C10 70, 22 82, 40 90" stroke="#C9A060" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Folha direita — espelho */}
      <path d="M40 6 C54 14, 70 32, 70 54 C70 70, 58 82, 40 90" stroke="#C9A060" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Haste vertical */}
      <line x1="40" y1="32" x2="40" y2="86" stroke="#C9A060" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Pin dot */}
      <circle cx="40" cy="27" r="5.5" fill="#C9A060"/>
    </svg>
  );
}

function useLogout() {
  const router = useRouter();
  return async () => {
    if (isFirebaseConfigured) {
      try {
        await signOut(getFirebaseAuth());
        document.cookie = "firebase_auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      } catch { /* ignora */ }
    }
    router.push("/");
    router.refresh();
  };
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar() {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-navy-800 px-3 py-6 md:flex border-r border-navy-500/50">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-3 px-2 mb-8">
        <LogoMark size={34} />
        <span className="font-serif text-base font-semibold text-champagne-300">
          Lead<span className="text-gold-500">Bellus</span>
        </span>
      </Link>

      {/* Linha dourada separadora */}
      <div className="gold-divider mb-5 mx-2" />

      <nav className="flex flex-1 flex-col gap-0.5">
        {links.map(({ href, label, icon: Icon, pro }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-white/5 text-gold-400 border-l-2 border-gold-500 pl-[10px]"
                  : "text-navy-100 hover:bg-white/5 hover:text-champagne-300"
              )}
            >
              <Icon size={17} className={active ? "text-gold-400" : pro ? "text-gold-500/70" : "text-navy-100"} />
              <span className="flex-1">{label}</span>
              {pro && (
                <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                  style={{ background: "rgba(201,160,96,0.15)", color: "#C9A060", border: "1px solid rgba(201,160,96,0.25)" }}>
                  PRO
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Linha dourada separadora */}
      <div className="gold-divider mt-4 mb-4 mx-2" />

      {/* Theme toggle */}
      <div className="flex justify-start px-1 mb-2">
        <ThemeToggle />
      </div>

      <button
        type="button"
        onClick={logout}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-navy-100 transition-colors hover:bg-navy-600/50 hover:text-champagne-400"
      >
        <LogOut size={17} />
        Sair
      </button>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-20 border-b border-navy-500/50 bg-navy-800 backdrop-blur md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <LogoMark size={26} />
          <span className="font-serif text-sm font-semibold text-champagne-300">
            Lead<span className="text-gold-500">Bellus</span>
          </span>
      </Link>
        <ThemeToggle />
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              isActive(pathname, href)
                ? "bg-gold-500/10 text-gold-400"
                : "text-navy-100 hover:text-champagne-300"
            )}
          >
            <Icon size={14} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
