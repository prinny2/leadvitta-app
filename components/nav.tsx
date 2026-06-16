"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Sparkles,
  MessagesSquare,
  Send,
  ListChecks,
  History,
  Settings,
  LogOut,
  Flower2,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { isFirebaseConfigured } from "@/lib/config";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/gerador", label: "Gerador", icon: Sparkles },
  { href: "/objecoes", label: "Objeções", icon: MessagesSquare },
  { href: "/follow-up", label: "Follow-up", icon: Send },
  { href: "/scripts", label: "Scripts", icon: ListChecks },
  { href: "/historico", label: "Histórico", icon: History },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

function useLogout() {
  const router = useRouter();
  return async () => {
    if (isFirebaseConfigured) {
      try {
        await signOut(getFirebaseAuth());
        document.cookie =
          "firebase_auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      } catch {
        /* ignora */
      }
      router.push("/onboarding");
    } else {
      router.push("/");
    }
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
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-brand-500 px-3 py-6 md:flex">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-2 mb-8">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-800">
          <Flower2 size={18} strokeWidth={1.6} className="text-gold-400" />
        </span>
        <span className="font-serif text-base font-semibold text-lavender-100">
          Lead<span className="text-gold-400">Bellus</span>
        </span>
      </Link>

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
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/20"
                  : "text-lavender-400 hover:bg-white/5 hover:text-lavender-200"
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={logout}
        className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-lavender-500 transition-colors hover:bg-white/5 hover:text-lavender-300"
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
    <div className="sticky top-0 z-20 border-b border-brand-600 bg-brand-500 backdrop-blur md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-800">
            <Flower2 size={16} strokeWidth={1.6} className="text-gold-400" />
          </span>
          <span className="font-serif text-sm font-semibold text-lavender-100">
            Lead<span className="text-gold-400">Bellus</span>
          </span>
        </Link>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
              isActive(pathname, href)
                ? "bg-gold-500/20 text-gold-400"
                : "text-lavender-400"
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
