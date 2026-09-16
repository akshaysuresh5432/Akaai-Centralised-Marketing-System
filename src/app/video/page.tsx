"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Composer } from "@/components/composer";
import { PageHeader } from "@/components/page-header";
import { PersonChip } from "@/components/person-chip";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { formatShort } from "@/lib/dates";
import { videoStatusLabel } from "@/lib/labels";
import { campaign, client, person } from "@/lib/selectors";
import { useStudio } from "@/lib/store";
import { VIDEO_STATUSES, type VideoStatus } from "@/lib/types";

export default function VideoDeskPage() {
  const { state } = useStudio();
  const me = person(state, state.currentUserId);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"mine" | "post" | "all">("mine");

  const list = useMemo(() => {
    const jobs = state.videoJobs ?? [];
    return jobs.filter((j) => {
      if (filter === "mine") {
        return j.editorId === state.currentUserId || j.posterId === state.currentUserId;
      }
      if (filter === "post") {
        return ["final-ready", "ready-to-post"].includes(j.status);
      }
      return true;
    });
  }, [state.videoJobs, filter, state.currentUserId]);

  const jobs = state.videoJobs ?? [];

  const editorJobs = jobs.filter(
    (j) =>
      j.editorId === state.currentUserId &&
      ["need-files", "with-editor", "in-edit"].includes(j.status)
  );
  const posterJobs = jobs.filter(
    (j) =>
      j.posterId === state.currentUserId &&
      ["final-ready", "ready-to-post"].includes(j.status)
  );

  return (
    <div>
      <PageHeader
        kicker="Video desk"
        title="Footage in, cut out, ready to post"
        description="Upload raw files for the editor. The editor downloads, cuts, and puts the final back. Posting then downloads it for Instagram, TikTok, and the rest."
        actions={<Button onClick={() => setOpen(true)}>New video job</Button>}
      />

      <div className="mb-6 grid gap-3 md:grid-cols-2">
        <Link
          href={editorJobs[0] ? `/video/${editorJobs[0].id}` : "/video"}
          className="rounded-2xl border bg-card p-5 shadow-sm"
        >
          <p className="text-sm text-muted-foreground">For the editor</p>
          <p className="font-heading mt-1 text-4xl">{editorJobs.length}</p>
          <p className="mt-1 text-sm">
            {me?.role === "Video editor"
              ? "Jobs waiting on you to download or cut."
              : "Switch Working as to the video editor to see their queue."}
          </p>
        </Link>
        <Link
          href={posterJobs[0] ? `/video/${posterJobs[0].id}` : "/video"}
          className="rounded-2xl border bg-card p-5 shadow-sm"
        >
          <p className="text-sm text-muted-foreground">For posting & scheduling</p>
          <p className="font-heading mt-1 text-4xl">{posterJobs.length}</p>
          <p className="mt-1 text-sm">
            Finals ready to download and put on Instagram and other channels.
          </p>
        </Link>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={filter === "mine" ? "default" : "outline"}
          onClick={() => setFilter("mine")}
        >
          My queue
        </Button>
        <Button
          size="sm"
          variant={filter === "post" ? "default" : "outline"}
          onClick={() => setFilter("post")}
        >
          Ready to post
        </Button>
        <Button
          size="sm"
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All jobs
        </Button>
      </div>

      <div className="grid gap-3">
        {list.length === 0 && (
          <p className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">
            Nothing in this view. Start a video job, or switch Working as to Aisha
            (editor) or Sam (posting).
          </p>
        )}
        {list.map((j) => (
          <Link
            key={j.id}
            href={`/video/${j.id}`}
            className="rounded-2xl border bg-card p-5 shadow-sm transition hover:border-foreground/20"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  {client(state, j.clientId)?.name} ·{" "}
                  {campaign(state, j.campaignId)?.name}
                </p>
                <h2 className="font-heading text-2xl">{j.title}</h2>
              </div>
              <StatusBadge kind="video" value={j.status} />
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {j.brief}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <span>Due {formatShort(j.dueDate)}</span>
              <span>
                Editor <PersonChip state={state} id={j.editorId} className="text-sm" />
              </span>
              <span>
                Posts <PersonChip state={state} id={j.posterId} className="text-sm" />
              </span>
              <span className="text-muted-foreground">
                {j.sourceFiles.length} source · {j.finalFiles.length} final
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {j.platforms.map((p) => (
                <span key={p} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                  {p}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {videoStatusLabel[j.status as VideoStatus]}
              {VIDEO_STATUSES.indexOf(j.status) < 3
                ? " · Editor downloads source, then uploads the cut."
                : " · Poster downloads the final for scheduling."}
            </p>
          </Link>
        ))}
      </div>
      <Composer open={open} onOpenChange={setOpen} defaultKind="video" />
    </div>
  );
}
