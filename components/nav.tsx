"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Inbox,
  Sparkles,
  MessagesSquare,
  Send,
  ListChecks,
  History,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { isFirebaseConfigured } from "@/lib/config";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

const links = [
  { href: "/dashboard", label: "Início", icon: Home },
  { href: "/conversas", label: "Conversas", icon: Inbox },
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
      router.push("/login");
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
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-brand-100 bg-white/60 px-3 py-6 md:flex">
      <div className="px-1">
        <Logo />
      </div>
      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(pathname, href)
                ? "bg-brand-50 text-brand-700"
                : "text-muted hover:bg-nude-100 hover:text-ink"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <button
        type="button"
        onClick={logout}
        className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-nude-100 hover:text-ink"
      >
        <LogOut size={18} />
        Sair
      </button>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <div className="sticky top-0 z-20 border-b border-brand-100 bg-white/90 backdrop-blur md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Logo />
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
              isActive(pathname, href)
                ? "bg-brand-50 text-brand-700"
                : "text-muted"
            )}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
