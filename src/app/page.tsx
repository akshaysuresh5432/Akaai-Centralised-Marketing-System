"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DayRun } from "@/components/day-run";
import { PageHeader } from "@/components/page-header";
import { PersonChip } from "@/components/person-chip";
import { StatusBadge } from "@/components/status-badge";
import { StudioGantt } from "@/components/studio-gantt";
import { Button } from "@/components/ui/button";
import { Composer } from "@/components/composer";
import { addDays, formatDay, todayISO } from "@/lib/dates";
import {
  approvals,
  campaign,
  myOpenWork,
  overdueTasks,
  person,
} from "@/lib/selectors";
import { useStudio } from "@/lib/store";
import type { ComposerKind } from "@/lib/types";

export default function TodayPage() {
  const { state } = useStudio();
  const today = todayISO();
  const [iso, setIso] = useState(today);
  const [composer, setComposer] = useState(false);
  const [kind, setKind] = useState<ComposerKind>("recap");
  const me = person(state, state.currentUserId);
  const mine = myOpenWork(state, state.currentUserId);
  const late = overdueTasks(state, today);
  const waiting = approvals(state);
  const todayRecap = state.recaps.find(
    (r) => r.date === iso && r.type === "daily-close"
  );
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <div>
      <PageHeader
        kicker="Today"
        title={`${greeting}, ${me?.name.split(" ")[0] ?? "team"}`}
        description={formatDay(iso)}
        actions={
          <>
            <Button variant="outline" onClick={() => setIso(addDays(iso, -1))}>
              Previous day
            </Button>
            <Button variant="outline" onClick={() => setIso(today)}>
              Jump to today
            </Button>
            <Button variant="outline" onClick={() => setIso(addDays(iso, 1))}>
              Next day
            </Button>
          </>
        }
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <Stat
          label="On your plate"
          value={String(mine.tasks.length + mine.deliverables.length)}
          hint="Open tasks and assets"
        />
        <Stat
          label="Overdue for the studio"
          value={String(late.length)}
          hint="Anything past due, anyone"
        />
        <Stat
          label="Waiting on review"
          value={String(waiting.length)}
          hint="Internal or client"
        />
      </div>

      {iso === today && late.length > 0 && (
        <section className="mb-8 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <h2 className="font-medium text-rose-950">Overdue</h2>
          <ul className="mt-2 grid gap-2">
            {late.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>{t.title}</span>
                <PersonChip state={state} id={t.assigneeId} className="text-xs" />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="font-heading text-2xl">Run of show</h2>
          <p className="text-sm text-muted-foreground">
            Publishes, deadlines, and campaign marks for this day.
          </p>
        </div>
        <DayRun iso={iso} />
      </section>

      <section className="mb-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl">Your work</h2>
              <p className="text-sm text-muted-foreground">
                Switch “Working as” in the header to see another person’s desk.
              </p>
            </div>
            <Link href="/work" className="text-sm underline-offset-2 hover:underline">
              Full board
            </Link>
          </div>
          <ul className="mt-4 grid gap-2">
            {mine.tasks.length === 0 && mine.deliverables.length === 0 && (
              <li className="text-sm text-muted-foreground">
                Nothing open under your name. Either you are clear, or work is
                sitting unassigned.
              </li>
            )}
            {mine.tasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm">
                <span>{t.title}</span>
                <StatusBadge kind="task" value={t.status} />
              </li>
            ))}
            {mine.deliverables.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm">
                <span>
                  {d.title}
                  <span className="text-muted-foreground"> · {campaign(state, d.campaignId)?.name}</span>
                </span>
                <StatusBadge kind="deliverable" value={d.status} />
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-heading text-2xl">Close of day</h2>
          {todayRecap ? (
            <div className="mt-3 grid gap-2 text-sm">
              <p className="text-muted-foreground">Already written.</p>
              <Link
                href={`/recaps/${todayRecap.id}`}
                className="font-medium underline-offset-2 hover:underline"
              >
                {todayRecap.title}
              </Link>
              <p>{todayRecap.shipped}</p>
            </div>
          ) : (
            <div className="mt-3 grid gap-3">
              <p className="text-sm text-muted-foreground">
                Before you leave, write what shipped, what’s next, and what is
                stuck. The whole studio reads this in the morning.
              </p>
              <Button
                onClick={() => {
                  setKind("recap");
                  setComposer(true);
                }}
              >
                Write today’s recap
              </Button>
            </div>
          )}
          <Link
            href="/recaps"
            className="mt-4 inline-block text-sm underline-offset-2 hover:underline"
          >
            All recaps
          </Link>
        </div>
      </section>

      <StudioGantt />
      <Composer open={composer} onOpenChange={setComposer} defaultKind={kind} />
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-heading mt-1 text-4xl">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
