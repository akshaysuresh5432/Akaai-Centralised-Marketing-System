"use client";

import Link from "next/link";
import { daysBetween, formatShort, todayISO } from "@/lib/dates";
import { client } from "@/lib/selectors";
import { useStudio } from "@/lib/store";
import { cn } from "@/lib/utils";

export function StudioGantt() {
  const { state } = useStudio();
  const today = todayISO();
  const starts = state.campaigns.map((c) => c.startDate).sort();
  const ends = state.campaigns.map((c) => c.endDate).sort();
  const from = starts[0] ?? today;
  const to = ends[ends.length - 1] ?? today;
  const span = Math.max(daysBetween(from, to), 1);

  return (
    <div className="overflow-x-auto rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-heading text-xl">Campaign timeline</h2>
        <p className="text-xs text-muted-foreground">
          {formatShort(from)} — {formatShort(to)}
        </p>
      </div>
      <div className="grid min-w-[640px] gap-3">
        {state.campaigns.map((c) => {
          const left = (daysBetween(from, c.startDate) / span) * 100;
          const width = (daysBetween(c.startDate, c.endDate) / span) * 100;
          const now = (daysBetween(from, today) / span) * 100;
          const cl = client(state, c.clientId);
          return (
            <Link
              key={c.id}
              href={`/campaigns/${c.id}`}
              className="grid grid-cols-[9rem_1fr] items-center gap-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{c.name}</p>
                <p className="truncate text-xs text-muted-foreground">{cl?.name}</p>
              </div>
              <div className="relative h-8 rounded-md bg-muted">
                <span
                  className="absolute top-0 bottom-0 w-px bg-foreground/40"
                  style={{ left: `${Math.min(Math.max(now, 0), 100)}%` }}
                />
                <span
                  className={cn(
                    "absolute top-1 bottom-1 rounded-sm",
                    c.status === "planning" && "bg-amber-400/80",
                    c.status === "in-market" && "bg-emerald-500/80",
                    c.status === "always-on" && "bg-sky-500/70",
                    c.status === "paused" && "bg-stone-400",
                    c.status === "wrapped" && "bg-violet-400/80"
                  )}
                  style={{
                    left: `${Math.max(left, 0)}%`,
                    width: `${Math.max(width, 3)}%`,
                  }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
