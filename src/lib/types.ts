export const CHANNELS = [
  "Instagram",
  "TikTok",
  "LinkedIn",
  "Pinterest",
  "X",
  "YouTube",
  "Email",
  "SMS",
  "Paid social",
  "Paid search",
  "SEO",
  "PR",
  "Influencer",
  "Landing page",
  "Events",
] as const;

export type Channel = (typeof CHANNELS)[number];

export const CAMPAIGN_STATUSES = [
  "planning",
  "in-market",
  "always-on",
  "paused",
  "wrapped",
] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const CLIENT_STATUSES = ["active", "onboarding", "paused"] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const TASK_STATUSES = ["todo", "doing", "blocked", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const DELIVERABLE_TYPES = [
  "social post",
  "carousel",
  "reel / short",
  "ad creative",
  "email",
  "landing page",
  "blog / SEO",
  "video",
  "brief",
  "report",
  "press",
] as const;
export type DeliverableType = (typeof DELIVERABLE_TYPES)[number];

export const DELIVERABLE_STATUSES = [
  "briefing",
  "draft",
  "internal-review",
  "client-review",
  "approved",
  "scheduled",
  "live",
  "reported",
] as const;
export type DeliverableStatus = (typeof DELIVERABLE_STATUSES)[number];

export const RECAP_TYPES = [
  "daily-close",
  "weekly",
  "campaign",
  "client-meeting",
] as const;
export type RecapType = (typeof RECAP_TYPES)[number];

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  initials: string;
  color: string;
};

export type Client = {
  id: string;
  name: string;
  industry: string;
  status: ClientStatus;
  contactName: string;
  contactEmail: string;
  website: string;
  retainer: string;
  notes: string;
};

export type Campaign = {
  id: string;
  clientId: string;
  name: string;
  objective: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  channels: Channel[];
  budget: string;
  kpis: string;
  ownerId: string;
};

export type Milestone = {
  id: string;
  campaignId: string;
  title: string;
  date: string;
  done: boolean;
};

export type Deliverable = {
  id: string;
  campaignId: string;
  clientId: string;
  title: string;
  type: DeliverableType;
  channel: Channel;
  status: DeliverableStatus;
  assigneeId: string;
  date: string;
  time?: string;
  notes: string;
};

export type Task = {
  id: string;
  title: string;
  details: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assigneeId: string;
  clientId?: string;
  campaignId?: string;
};

export type Recap = {
  id: string;
  title: string;
  type: RecapType;
  date: string;
  authorId: string;
  clientId?: string;
  campaignId?: string;
  shipped: string;
  next: string;
  blockers: string;
  notes: string;
};

export type StudioState = {
  studioName: string;
  currentUserId: string;
  team: TeamMember[];
  clients: Client[];
  campaigns: Campaign[];
  milestones: Milestone[];
  deliverables: Deliverable[];
  tasks: Task[];
  recaps: Recap[];
};

export type ComposerKind =
  | "task"
  | "campaign"
  | "client"
  | "deliverable"
  | "recap"
  | "milestone"
  | "person";
