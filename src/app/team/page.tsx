"use client";

import { useState } from "react";
import { Composer } from "@/components/composer";
import { PageHeader } from "@/components/page-header";
import { PersonChip } from "@/components/person-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadForPerson } from "@/lib/selectors";
import { useStudio } from "@/lib/store";

export default function TeamPage() {
  const { state, setStudioName, resetDemo } = useStudio();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(state.studioName);

  return (
    <div>
      <PageHeader
        kicker="Team"
        title="Who is on the floor"
        description="Workload is open tasks plus assets that are not live yet. Use Working as in the header so each person sees their own today."
        actions={<Button onClick={() => setOpen(true)}>Add teammate</Button>}
      />
      <div className="mb-8 grid gap-3 md:grid-cols-2">
        {state.team.map((p) => {
          const load = loadForPerson(state, p.id);
          const owned = state.campaigns.filter((c) => c.ownerId === p.id);
          return (
            <article key={p.id} className="rounded-xl border bg-card p-4">
              <PersonChip state={state} id={p.id} className="text-base font-medium" />
              <p className="mt-1 text-sm text-muted-foreground">{p.role}</p>
              <p className="mt-3 text-sm">
                {load} open item{load === 1 ? "" : "s"}
              </p>
              <p className="text-xs text-muted-foreground">
                {owned.length
                  ? `Owns ${owned.map((c) => c.name).join(", ")}`
                  : "No campaign ownership"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{p.email}</p>
            </article>
          );
        })}
      </div>
      <section className="max-w-md rounded-xl border bg-card p-5">
        <h2 className="font-heading text-2xl">Studio name</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          This desk lives in the browser. Rename it to your company.
        </p>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setStudioName(name.trim() || state.studioName);
          }}
        >
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="submit">Save</Button>
        </form>
        <Button variant="outline" className="mt-4" onClick={resetDemo}>
          Restore demo data
        </Button>
      </section>
      <Composer open={open} onOpenChange={setOpen} defaultKind="person" />
    </div>
  );
}
