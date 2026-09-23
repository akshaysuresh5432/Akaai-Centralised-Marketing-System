import type { CampaignStatus } from "./types";

export const campaignStatusLabel: Record<CampaignStatus, string> = {
  running: "Running",
  planned: "Planned",
  done: "Done",
};

export const videoStatusLabel = {
  "need-files": "Waiting for footage",
  "with-editor": "Ready for editor",
  "in-edit": "In edit",
  "final-ready": "Final uploaded",
  "ready-to-post": "Ready to post",
  posted: "Posted",
} as const;
