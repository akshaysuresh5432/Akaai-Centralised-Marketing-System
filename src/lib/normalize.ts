import { seedState } from "@/lib/seed";
import type { StudioState } from "@/lib/types";

export function normalizeStudio(raw: StudioState): StudioState {
  const seed = seedState();
  const team = [...(raw.team ?? [])];
  for (const person of seed.team) {
    if (!team.some((p) => p.id === person.id)) team.push(person);
  }
  const studioName =
    !raw.studioName || raw.studioName === "Suresh Studio"
      ? "Akaai Spaces"
      : raw.studioName;
  const videoJobs =
    raw.videoJobs && raw.videoJobs.length > 0 ? raw.videoJobs : seed.videoJobs;
  return {
    ...seed,
    ...raw,
    studioName,
    team,
    videoJobs,
  };
}
