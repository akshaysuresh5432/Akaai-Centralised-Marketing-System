"use client";

import { useMemo, useState } from "react";
import { DayRun } from "@/components/day-run";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  addDays,
  formatShort,
  formatWeekday,
  monthMatrix,
  shiftMonth,
  startOfMonth,
  todayISO,
  weekDays,
} from "@/lib/dates";
import { dayDeliverables, dayMilestones, dayTasks } from "@/lib/selectors";
import { useStudio } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const { state } = useStudio();
  const today = todayISO();
  const [cursor, setCursor] = useState(startOfMonth(today));
  const [selected, setSelected] = useState(today);
  const [mode, setMode] = useState<"month" | "week">("month");
  const weeks = useMemo(() => monthMatrix(cursor), [cursor]);
  const week = weekDays(selected);

  const count = (iso: string) =>
    dayDeliverables(state, iso).length +
    dayTasks(state, iso).length +
    dayMilestones(state, iso).length;

  return (
    <div>
      <PageHeader
        kicker="Calendar"
        title="What happens, and when"
        description="Publishes, internal deadlines, and campaign milestones on one calendar. Pick a day to see the run of show."
        actions={
          <>
            <Button
              variant={mode === "month" ? "default" : "outline"}
              onClick={() => setMode("month")}
            >
              Month
            </Button>
            <Button
              variant={mode === "week" ? "default" : "outline"}
              onClick={() => setMode("week")}
            >
              Week
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCursor(startOfMonth(today));
                setSelected(today);
              }}
            >
              Today
            </Button>
          </>
        }
      />

      {mode === "month" ? (
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
      ) : (
        <div className="mb-4 flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelected(addDays(selected, -7))}>
            Previous week
          </Button>
          <p className="font-heading text-2xl">
            {formatShort(week[0])} – {formatShort(week[6])}
          </p>
          <Button variant="outline" onClick={() => setSelected(addDays(selected, 7))}>
            Next week
          </Button>
        </div>
      )}

      {mode === "month" && (
        <div className="mb-8 overflow-x-auto rounded-xl border bg-card">
          <div className="grid grid-cols-7 border-b text-xs text-muted-foreground">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="px-2 py-2 text-center">
                {d}
              </div>
            ))}
          </div>
          {weeks.map((weekRow) => (
            <div key={weekRow[0]} className="grid grid-cols-7">
              {weekRow.map((iso) => {
                const inMonth = iso.slice(0, 7) === cursor.slice(0, 7);
                const n = count(iso);
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => setSelected(iso)}
                    className={cn(
                      "min-h-20 border-t border-r p-2 text-left last:border-r-0",
                      !inMonth && "bg-muted/40 text-muted-foreground",
                      iso === selected && "bg-primary/10",
                      iso === today && "font-semibold"
                    )}
                  >
                    <span className="text-sm">{Number(iso.slice(8))}</span>
                    {n > 0 && (
                      <span className="mt-2 flex gap-1">
                        {Array.from({ length: Math.min(n, 4) }).map((_, i) => (
                          <span
                            key={i}
                            className="size-1.5 rounded-full bg-primary"
                          />
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {mode === "week" && (
        <div className="mb-8 grid gap-2 md:grid-cols-7">
          {week.map((iso) => (
            <button
              key={iso}
              type="button"
              onClick={() => setSelected(iso)}
              className={cn(
                "rounded-xl border p-3 text-left",
                iso === selected && "border-primary bg-primary/5",
                iso === today && "ring-1 ring-foreground/20"
              )}
            >
              <p className="text-xs text-muted-foreground">{formatWeekday(iso)}</p>
              <p className="font-heading text-2xl">{Number(iso.slice(8))}</p>
              <p className="text-xs text-muted-foreground">{count(iso)} items</p>
            </button>
          ))}
        </div>
      )}

      <h2 className="font-heading mb-4 text-2xl">
        {new Date(selected + "T12:00:00").toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </h2>
      <DayRun iso={selected} />
    </div>
  );
}
