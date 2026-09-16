import type {
  CampaignStatus,
  ClientStatus,
  DeliverableStatus,
  RecapType,
  TaskPriority,
  TaskStatus,
  VideoStatus,
} from "./types";

export const campaignStatusLabel: Record<CampaignStatus, string> = {
  planning: "Planning",
  "in-market": "In market",
  "always-on": "Always-on",
  paused: "Paused",
  wrapped: "Wrapped",
};

export const clientStatusLabel: Record<ClientStatus, string> = {
  active: "Active",
  onboarding: "Onboarding",
  paused: "Paused",
};

export const taskStatusLabel: Record<TaskStatus, string> = {
  todo: "To do",
  doing: "Doing",
  blocked: "Blocked",
  done: "Done",
};

export const priorityLabel: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const deliverableStatusLabel: Record<DeliverableStatus, string> = {
  briefing: "Briefing",
  draft: "Draft",
  "internal-review": "Internal review",
  "client-review": "Client review",
  approved: "Approved",
  scheduled: "Scheduled",
  live: "Live",
  reported: "Reported",
};

export const recapTypeLabel: Record<RecapType, string> = {
  "daily-close": "Daily close",
  weekly: "Weekly recap",
  campaign: "Campaign recap",
  "client-meeting": "Client meeting",
};

export const videoStatusLabel: Record<VideoStatus, string> = {
  "need-files": "Waiting for footage",
  "with-editor": "Ready for editor",
  "in-edit": "In edit",
  "final-ready": "Final uploaded",
  "ready-to-post": "Ready to post",
  posted: "Posted",
};
