"use client";

import * as React from "react";
import { Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useRouter } from "next/navigation";

export function Topbar() {
  const router = useRouter();
  const [q, setQ] = React.useState("");

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/leads?q=${encodeURIComponent(q.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 backdrop-blur px-4 md:px-6">
      <MobileNav />
      <form onSubmit={onSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search leads, companies, notes..."
            className="pl-8 h-9"
          />
        </div>
      </form>
      <div className="flex-1" />
      <ThemeToggle />
    </header>
  );
}
