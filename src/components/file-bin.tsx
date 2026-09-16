"use client";

import { useState } from "react";
import { Download, Upload } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatBytes } from "@/lib/format";
import { person } from "@/lib/selectors";
import { useStudio } from "@/lib/store";
import type { FileAsset, FileKind, VideoJob } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function FileBin({
  job,
  kind,
  title,
  hint,
}: {
  job: VideoJob;
  kind: FileKind;
  title: string;
  hint: string;
}) {
  const { state, attachFile } = useStudio();
  const [busy, setBusy] = useState(false);
  const [hover, setHover] = useState(false);
  const files = kind === "final" ? job.finalFiles : job.sourceFiles;

  async function uploadList(list: FileList | File[]) {
    const items = Array.from(list);
    if (!items.length) return;
    setBusy(true);
    try {
      for (const file of items) {
        const body = new FormData();
        body.set("file", file);
        body.set("kind", kind);
        body.set("uploadedBy", state.currentUserId);
        const res = await fetch("/api/files", { method: "POST", body });
        if (!res.ok) throw new Error(await res.text());
        const asset = (await res.json()) as FileAsset;
        attachFile(job.id, asset);
      }
      toast.success(
        kind === "final" ? "Final is on the desk" : "Footage is on the desk"
      );
    } catch {
      toast.error("Upload failed. Try a smaller file, or refresh and retry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <h3 className="font-heading text-2xl">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      <label
        className={cn(
          "mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition",
          hover || busy ? "border-primary bg-primary/5" : "border-border"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={(e) => {
          e.preventDefault();
          setHover(false);
          void uploadList(e.dataTransfer.files);
        }}
      >
        <Upload className="mb-2 size-5 text-muted-foreground" />
        <span className="text-sm font-medium">
          {busy ? "Uploading…" : "Drop files here, or click to choose"}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">
          Video, audio, stills — up to 600 MB each
        </span>
        <input
          type="file"
          className="sr-only"
          multiple
          disabled={busy}
          onChange={(e) => {
            if (e.target.files) void uploadList(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      <ul className="mt-4 grid gap-2">
        {files.length === 0 && (
          <li className="text-sm text-muted-foreground">Nothing here yet.</li>
        )}
        {files.map((f) => (
          <li
            key={f.id}
            className="flex items-center justify-between gap-3 rounded-xl bg-muted/60 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{f.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(f.size)} · {person(state, f.uploadedBy)?.name ?? "Team"}
              </p>
            </div>
            <a
              className={buttonVariants({ variant: "outline", size: "sm" })}
              href={`/api/files/${f.id}?name=${encodeURIComponent(f.name)}`}
            >
              <Download />
              Download
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
