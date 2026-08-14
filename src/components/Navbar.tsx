"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Search } from "lucide-react";

import { LensAvatar } from "@/components/LensAvatar";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Discover" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/track-record", label: "Track Record" },
  { href: "/how-it-works", label: "How It Works" },
] as const;

function SearchField() {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const query = params.get("q") ?? "";

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    const target = pathname === "/watchlist" ? "/watchlist" : "/";
    router.push(q ? `${target}?q=${encodeURIComponent(q)}` : target);
  }

  return (
    <form onSubmit={submit} className="relative hidden md:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#646c7a]" />
      <input
        // Remount on navigation so the field reflects the URL.
        key={query}
        name="q"
        defaultValue={query}
        placeholder="Search forecasts"
        aria-label="Search forecasts"
        className="h-9 w-56 rounded-lg border border-[#1e232c] bg-[#0d0f13] pl-9 pr-3 text-[13px] text-[#e9ecf1] placeholder:text-[#646c7a] transition-colors focus:border-[#2a303b] focus:outline-none lg:w-64"
      />
    </form>
  );
}

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#1e232c] bg-[#08090b]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1240px] items-center gap-6 px-5 lg:px-8">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/" || pathname.startsWith("/forecast")
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-[#151920] text-[#e9ecf1]"
                    : "text-[#949cab] hover:text-[#e9ecf1]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <React.Suspense fallback={<div className="hidden h-9 w-56 md:block" />}>
            <SearchField />
          </React.Suspense>
          <LensAvatar />
        </div>
      </div>
    </header>
  );
}
