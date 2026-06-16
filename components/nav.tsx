"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, Sparkles, MessagesSquare, Send, ListChecks, History, Settings, LogOut,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { isFirebaseConfigured } from "@/lib/config";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard",    label: "Início",        icon: Home },
  { href: "/gerador",      label: "Gerador",       icon: Sparkles },
  { href: "/objecoes",     label: "Objeções",      icon: MessagesSquare },
  { href: "/follow-up",    label: "Follow-up",     icon: Send },
  { href: "/scripts",      label: "Scripts",       icon: ListChecks },
  { href: "/historico",    label: "Histórico",     icon: History },
  { href: "/configuracoes",label: "Configurações", icon: Settings },
];

function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Folha esquerda */}
      <path d="M50 100 C20 80 10 55 20 30 C30 20 45 18 50 22" stroke="#C9A060" strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* Folha direita */}
      <path d="M50 100 C80 80 90 55 80 30 C70 20 55 18 50 22" stroke="#C9A060" strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* Losango central */}
      <path d="M50 8 L70 35 L50 62 L30 35 Z" stroke="#C9A060" strokeWidth="3.5" strokeLinejoin="round" fill="none"/>
      {/* Haste vertical */}
      <line x1="50" y1="40" x2="50" y2="100" stroke="#C9A060" strokeWidth="3" strokeLinecap="round"/>
      {/* Ponto do pin */}
      <circle cx="50" cy="36" r="4" fill="#C9A060"/>
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
        <div>
          <span className="font-serif text-base font-semibold text-champagne-300">
            Lead<span className="text-gold-500">Bellus</span>
          </span>
          <p className="text-[10px] text-navy-100 tracking-widest uppercase">by IA</p>
        </div>
      </Link>

      {/* Linha dourada separadora */}
      <div className="gold-divider mb-5 mx-2" />

      <nav className="flex flex-1 flex-col gap-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/25 gold-glow"
                  : "text-navy-50 hover:bg-navy-600/50 hover:text-champagne-300"
              )}
            >
              <Icon size={17} className={active ? "text-gold-400" : "text-navy-100"} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Linha dourada separadora */}
      <div className="gold-divider mt-4 mb-4 mx-2" />

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
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              isActive(pathname, href)
                ? "bg-gold-500/15 text-gold-400 border border-gold-500/25"
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
