"use client";

import Link from "next/link";
import { useState } from "react";
import { Composer } from "@/components/composer";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { formatShort } from "@/lib/dates";
import { useStudio } from "@/lib/store";

export default function CompaniesPage() {
  const { state } = useStudio();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <PageHeader
        kicker="Onboarded"
        title="Companies"
        description="Open a company for deliverables, timelines, publish dates, and invoices."
        actions={<Button onClick={() => setOpen(true)}>Add company</Button>}
      />
      <div className="grid gap-4">
        {state.companies.map((c) => {
          const projects = state.projects.filter(
            (p) => p.companyId === c.id && p.current
          );
          const nextPub = state.deliverables
            .filter((d) => d.companyId === c.id && !d.done)
            .sort((a, b) => a.publishDate.localeCompare(b.publishDate))[0];
          const nextInv = state.invoices
            .filter((i) => i.companyId === c.id && !i.paid)
            .sort((a, b) => a.date.localeCompare(b.date))[0];
          return (
            <Link
              key={c.id}
              href={`/companies/${c.id}`}
              className="rounded-3xl border bg-card p-6 transition hover:border-foreground/15"
            >
              <h2 className="font-heading text-3xl">{c.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {c.contact} · onboarded {formatShort(c.onboarded)}
              </p>
              <p className="mt-4 text-sm">
                {projects.map((p) => p.name).join(" · ") || "No current project"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {nextPub
                  ? `Next publish ${formatShort(nextPub.publishDate)}`
                  : "No publish dated"}
                {" · "}
                {nextInv
                  ? `Next invoice ${formatShort(nextInv.date)}`
                  : "No invoice dated"}
              </p>
            </Link>
          );
        })}
      </div>
      <Composer open={open} onOpenChange={setOpen} defaultKind="company" />
    </div>
  );
}
