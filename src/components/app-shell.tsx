"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  ClipboardCheck,
  FolderKanban,
  Megaphone,
  NotebookPen,
  Plus,
  Sun,
  Users,
  Building2,
} from "lucide-react";
import { Composer } from "@/components/composer";
import { Button } from "@/components/ui/button";
import { fieldControl } from "@/components/field";
import { useStudio } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ComposerKind } from "@/lib/types";

const nav = [
  { href: "/", label: "Today", icon: Sun },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/work", label: "Work", icon: FolderKanban },
  { href: "/approvals", label: "Approvals", icon: ClipboardCheck },
  { href: "/recaps", label: "Recaps", icon: NotebookPen },
  { href: "/clients", label: "Clients", icon: Building2 },
  { href: "/team", label: "Team", icon: Users },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, setCurrentUser } = useStudio();
  const [composer, setComposer] = useState(false);
  const [kind, setKind] = useState<ComposerKind>("task");

  return (
    <div className="flex min-h-full">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="px-5 py-6">
          <p className="text-[11px] tracking-[0.18em] uppercase text-sidebar-foreground/60">
            Relay desk
          </p>
          <p className="font-heading mt-1 text-2xl leading-tight">
            {state.studioName}
          </p>
        </div>
        <nav className="grid gap-0.5 px-3">
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
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto grid gap-2 p-4">
          <Button
            className="w-full"
            onClick={() => {
              setKind("task");
              setComposer(true);
            }}
          >
            <Plus data-icon="inline-start" />
            Add
          </Button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b bg-background/90 px-4 py-3 backdrop-blur md:px-8">
          <div className="md:hidden">
            <p className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
              Relay
            </p>
            <p className="font-heading text-lg">{state.studioName}</p>
          </div>
          <p className="hidden text-sm text-muted-foreground md:block">
            One desk for campaigns, the calendar, and the close of day.
          </p>
          <div className="ml-auto flex items-center gap-2">
            <label className="hidden items-center gap-2 text-sm sm:flex">
              <span className="text-muted-foreground">Working as</span>
              <select
                className={cn(fieldControl, "w-44")}
                value={state.currentUserId}
                onChange={(e) => setCurrentUser(e.target.value)}
              >
                {state.team.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <Button
              size="sm"
              className="md:hidden"
              onClick={() => setComposer(true)}
            >
              <Plus />
              Add
            </Button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        <nav className="sticky bottom-0 grid grid-cols-5 border-t bg-background px-1 py-2 md:hidden">
          {nav.slice(0, 5).map((item) => {
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
      <Composer
        open={composer}
        onOpenChange={setComposer}
        defaultKind={kind}
      />
    </div>
  );
}
