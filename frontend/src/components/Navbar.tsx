"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AGENT_ROUTES } from "@/lib/types";
import { useHackathon } from "@/context/HackathonContext";

const navLinks = [
  { href: "/", label: "Home" },
  ...Object.values(AGENT_ROUTES).map((r) => ({ href: r.path, label: r.label })),
];

export function Navbar() {
  const pathname = usePathname();
  const { result } = useHackathon();
  const hasResult = !!result;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🚀</span>
          <span className="font-semibold tracking-tight text-white">
            Hackathon Partner
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isAgentPage = link.href !== "/";
            const disabled = isAgentPage && !hasResult;
            const active = pathname === link.href;

            if (disabled) {
              return (
                <span
                  key={link.href}
                  className="cursor-not-allowed rounded-lg px-3 py-1.5 text-sm text-slate-500/60"
                >
                  {link.label}
                </span>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
