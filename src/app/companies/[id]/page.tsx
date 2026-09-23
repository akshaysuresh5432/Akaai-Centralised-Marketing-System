"use client";

import { useParams } from "next/navigation";
import { EmptyState, PageHeader } from "@/components/page-header";
import { PersonChip } from "@/components/person-chip";
import { StatusBadge } from "@/components/status-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatShort } from "@/lib/dates";
import { campaign } from "@/lib/selectors";
import { useStudio } from "@/lib/store";

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state, setDeliverableDone, setInvoicePaid } = useStudio();
  const co = state.companies.find((c) => c.id === id);
  if (!co) {
    return <EmptyState title="Company missing" body="It is not on this desk." />;
  }

  const projects = state.projects.filter((p) => p.companyId === co.id);
  const projectIds = new Set(projects.map((p) => p.id));
  const camps = state.campaigns.filter((c) => projectIds.has(c.projectId));
  const pubs = [...state.deliverables]
    .filter((d) => d.companyId === co.id)
    .sort((a, b) => a.publishDate.localeCompare(b.publishDate));
  const invoices = [...state.invoices]
    .filter((i) => i.companyId === co.id)
    .sort((a, b) => a.date.localeCompare(b.date));
  const timeline = [
    ...pubs.map((d) => ({
      id: d.id,
      date: d.publishDate,
      kind: "publish" as const,
      title: d.title,
      ownerId: d.ownerId,
      extra: campaign(state, d.campaignId)?.name,
    })),
    ...invoices.map((i) => ({
      id: i.id,
      date: i.date,
      kind: "invoice" as const,
      title: i.title,
      ownerId: i.ownerId,
      extra: i.amount,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <PageHeader
        kicker="Company"
        title={co.name}
        description={`${co.contact} · onboarded ${formatShort(co.onboarded)}`}
      />

      <section className="mb-10">
        <h2 className="font-heading mb-3 text-2xl">Campaigns running</h2>
        <div className="flex flex-wrap gap-2">
          {camps.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm"
            >
              {c.name}
              <StatusBadge kind="campaign" value={c.status} />
            </span>
          ))}
          {camps.length === 0 && (
            <p className="text-sm text-muted-foreground">None yet.</p>
          )}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-heading mb-4 text-2xl">Timeline</h2>
        <ol className="relative ml-2 border-l pl-6">
          {timeline.map((item) => (
            <li key={`${item.kind}-${item.id}`} className="mb-6 last:mb-0">
              <span
                className={
                  item.kind === "invoice"
                    ? "absolute -left-[5px] mt-1.5 size-2.5 rounded-full bg-amber-500"
                    : "absolute -left-[5px] mt-1.5 size-2.5 rounded-full bg-sky-500"
                }
              />
              <p className="text-xs text-muted-foreground">
                {formatShort(item.date)} · {item.kind === "invoice" ? "Invoice" : "Publish"}
              </p>
              <p className="text-lg">{item.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {item.extra}
                <PersonChip state={state} id={item.ownerId} className="text-sm" />
              </div>
            </li>
          ))}
          {timeline.length === 0 && (
            <p className="text-sm text-muted-foreground">No dates yet.</p>
          )}
        </ol>
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="font-heading mb-3 text-2xl">Dates to publish</h2>
          <ul className="grid gap-2">
            {pubs.map((d) => (
              <li
                key={d.id}
                className="flex items-start gap-3 rounded-2xl border bg-card px-4 py-3"
              >
                <Checkbox
                  checked={d.done}
                  onCheckedChange={(v) => setDeliverableDone(d.id, Boolean(v))}
                />
                <div className="min-w-0 flex-1">
                  <p className={d.done ? "text-muted-foreground line-through" : ""}>
                    {d.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatShort(d.publishDate)} · {campaign(state, d.campaignId)?.name}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-heading mb-3 text-2xl">Dates to invoice</h2>
          <ul className="grid gap-2">
            {invoices.map((i) => (
              <li
                key={i.id}
                className="flex items-start gap-3 rounded-2xl border bg-card px-4 py-3"
              >
                <Checkbox
                  checked={i.paid}
                  onCheckedChange={(v) => setInvoicePaid(i.id, Boolean(v))}
                />
                <div className="min-w-0 flex-1">
                  <p className={i.paid ? "text-muted-foreground line-through" : ""}>
                    {i.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatShort(i.date)} · {i.amount}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
