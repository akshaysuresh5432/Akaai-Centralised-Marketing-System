"use client";

import Link from "next/link";
import { useState } from "react";
import { Composer } from "@/components/composer";
import { PageHeader } from "@/components/page-header";
import { PersonChip } from "@/components/person-chip";
import { StatusBadge } from "@/components/status-badge";
import { StudioGantt } from "@/components/studio-gantt";
import { Button } from "@/components/ui/button";
import { formatShort } from "@/lib/dates";
import { campaignStatusLabel } from "@/lib/labels";
import { client, person } from "@/lib/selectors";
import { useStudio } from "@/lib/store";
import { CAMPAIGN_STATUSES, type CampaignStatus } from "@/lib/types";

export default function CampaignsPage() {
  const { state } = useStudio();
  const [filter, setFilter] = useState<CampaignStatus | "all">("all");
  const [open, setOpen] = useState(false);
  const list = state.campaigns.filter(
    (c) => filter === "all" || c.status === filter
  );

  return (
    <div>
      <PageHeader
        kicker="Campaigns"
        title="What we are running"
        description="Every live, planned, and always-on campaign. Open one for the timeline, assets, and recaps."
        actions={<Button onClick={() => setOpen(true)}>New campaign</Button>}
      />
      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        {CAMPAIGN_STATUSES.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s)}
          >
            {campaignStatusLabel[s]}
          </Button>
        ))}
      </div>
      <div className="mb-8 grid gap-4">
        {list.length === 0 && (
          <p className="text-sm text-muted-foreground">No campaigns in this view.</p>
        )}
        {list.map((c) => {
          const cl = client(state, c.clientId);
          const owner = person(state, c.ownerId);
          const remaining = state.milestones.filter(
            (m) => m.campaignId === c.id && !m.done
          ).length;
          return (
            <Link
              key={c.id}
              href={`/campaigns/${c.id}`}
              className="rounded-xl border bg-card p-5 shadow-sm transition hover:border-foreground/20"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{cl?.name}</p>
                  <h2 className="font-heading text-2xl">{c.name}</h2>
                </div>
                <StatusBadge kind="campaign" value={c.status} />
              </div>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                {c.objective}
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <span>
                  {formatShort(c.startDate)} – {formatShort(c.endDate)}
                </span>
                <PersonChip state={state} id={owner?.id} className="text-sm" />
                <span className="text-muted-foreground">
                  {remaining} open milestone{remaining === 1 ? "" : "s"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {c.channels.map((ch) => (
                  <span key={ch} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {ch}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
      <StudioGantt />
      <Composer open={open} onOpenChange={setOpen} defaultKind="campaign" />
    </div>
  );
}
