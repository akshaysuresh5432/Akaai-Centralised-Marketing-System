"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { EmptyState, PageHeader } from "@/components/page-header";
import { PersonChip } from "@/components/person-chip";
import { StatusBadge } from "@/components/status-badge";
import { formatDay } from "@/lib/dates";
import { campaign, client } from "@/lib/selectors";
import { useStudio } from "@/lib/store";

export default function RecapDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useStudio();
  const recap = state.recaps.find((r) => r.id === id);
  if (!recap) {
    return <EmptyState title="Recap missing" body="It is not on this desk." />;
  }
  const cl = client(state, recap.clientId);
  const camp = campaign(state, recap.campaignId);

  return (
    <div className="max-w-3xl">
      <PageHeader
        kicker="Recap"
        title={recap.title}
        description={formatDay(recap.date)}
      />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge kind="recap" value={recap.type} />
        <PersonChip state={state} id={recap.authorId} />
        {cl && (
          <Link href={`/clients/${cl.id}`} className="text-sm underline-offset-2 hover:underline">
            {cl.name}
          </Link>
        )}
        {camp && (
          <Link
            href={`/campaigns/${camp.id}`}
            className="text-sm underline-offset-2 hover:underline"
          >
            {camp.name}
          </Link>
        )}
      </div>
      <Block title="What shipped" body={recap.shipped} />
      <Block title="What is next" body={recap.next} />
      <Block title="Blockers" body={recap.blockers} />
      <Block title="Notes" body={recap.notes} />
    </div>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <section className="mb-6">
      <h2 className="font-heading text-2xl">{title}</h2>
      <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
        {body.trim() ? body : "Nothing written."}
      </p>
    </section>
  );
}
