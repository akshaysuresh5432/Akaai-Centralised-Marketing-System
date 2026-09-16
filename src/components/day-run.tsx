"use client";

import Link from "next/link";
import { PersonChip } from "@/components/person-chip";
import { StatusBadge } from "@/components/status-badge";
import { useStudio } from "@/lib/store";
import {
  campaign,
  client,
  dayDeliverables,
  dayMilestones,
  dayTasks,
} from "@/lib/selectors";
import { cn } from "@/lib/utils";

export function DayRun({ iso, compact }: { iso: string; compact?: boolean }) {
  const { state } = useStudio();
  const publishes = dayDeliverables(state, iso);
  const tasks = dayTasks(state, iso);
  const marks = dayMilestones(state, iso);

  if (!publishes.length && !tasks.length && !marks.length) {
    return (
      <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
        Nothing on this day yet. Add a publish, task, or milestone so the floor
        knows the run of show.
      </p>
    );
  }

  return (
    <div className={cn("grid gap-6", compact ? "" : "lg:grid-cols-3")}>
      <section className="grid gap-2">
        <h3 className="font-heading text-lg">Publishing</h3>
        {publishes.length === 0 && (
          <p className="text-sm text-muted-foreground">No goes-live today.</p>
        )}
        {publishes.map((d) => (
          <article key={d.id} className="rounded-xl border bg-card p-3 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{d.title}</p>
              <span className="shrink-0 text-xs text-muted-foreground">
                {d.time ?? "—"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {d.channel} · {d.type} · {campaign(state, d.campaignId)?.name}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge kind="deliverable" value={d.status} />
              <PersonChip state={state} id={d.assigneeId} className="text-xs" />
            </div>
          </article>
        ))}
      </section>
      <section className="grid gap-2">
        <h3 className="font-heading text-lg">Deadlines</h3>
        {tasks.length === 0 && (
          <p className="text-sm text-muted-foreground">No internal deadlines.</p>
        )}
        {tasks.map((t) => (
          <article key={t.id} className="rounded-xl border bg-card p-3 shadow-sm">
            <p className="font-medium">{t.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {client(state, t.clientId)?.name ?? "Studio"} ·{" "}
              {campaign(state, t.campaignId)?.name ?? "Unattached"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge kind="task" value={t.status} />
              <StatusBadge kind="priority" value={t.priority} />
              <PersonChip state={state} id={t.assigneeId} className="text-xs" />
            </div>
          </article>
        ))}
      </section>
      <section className="grid gap-2">
        <h3 className="font-heading text-lg">Timeline marks</h3>
        {marks.length === 0 && (
          <p className="text-sm text-muted-foreground">No campaign milestones.</p>
        )}
        {marks.map((m) => {
          const camp = campaign(state, m.campaignId);
          return (
            <article key={m.id} className="rounded-xl border bg-card p-3 shadow-sm">
              <p className="font-medium">{m.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {camp ? (
                  <Link href={`/campaigns/${camp.id}`} className="underline-offset-2 hover:underline">
                    {camp.name}
                  </Link>
                ) : (
                  "Campaign"
                )}
                {m.done ? " · done" : " · still open"}
              </p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
