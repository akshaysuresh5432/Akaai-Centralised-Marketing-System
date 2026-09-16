"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { PersonChip } from "@/components/person-chip";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { fieldControl } from "@/components/field";
import { formatShort } from "@/lib/dates";
import { campaign, client } from "@/lib/selectors";
import { useStudio } from "@/lib/store";
import { DELIVERABLE_STATUSES } from "@/lib/types";
import { deliverableStatusLabel } from "@/lib/labels";

export default function ApprovalsPage() {
  const { state, setDeliverableStatus } = useStudio();
  const queue = state.deliverables.filter((d) =>
    ["internal-review", "client-review"].includes(d.status)
  );

  return (
    <div>
      <PageHeader
        kicker="Approvals"
        title="Waiting on a yes"
        description="Nothing ships from review without a status change. Internal review is us. Client review is them."
      />
      {queue.length === 0 && (
        <p className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
          Queue is clear. When an asset is ready, move it to Internal review or
          Client review from the campaign.
        </p>
      )}
      <div className="grid gap-3">
        {queue.map((d) => (
          <article key={d.id} className="rounded-xl border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  {client(state, d.clientId)?.name}
                </p>
                <h2 className="font-heading text-xl">{d.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {d.channel} · {formatShort(d.date)} {d.time} ·{" "}
                  <Link
                    href={`/campaigns/${d.campaignId}`}
                    className="underline-offset-2 hover:underline"
                  >
                    {campaign(state, d.campaignId)?.name}
                  </Link>
                </p>
                {d.notes && <p className="mt-2 text-sm">{d.notes}</p>}
              </div>
              <StatusBadge kind="deliverable" value={d.status} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <PersonChip state={state} id={d.assigneeId} />
              <select
                className={fieldControl + " max-w-56"}
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
              <Button
                size="sm"
                onClick={() => setDeliverableStatus(d.id, "approved")}
              >
                Approve
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
