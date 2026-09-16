"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { PersonChip } from "@/components/person-chip";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Composer } from "@/components/composer";
import { fieldControl } from "@/components/field";
import { formatShort, isPast, todayISO } from "@/lib/dates";
import { campaign, client } from "@/lib/selectors";
import { useStudio } from "@/lib/store";
import { TASK_STATUSES, type TaskStatus } from "@/lib/types";
import { taskStatusLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";

export default function WorkPage() {
  const { state, setTaskStatus } = useStudio();
  const [mine, setMine] = useState(false);
  const [open, setOpen] = useState(false);
  const today = todayISO();

  const columns = useMemo(() => {
    return TASK_STATUSES.map((status) => ({
      status,
      items: state.tasks.filter((t) => {
        if (t.status !== status) return false;
        if (mine && t.assigneeId !== state.currentUserId) return false;
        return true;
      }),
    }));
  }, [state.tasks, state.currentUserId, mine]);

  return (
    <div>
      <PageHeader
        kicker="Work"
        title="The board"
        description="Move work as it actually moves. Blocked stays visible so nobody loses it in Slack."
        actions={
          <>
            <Button
              variant={mine ? "default" : "outline"}
              onClick={() => setMine((v) => !v)}
            >
              {mine ? "Showing mine" : "Show mine"}
            </Button>
            <Button onClick={() => setOpen(true)}>Add task</Button>
          </>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => (
          <section key={col.status} className="rounded-xl bg-muted/50 p-3">
            <h2 className="mb-3 flex items-center justify-between text-sm font-medium">
              {taskStatusLabel[col.status]}
              <span className="text-muted-foreground">{col.items.length}</span>
            </h2>
            <div className="grid gap-2">
              {col.items.map((t) => (
                <article key={t.id} className="rounded-lg border bg-card p-3 shadow-sm">
                  <p className="font-medium">{t.title}</p>
                  {t.details && (
                    <p className="mt-1 text-xs text-muted-foreground">{t.details}</p>
                  )}
                  <p
                    className={cn(
                      "mt-2 text-xs",
                      isPast(t.dueDate, today) && t.status !== "done"
                        ? "text-rose-700"
                        : "text-muted-foreground"
                    )}
                  >
                    Due {formatShort(t.dueDate)}
                    {client(state, t.clientId)
                      ? ` · ${client(state, t.clientId)?.name}`
                      : ""}
                    {campaign(state, t.campaignId)
                      ? ` · ${campaign(state, t.campaignId)?.name}`
                      : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge kind="priority" value={t.priority} />
                    <PersonChip state={state} id={t.assigneeId} className="text-xs" />
                  </div>
                  <select
                    className={cn(fieldControl, "mt-2")}
                    value={t.status}
                    onChange={(e) =>
                      setTaskStatus(t.id, e.target.value as TaskStatus)
                    }
                  >
                    {TASK_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {taskStatusLabel[s]}
                      </option>
                    ))}
                  </select>
                </article>
              ))}
              {col.items.length === 0 && (
                <p className="px-1 text-xs text-muted-foreground">Empty</p>
              )}
            </div>
          </section>
        ))}
      </div>
      <Composer open={open} onOpenChange={setOpen} defaultKind="task" />
    </div>
  );
}
