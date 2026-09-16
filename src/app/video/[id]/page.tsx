"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FileBin } from "@/components/file-bin";
import { EmptyState, PageHeader } from "@/components/page-header";
import { PersonChip } from "@/components/person-chip";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { fieldControl } from "@/components/field";
import { formatShort } from "@/lib/dates";
import { videoStatusLabel } from "@/lib/labels";
import { campaign, client } from "@/lib/selectors";
import { useStudio } from "@/lib/store";
import { VIDEO_STATUSES, type VideoStatus } from "@/lib/types";

const steps: { status: VideoStatus; who: string }[] = [
  { status: "need-files", who: "Anyone: upload raw footage" },
  { status: "with-editor", who: "Editor: download and start the cut" },
  { status: "in-edit", who: "Editor: working in Premiere / Resolve" },
  { status: "final-ready", who: "Editor: final is back on the desk" },
  { status: "ready-to-post", who: "Posting: download for Instagram and others" },
  { status: "posted", who: "It is live" },
];

export default function VideoJobPage() {
  const { id } = useParams<{ id: string }>();
  const { state, setVideoJobStatus } = useStudio();
  const job = (state.videoJobs ?? []).find((j) => j.id === id);
  if (!job) {
    return (
      <EmptyState
        title="Video job missing"
        body="It may have been removed. Go back to the video desk."
      />
    );
  }
  const cl = client(state, job.clientId);
  const camp = campaign(state, job.campaignId);

  return (
    <div>
      <PageHeader
        kicker="Video job"
        title={job.title}
        description={job.brief}
        actions={
          <Link href="/video" className="text-sm underline-offset-2 hover:underline">
            All video jobs
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge kind="video" value={job.status} />
        <span className="text-sm">Due {formatShort(job.dueDate)}</span>
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

      <ol className="mb-8 grid gap-2 md:grid-cols-6">
        {steps.map((step, i) => {
          const active = VIDEO_STATUSES.indexOf(job.status) >= i;
          return (
            <li
              key={step.status}
              className={
                active
                  ? "rounded-xl bg-primary px-3 py-3 text-primary-foreground"
                  : "rounded-xl bg-muted px-3 py-3 text-muted-foreground"
              }
            >
              <p className="text-xs">{i + 1}</p>
              <p className="text-sm font-medium">{videoStatusLabel[step.status]}</p>
              <p className="mt-1 text-[11px] opacity-80">{step.who}</p>
            </li>
          );
        })}
      </ol>

      <div className="mb-8 grid gap-4 rounded-2xl border bg-card p-5 md:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">Editor</p>
          <PersonChip state={state} id={job.editorId} />
          <p className="mt-1 text-xs text-muted-foreground">
            Downloads footage, uploads the finished cut.
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Posting & scheduling</p>
          <PersonChip state={state} id={job.posterId} />
          <p className="mt-1 text-xs text-muted-foreground">
            Downloads the final for Instagram, TikTok, YouTube, and the rest.
          </p>
        </div>
        <label className="grid gap-1.5 text-sm">
          <span className="text-muted-foreground">Move the job</span>
          <select
            className={fieldControl}
            value={job.status}
            onChange={(e) =>
              setVideoJobStatus(job.id, e.target.value as VideoStatus)
            }
          >
            {VIDEO_STATUSES.map((s) => (
              <option key={s} value={s}>
                {videoStatusLabel[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {job.platforms.map((p) => (
          <span key={p} className="rounded-full bg-muted px-3 py-1 text-sm">
            {p}
          </span>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <FileBin
          job={job}
          kind="source"
          title="1. Raw files for the editor"
          hint="Drop camera files, voice, music, and stills. The editor downloads these to cut."
        />
        <FileBin
          job={job}
          kind="final"
          title="2. Finished video"
          hint="Editor uploads the export here. Posting downloads it to schedule on every channel."
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => setVideoJobStatus(job.id, "with-editor")}
        >
          Hand to editor
        </Button>
        <Button
          variant="outline"
          onClick={() => setVideoJobStatus(job.id, "in-edit")}
        >
          Mark in edit
        </Button>
        <Button
          variant="outline"
          onClick={() => setVideoJobStatus(job.id, "ready-to-post")}
        >
          Ready for posting
        </Button>
        <Button onClick={() => setVideoJobStatus(job.id, "posted")}>
          Mark posted
        </Button>
      </div>
    </div>
  );
}
