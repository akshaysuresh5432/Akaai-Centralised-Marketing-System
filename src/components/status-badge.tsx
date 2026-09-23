import { Badge } from "@/components/ui/badge";
import { campaignStatusLabel, videoStatusLabel } from "@/lib/labels";
import type { CampaignStatus, VideoStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const tone: Record<string, string> = {
  running: "bg-emerald-100 text-emerald-950",
  planned: "bg-amber-100 text-amber-950",
  done: "bg-stone-200 text-stone-700",
  publish: "bg-sky-100 text-sky-950",
  invoice: "bg-amber-100 text-amber-950",
  "need-files": "bg-stone-200 text-stone-800",
  "with-editor": "bg-sky-100 text-sky-950",
  "in-edit": "bg-amber-100 text-amber-950",
  "final-ready": "bg-violet-100 text-violet-950",
  "ready-to-post": "bg-emerald-100 text-emerald-950",
  posted: "bg-stone-200 text-stone-700",
};

export function StatusBadge({
  value,
  kind,
}: {
  value: string;
  kind: "campaign" | "video" | "reminder";
}) {
  const label =
    kind === "campaign"
      ? campaignStatusLabel[value as CampaignStatus]
      : kind === "video"
        ? videoStatusLabel[value as VideoStatus]
        : value === "publish"
          ? "Publish"
          : "Invoice";
  return (
    <Badge
      variant="secondary"
      className={cn("border-0 font-medium", tone[value] ?? "bg-muted")}
    >
      {label}
    </Badge>
  );
}
