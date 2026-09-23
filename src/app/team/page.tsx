"use client";

import { PageHeader } from "@/components/page-header";
import { PersonChip } from "@/components/person-chip";
import { Button } from "@/components/ui/button";
import { reminders } from "@/lib/selectors";
import { useStudio } from "@/lib/store";

export default function TeamPage() {
  const { state, resetDemo } = useStudio();
  return (
    <div>
      <PageHeader
        kicker="People"
        title="Team"
        description="Reminders sit on each person’s calendar. Use Working as in the header."
      />
      <div className="grid gap-3">
        {state.team.map((p) => {
          const n = reminders(state).filter((r) => r.ownerId === p.id).length;
          return (
            <article key={p.id} className="rounded-2xl border bg-card p-5">
              <PersonChip state={state} id={p.id} className="text-base" />
              <p className="mt-1 text-sm text-muted-foreground">{p.role}</p>
              <p className="mt-2 text-sm">
                {n} open reminder{n === 1 ? "" : "s"}
              </p>
            </article>
          );
        })}
      </div>
      <Button variant="outline" className="mt-8" onClick={resetDemo}>
        Reset sample data
      </Button>
    </div>
  );
}
