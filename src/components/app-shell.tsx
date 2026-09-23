"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  CalendarDays,
  Clapperboard,
  LayoutGrid,
  Plus,
} from "lucide-react";
import { Composer } from "@/components/composer";
import { Button } from "@/components/ui/button";
import { fieldControl } from "@/components/field";
import { useStudio } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ComposerKind } from "@/lib/types";

const nav = [
  { href: "/", label: "Projects", icon: LayoutGrid },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/video", label: "Video", icon: Clapperboard },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, setCurrentUser, live } = useStudio();
  const [composer, setComposer] = useState(false);
  const [kind, setKind] = useState<ComposerKind>("publish");

  return (
    <div className="flex min-h-full">
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="px-5 py-7">
          <p className="text-[11px] tracking-[0.22em] uppercase text-sidebar-foreground/50">
            Akaai Spaces
          </p>
          <p className="font-heading mt-2 text-[1.65rem] leading-tight">
            Desk
          </p>
        </div>
        <nav className="grid gap-1 px-3">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-4">
          <Button
            className="w-full"
            onClick={() => {
              setKind("publish");
              setComposer(true);
            }}
          >
            <Plus data-icon="inline-start" />
            Add
          </Button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background/85 px-5 py-3.5 backdrop-blur md:px-10">
          <div className="md:hidden">
            <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
              Akaai Spaces
            </p>
          </div>
          <p className="hidden text-sm text-muted-foreground md:block">
            Projects, publish dates, invoices.
          </p>
          {live && (
            <span className="hidden rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] text-emerald-900 sm:inline">
              Live
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <select
              className={cn(fieldControl, "w-40")}
              value={state.currentUserId}
              onChange={(e) => setCurrentUser(e.target.value)}
              aria-label="Working as"
            >
              {state.team.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <Button size="sm" className="md:hidden" onClick={() => setComposer(true)}>
              <Plus />
              Add
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 md:px-10 md:py-12">
          {children}
        </main>
        <nav className="sticky bottom-0 grid grid-cols-4 border-t bg-background/95 py-2 backdrop-blur md:hidden">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-1 text-[11px]",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <Composer open={composer} onOpenChange={setComposer} defaultKind={kind} />
    </div>
  );
}
