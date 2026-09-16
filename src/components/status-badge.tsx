import { Badge } from "@/components/ui/badge";
import {
  campaignStatusLabel,
  clientStatusLabel,
  deliverableStatusLabel,
  priorityLabel,
  recapTypeLabel,
  taskStatusLabel,
  videoStatusLabel,
} from "@/lib/labels";
import type {
  CampaignStatus,
  ClientStatus,
  DeliverableStatus,
  RecapType,
  TaskPriority,
  TaskStatus,
  VideoStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const tone: Record<string, string> = {
  planning: "bg-amber-100 text-amber-950",
  "in-market": "bg-emerald-100 text-emerald-950",
  "always-on": "bg-sky-100 text-sky-950",
  paused: "bg-stone-200 text-stone-800",
  wrapped: "bg-violet-100 text-violet-950",
  active: "bg-emerald-100 text-emerald-950",
  onboarding: "bg-amber-100 text-amber-950",
  todo: "bg-stone-200 text-stone-800",
  doing: "bg-sky-100 text-sky-950",
  blocked: "bg-rose-100 text-rose-950",
  done: "bg-emerald-100 text-emerald-950",
  urgent: "bg-rose-100 text-rose-950",
  high: "bg-orange-100 text-orange-950",
  medium: "bg-amber-100 text-amber-950",
  low: "bg-stone-200 text-stone-700",
  briefing: "bg-stone-200 text-stone-800",
  draft: "bg-amber-100 text-amber-950",
  "internal-review": "bg-sky-100 text-sky-950",
  "client-review": "bg-orange-100 text-orange-950",
  approved: "bg-emerald-100 text-emerald-950",
  scheduled: "bg-indigo-100 text-indigo-950",
  live: "bg-emerald-200 text-emerald-950",
  reported: "bg-stone-200 text-stone-700",
  "daily-close": "bg-stone-200 text-stone-800",
  weekly: "bg-sky-100 text-sky-950",
  campaign: "bg-violet-100 text-violet-950",
  "client-meeting": "bg-amber-100 text-amber-950",
  "need-files": "bg-stone-200 text-stone-800",
  "with-editor": "bg-sky-100 text-sky-950",
  "in-edit": "bg-amber-100 text-amber-950",
  "final-ready": "bg-violet-100 text-violet-950",
  "ready-to-post": "bg-emerald-100 text-emerald-950",
  posted: "bg-stone-200 text-stone-700",
};

const labels = {
  campaign: (v: string) => campaignStatusLabel[v as CampaignStatus],
  client: (v: string) => clientStatusLabel[v as ClientStatus],
  task: (v: string) => taskStatusLabel[v as TaskStatus],
  priority: (v: string) => priorityLabel[v as TaskPriority],
  deliverable: (v: string) => deliverableStatusLabel[v as DeliverableStatus],
  recap: (v: string) => recapTypeLabel[v as RecapType],
  video: (v: string) => videoStatusLabel[v as VideoStatus],
};

export function StatusBadge({
  value,
  kind,
}: {
  value: string;
  kind: keyof typeof labels;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn("border-0 font-medium", tone[value] ?? "bg-muted")}
    >
      {labels[kind](value)}
    </Badge>
  );
}
