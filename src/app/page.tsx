"use client";

import Link from "next/link";
import { useState } from "react";
import { Composer } from "@/components/composer";
import { PageHeader } from "@/components/page-header";
import { PersonChip } from "@/components/person-chip";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { formatShort, isPast, todayISO } from "@/lib/dates";
import { company, reminders } from "@/lib/selectors";
import { useStudio } from "@/lib/store";

export default function HomePage() {
  const { state } = useStudio();
  const [open, setOpen] = useState(false);
  const today = todayISO();
  const coming = reminders(state).slice(0, 4);
  const current = state.projects.filter((p) => p.current);

  return (
    <div>
      <PageHeader
        kicker="Akaai Spaces"
        title="Current projects"
        description="What is running now. Open a company for deliverables, publish dates, and invoices."
        actions={
          <Button onClick={() => setOpen(true)}>Add</Button>
        }
      />

      <section className="mb-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-heading text-2xl">Coming up</h2>
          <Link href="/calendar" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            Full calendar
          </Link>
        </div>
        <div className="grid gap-3">
          {coming.length === 0 && (
            <p className="text-sm text-muted-foreground">Nothing dated yet.</p>
          )}
          {coming.map((r) => {
            const late = isPast(r.date, today);
            return (
              <Link
                key={r.id}
                href={r.href}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card px-5 py-4"
              >
                <div>
                  <p className="text-sm text-muted-foreground">
                    {company(state, r.companyId)?.name}
                  </p>
                  <p className="text-lg">{r.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge kind="reminder" value={r.kind} />
                  <PersonChip state={state} id={r.ownerId} className="text-sm" />
                  <span className={late ? "text-sm text-rose-700" : "text-sm"}>
                    {formatShort(r.date)}
                    {r.amount ? ` · ${r.amount}` : ""}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5">
        {current.map((p) => {
          const co = company(state, p.companyId);
          const camps = state.campaigns.filter((c) => c.projectId === p.id);
          return (
            <Link
              key={p.id}
              href={`/companies/${p.companyId}`}
              className="block rounded-3xl border bg-card p-6 shadow-sm transition hover:border-foreground/15"
            >
              <p className="text-sm text-muted-foreground">{co?.name}</p>
              <h2 className="font-heading mt-1 text-3xl">{p.name}</h2>
              <ul className="mt-5 grid gap-2">
                {camps.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-muted/70 px-4 py-3"
                  >
                    <span>{c.name}</span>
                    <StatusBadge kind="campaign" value={c.status} />
                  </li>
                ))}
                {camps.length === 0 && (
                  <li className="text-sm text-muted-foreground">No campaigns yet.</li>
                )}
              </ul>
            </Link>
          );
        })}
      </section>
      <Composer open={open} onOpenChange={setOpen} defaultKind="project" />
    </div>
  );
}
