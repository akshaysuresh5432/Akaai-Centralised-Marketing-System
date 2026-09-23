import type { StudioState } from "./types";

export const STORAGE_KEY = "akaai-desk-v3";

export const seedState = (): StudioState => ({
  studioName: "Akaai Spaces",
  currentUserId: "tm-akshay",
  updatedAt: 1,
  team: [
    {
      id: "tm-akshay",
      name: "Akshay Suresh",
      role: "Principal",
      initials: "AS",
      color: "#6B3F24",
    },
    {
      id: "tm-maya",
      name: "Maya Chen",
      role: "Accounts",
      initials: "MC",
      color: "#2F4A44",
    },
    {
      id: "tm-aisha",
      name: "Aisha Rahman",
      role: "Video editor",
      initials: "AR",
      color: "#4A3A5A",
    },
    {
      id: "tm-sam",
      name: "Sam Okonkwo",
      role: "Posting",
      initials: "SO",
      color: "#3A4A5A",
    },
  ],
  companies: [
    {
      id: "co-harbor",
      name: "Harbor & Pine",
      contact: "Elena Voss",
      onboarded: "2026-01-12",
    },
    {
      id: "co-solstice",
      name: "Solstice Athletics",
      contact: "Marcus Hale",
      onboarded: "2026-06-02",
    },
  ],
  projects: [
    {
      id: "pr-harbor-fall",
      companyId: "co-harbor",
      name: "Fall Home",
      current: true,
    },
    {
      id: "pr-sol-race",
      companyId: "co-solstice",
      name: "Marathon drop",
      current: true,
    },
  ],
  campaigns: [
    {
      id: "ca-lookbook",
      projectId: "pr-harbor-fall",
      name: "Lookbook launch",
      status: "running",
    },
    {
      id: "ca-harbor-always",
      projectId: "pr-harbor-fall",
      name: "Always-on social",
      status: "running",
    },
    {
      id: "ca-race",
      projectId: "pr-sol-race",
      name: "Race-week drop",
      status: "running",
    },
  ],
  deliverables: [
    {
      id: "dl-1",
      companyId: "co-harbor",
      campaignId: "ca-lookbook",
      title: "Rooms carousel",
      publishDate: "2026-09-23",
      ownerId: "tm-sam",
      done: false,
    },
    {
      id: "dl-2",
      companyId: "co-harbor",
      campaignId: "ca-harbor-always",
      title: "Joinery reel",
      publishDate: "2026-09-26",
      ownerId: "tm-sam",
      done: false,
    },
    {
      id: "dl-3",
      companyId: "co-solstice",
      campaignId: "ca-race",
      title: "Rain teaser",
      publishDate: "2026-09-29",
      ownerId: "tm-aisha",
      done: false,
    },
  ],
  invoices: [
    {
      id: "inv-1",
      companyId: "co-harbor",
      projectId: "pr-harbor-fall",
      title: "September retainer",
      date: "2026-09-30",
      amount: "$18,000",
      ownerId: "tm-maya",
      paid: false,
    },
    {
      id: "inv-2",
      companyId: "co-solstice",
      projectId: "pr-sol-race",
      title: "September retainer + media",
      date: "2026-10-01",
      amount: "$24,000",
      ownerId: "tm-maya",
      paid: false,
    },
  ],
  videoJobs: [
    {
      id: "vid-rain",
      title: "Rain teaser",
      brief: "Aisha downloads footage, uploads the cut. Sam posts it.",
      clientId: "co-solstice",
      campaignId: "ca-race",
      status: "with-editor",
      dueDate: "2026-09-29",
      platforms: ["Instagram", "TikTok"],
      editorId: "tm-aisha",
      posterId: "tm-sam",
      sourceFiles: [],
      finalFiles: [],
    },
  ],
});
