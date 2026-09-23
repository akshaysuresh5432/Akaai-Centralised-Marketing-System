export const CAMPAIGN_STATUSES = ["running", "planned", "done"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
};

export type Company = {
  id: string;
  name: string;
  contact: string;
  onboarded: string;
};

export type Project = {
  id: string;
  companyId: string;
  name: string;
  current: boolean;
};

export type Campaign = {
  id: string;
  projectId: string;
  name: string;
  status: CampaignStatus;
};

export type Deliverable = {
  id: string;
  companyId: string;
  campaignId?: string;
  title: string;
  publishDate: string;
  ownerId: string;
  done: boolean;
};

export type Invoice = {
  id: string;
  companyId: string;
  projectId?: string;
  title: string;
  date: string;
  amount: string;
  ownerId: string;
  paid: boolean;
};

export const VIDEO_STATUSES = [
  "need-files",
  "with-editor",
  "in-edit",
  "final-ready",
  "ready-to-post",
  "posted",
] as const;
export type VideoStatus = (typeof VIDEO_STATUSES)[number];
export type FileKind = "source" | "final";

export type FileAsset = {
  id: string;
  name: string;
  size: number;
  mime: string;
  kind: FileKind;
  uploadedBy: string;
  uploadedAt: string;
};

export type VideoJob = {
  id: string;
  title: string;
  brief: string;
  clientId?: string;
  campaignId?: string;
  status: VideoStatus;
  dueDate: string;
  platforms: string[];
  editorId: string;
  posterId: string;
  sourceFiles: FileAsset[];
  finalFiles: FileAsset[];
};

export type StudioState = {
  studioName: string;
  currentUserId: string;
  updatedAt: number;
  team: TeamMember[];
  companies: Company[];
  projects: Project[];
  campaigns: Campaign[];
  deliverables: Deliverable[];
  invoices: Invoice[];
  videoJobs: VideoJob[];
};

export type ComposerKind =
  | "company"
  | "project"
  | "campaign"
  | "publish"
  | "invoice"
  | "video";
