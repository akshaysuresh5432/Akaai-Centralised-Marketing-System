"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { EmptyState, PageHeader } from "@/components/page-header";
import { PersonChip } from "@/components/person-chip";
import { StatusBadge } from "@/components/status-badge";
import { formatShort } from "@/lib/dates";
import { useStudio } from "@/lib/store";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useStudio();
  const client = state.clients.find((c) => c.id === id);
  if (!client) {
    return <EmptyState title="Client missing" body="Not on this desk." />;
  }
  const camps = state.campaigns.filter((c) => c.clientId === client.id);
  const recaps = state.recaps.filter((r) => r.clientId === client.id);
  const tasks = state.tasks.filter(
    (t) => t.clientId === client.id && t.status !== "done"
  );

  return (
    <div>
      <PageHeader
        kicker={client.industry}
        title={client.name}
        description={client.notes}
      />
      <div className="mb-8 flex flex-wrap gap-4 text-sm">
        <StatusBadge kind="client" value={client.status} />
        <span>{client.retainer}</span>
        <span>{client.website}</span>
        <span>
          {client.contactName} · {client.contactEmail}
        </span>
      </div>
      <section className="mb-8">
        <h2 className="font-heading mb-3 text-2xl">Campaigns</h2>
        <div className="grid gap-3">
          {camps.map((c) => (
            <Link
              key={c.id}
              href={`/campaigns/${c.id}`}
              className="rounded-xl border bg-card p-4 hover:border-foreground/20"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{c.name}</p>
                <StatusBadge kind="campaign" value={c.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatShort(c.startDate)} – {formatShort(c.endDate)}
              </p>
            </Link>
          ))}
        </div>
      </section>
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-heading mb-3 text-2xl">Open work</h2>
          <ul className="grid gap-2">
            {tasks.map((t) => (
              <li key={t.id} className="rounded-xl border p-3 text-sm">
                <p className="font-medium">{t.title}</p>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge kind="task" value={t.status} />
                  <PersonChip state={state} id={t.assigneeId} className="text-xs" />
                </div>
              </li>
            ))}
            {tasks.length === 0 && (
              <p className="text-sm text-muted-foreground">No open tasks.</p>
            )}
          </ul>
        </section>
        <section>
          <h2 className="font-heading mb-3 text-2xl">Notes from the floor</h2>
          <ul className="grid gap-2">
            {recaps.map((r) => (
              <li key={r.id}>
                <Link href={`/recaps/${r.id}`} className="block rounded-xl border p-3 hover:border-foreground/20">
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{formatShort(r.date)}</p>
                </Link>
              </li>
            ))}
            {recaps.length === 0 && (
              <p className="text-sm text-muted-foreground">No recaps tagged to this client.</p>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
