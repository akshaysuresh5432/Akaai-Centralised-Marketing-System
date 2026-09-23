import { seedState } from "./seed";
import type { StudioState } from "./types";

export function normalizeStudio(raw: StudioState | null): StudioState {
  if (!raw || !Array.isArray(raw.projects) || !Array.isArray(raw.companies)) {
    return seedState();
  }
  const seed = seedState();
  return {
    ...seed,
    ...raw,
    studioName: raw.studioName || "Akaai Spaces",
    team: raw.team?.length ? raw.team : seed.team,
    companies: raw.companies,
    projects: raw.projects,
    campaigns: raw.campaigns ?? [],
    deliverables: raw.deliverables ?? [],
    invoices: raw.invoices ?? [],
    videoJobs: raw.videoJobs ?? seed.videoJobs,
  };
}
