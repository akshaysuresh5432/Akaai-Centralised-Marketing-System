"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { PersonChip } from "@/components/person-chip";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  formatShort,
  formatWeekday,
  monthMatrix,
  shiftMonth,
  startOfMonth,
  todayISO,
} from "@/lib/dates";
import { company, reminders } from "@/lib/selectors";
import { useStudio } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const { state } = useStudio();
  const today = todayISO();
  const [cursor, setCursor] = useState(startOfMonth(today));
  const [filter, setFilter] = useState<"all" | "publish" | "invoice" | "mine">(
    "all"
  );
  const weeks = useMemo(() => monthMatrix(cursor), [cursor]);
  const all = reminders(state);
  const list = all.filter((r) => {
    if (filter === "mine") return r.ownerId === state.currentUserId;
    if (filter === "all") return true;
    return r.kind === filter;
  });
  const byDay = (iso: string) => all.filter((r) => r.date === iso);

  return (
    <div>
      <PageHeader
        kicker="Reminders"
        title="Everyone’s calendar"
        description="Publish dates and invoice dates. Switch Working as to see your own reminders."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["publish", "Publish"],
            ["invoice", "Invoice"],
            ["mine", "Mine"],
          ] as const
        ).map(([id, label]) => (
          <Button
            key={id}
            size="sm"
            variant={filter === id ? "default" : "outline"}
            onClick={() => setFilter(id)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <Button variant="outline" onClick={() => setCursor(shiftMonth(cursor, -1))}>
          Previous
        </Button>
        <p className="font-heading text-2xl">
          {new Date(cursor + "T12:00:00").toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>
        <Button variant="outline" onClick={() => setCursor(shiftMonth(cursor, 1))}>
          Next
        </Button>
      </div>

      <div className="mb-10 overflow-hidden rounded-2xl border bg-card">
        <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        {weeks.map((week) => (
          <div key={week[0]} className="grid grid-cols-7 border-t">
            {week.map((iso) => {
              const items = byDay(iso);
              const inMonth = iso.slice(0, 7) === cursor.slice(0, 7);
              return (
                <div
                  key={iso}
                  className={cn(
                    "min-h-[4.5rem] border-r p-1.5 last:border-r-0",
                    !inMonth && "bg-muted/40 text-muted-foreground",
                    iso === today && "bg-primary/5"
                  )}
                >
                  <p className="text-xs">{Number(iso.slice(8))}</p>
                  <div className="mt-1 flex flex-wrap gap-0.5">
                    {items.map((r) => (
                      <span
                        key={r.id}
                        title={r.title}
                        className={
                          r.kind === "invoice"
                            ? "size-1.5 rounded-full bg-amber-500"
                            : "size-1.5 rounded-full bg-sky-500"
                        }
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <h2 className="font-heading mb-3 text-2xl">List</h2>
      <ul className="grid gap-2">
        {list.map((r) => (
          <li key={r.id}>
            <Link
              href={r.href}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3"
            >
              <div>
                <p className="text-xs text-muted-foreground">
                  {formatWeekday(r.date)} {formatShort(r.date)} ·{" "}
                  {company(state, r.companyId)?.name}
                </p>
                <p>{r.title}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge kind="reminder" value={r.kind} />
                <PersonChip state={state} id={r.ownerId} className="text-sm" />
                {r.amount && <span className="text-sm">{r.amount}</span>}
              </div>
            </Link>
          </li>
        ))}
        {list.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing in this view.</p>
        )}
      </ul>
      <p className="mt-6 text-xs text-muted-foreground">
        Blue is publish. Gold is invoice.
      </p>
    </div>
  );
}
