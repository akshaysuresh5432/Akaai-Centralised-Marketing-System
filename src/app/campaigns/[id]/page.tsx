"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Composer } from "@/components/composer";
import { EmptyState, PageHeader } from "@/components/page-header";
import { PersonChip } from "@/components/person-chip";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { fieldControl } from "@/components/field";
import { daysBetween, formatShort, todayISO } from "@/lib/dates";
import { client, person } from "@/lib/selectors";
import { useStudio } from "@/lib/store";
import { DELIVERABLE_STATUSES, type ComposerKind } from "@/lib/types";
import { deliverableStatusLabel } from "@/lib/labels";

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state, toggleMilestone, setDeliverableStatus } = useStudio();
  const campaign = state.campaigns.find((c) => c.id === id);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<ComposerKind>("deliverable");

  if (!campaign) {
    return <EmptyState title="Campaign missing" body="It may have been removed from this desk." />;
  }

  const cl = client(state, campaign.clientId);
  const owner = person(state, campaign.ownerId);
  const marks = state.milestones
    .filter((m) => m.campaignId === campaign.id)
    .sort((a, b) => a.date.localeCompare(b.date));
  const assets = state.deliverables
    .filter((d) => d.campaignId === campaign.id)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? ""));
  const tasks = state.tasks.filter((t) => t.campaignId === campaign.id);
  const recaps = state.recaps.filter((r) => r.campaignId === campaign.id);
  const span = Math.max(daysBetween(campaign.startDate, campaign.endDate), 1);
  const today = todayISO();

  return (
    <div>
      <PageHeader
        kicker={cl?.name}
        title={campaign.name}
        description={campaign.objective}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setKind("milestone");
                setOpen(true);
              }}
            >
              Add milestone
            </Button>
            <Button
              onClick={() => {
                setKind("deliverable");
                setOpen(true);
              }}
            >
              Add asset
            </Button>
          </>
        }
      />

      <div className="mb-8 flex flex-wrap gap-3">
        <StatusBadge kind="campaign" value={campaign.status} />
        <span className="text-sm">
          {formatShort(campaign.startDate)} – {formatShort(campaign.endDate)}
        </span>
        <PersonChip state={state} id={owner?.id} />
        <span className="text-sm text-muted-foreground">{campaign.budget}</span>
      </div>

      <section className="mb-8 rounded-xl border bg-card p-5">
        <h2 className="font-heading text-2xl">Timeline</h2>
        <p className="mb-4 text-sm text-muted-foreground">{campaign.kpis}</p>
        <div className="relative ml-2 border-l pl-6">
          {marks.map((m) => {
            const pct = Math.min(
              100,
              Math.max(0, (daysBetween(campaign.startDate, m.date) / span) * 100)
            );
            return (
              <label
                key={m.id}
                className="relative mb-5 flex cursor-pointer items-start gap-3 last:mb-0"
              >
                <span
                  className="absolute -left-[31px] top-1 size-3 rounded-full border-2 border-background"
                  style={{
                    background: m.done
                      ? "var(--color-primary)"
                      : m.date < today
                        ? "#e11d48"
                        : "#a8a29e",
                  }}
                  title={`${pct.toFixed(0)}% through the flight`}
                />
                <Checkbox
                  checked={m.done}
                  onCheckedChange={() => toggleMilestone(m.id)}
                />
                <span>
                  <span className="block font-medium">{m.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatShort(m.date)}
                    {m.date === today ? " · today" : ""}
                  </span>
                </span>
              </label>
            );
          })}
          {marks.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No milestones yet. Add the dates the client will actually feel.
            </p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-1">
          {campaign.channels.map((ch) => (
            <span key={ch} className="rounded-full bg-muted px-2 py-0.5 text-xs">
              {ch}
            </span>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-heading mb-3 text-2xl">Assets & publishes</h2>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">When</th>
                <th className="px-3 py-2 font-medium">Asset</th>
                <th className="px-3 py-2 font-medium">Channel</th>
                <th className="px-3 py-2 font-medium">Owner</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="px-3 py-2 whitespace-nowrap">
                    {formatShort(d.date)} {d.time}
                  </td>
                  <td className="px-3 py-2">
                    <p className="font-medium">{d.title}</p>
                    <p className="text-xs text-muted-foreground">{d.type}</p>
                  </td>
                  <td className="px-3 py-2">{d.channel}</td>
                  <td className="px-3 py-2">
                    <PersonChip state={state} id={d.assigneeId} className="text-sm" />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      className={fieldControl}
                      value={d.status}
                      onChange={(e) =>
                        setDeliverableStatus(
                          d.id,
                          e.target.value as (typeof DELIVERABLE_STATUSES)[number]
                        )
                      }
                    >
                      {DELIVERABLE_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {deliverableStatusLabel[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {assets.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No assets on this campaign yet.</p>
          )}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-heading mb-3 text-2xl">Work</h2>
          <ul className="grid gap-2">
            {tasks.map((t) => (
              <li key={t.id} className="rounded-xl border bg-card p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{t.title}</p>
                  <StatusBadge kind="task" value={t.status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Due {formatShort(t.dueDate)}
                </p>
              </li>
            ))}
            {tasks.length === 0 && (
              <p className="text-sm text-muted-foreground">No tasks tagged to this campaign.</p>
            )}
          </ul>
        </section>
        <section>
          <h2 className="font-heading mb-3 text-2xl">Recaps</h2>
          <ul className="grid gap-2">
            {recaps.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/recaps/${r.id}`}
                  className="block rounded-xl border bg-card p-3 hover:border-foreground/20"
                >
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{formatShort(r.date)}</p>
                </Link>
              </li>
            ))}
            {recaps.length === 0 && (
              <p className="text-sm text-muted-foreground">No recaps filed against this flight.</p>
            )}
          </ul>
        </section>
      </div>
      <Composer open={open} onOpenChange={setOpen} defaultKind={kind} />
    </div>
  );
}
