"use client";

import Link from "next/link";
import { useState } from "react";
import { Composer } from "@/components/composer";
import { PageHeader } from "@/components/page-header";
import { PersonChip } from "@/components/person-chip";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { formatShort } from "@/lib/dates";
import { recapTypeLabel } from "@/lib/labels";
import { campaign, client } from "@/lib/selectors";
import { useStudio } from "@/lib/store";
import { RECAP_TYPES, type RecapType } from "@/lib/types";

export default function RecapsPage() {
  const { state } = useStudio();
  const [type, setType] = useState<RecapType | "all">("all");
  const [open, setOpen] = useState(false);
  const list = state.recaps
    .filter((r) => type === "all" || r.type === type)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <PageHeader
        kicker="Recaps"
        title="What happened"
        description="Daily closes, weekly studio notes, campaign wrap-ups, and client meetings. Write them here so they are not trapped in someone’s head."
        actions={<Button onClick={() => setOpen(true)}>Write a recap</Button>}
      />
      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={type === "all" ? "default" : "outline"}
          onClick={() => setType("all")}
        >
          All
        </Button>
        {RECAP_TYPES.map((t) => (
          <Button
            key={t}
            size="sm"
            variant={type === t ? "default" : "outline"}
            onClick={() => setType(t)}
          >
            {recapTypeLabel[t]}
          </Button>
        ))}
      </div>
      <div className="grid gap-3">
        {list.map((r) => (
          <Link
            key={r.id}
            href={`/recaps/${r.id}`}
            className="rounded-xl border bg-card p-4 hover:border-foreground/20"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-heading text-xl">{r.title}</h2>
              <StatusBadge kind="recap" value={r.type} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatShort(r.date)}
              {client(state, r.clientId) ? ` · ${client(state, r.clientId)?.name}` : ""}
              {campaign(state, r.campaignId)
                ? ` · ${campaign(state, r.campaignId)?.name}`
                : ""}
            </p>
            <p className="mt-2 line-clamp-2 text-sm">
              {r.shipped || r.notes || "Open for the full close."}
            </p>
            <div className="mt-2">
              <PersonChip state={state} id={r.authorId} className="text-xs" />
            </div>
          </Link>
        ))}
      </div>
      <Composer open={open} onOpenChange={setOpen} defaultKind="recap" />
    </div>
  );
}
