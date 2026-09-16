"use client";

import Link from "next/link";
import { useState } from "react";
import { Composer } from "@/components/composer";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/lib/store";

export default function ClientsPage() {
  const { state } = useStudio();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <PageHeader
        kicker="Clients"
        title="The companies we market"
        description="Each account is a house: campaigns, brand notes, and who we talk to."
        actions={<Button onClick={() => setOpen(true)}>Add client</Button>}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {state.clients.map((c) => {
          const camps = state.campaigns.filter((camp) => camp.clientId === c.id);
          return (
            <Link
              key={c.id}
              href={`/clients/${c.id}`}
              className="rounded-xl border bg-card p-5 hover:border-foreground/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-2xl">{c.name}</h2>
                  <p className="text-sm text-muted-foreground">{c.industry}</p>
                </div>
                <StatusBadge kind="client" value={c.status} />
              </div>
              <p className="mt-3 text-sm">{c.retainer}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {camps.length} campaign{camps.length === 1 ? "" : "s"} · {c.contactName}
              </p>
            </Link>
          );
        })}
      </div>
      <Composer open={open} onOpenChange={setOpen} defaultKind="client" />
    </div>
  );
}
