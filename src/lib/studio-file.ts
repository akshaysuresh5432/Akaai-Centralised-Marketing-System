import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { normalizeStudio } from "@/lib/normalize";
import { onNetlify } from "@/lib/platform";
import type { StudioState } from "@/lib/types";

const filePath = path.join(
  process.env.VERCEL ? "/tmp/relay-desk" : process.cwd(),
  "data",
  "studio.json"
);

async function blobStore() {
  const { getStore } = await import("@netlify/blobs");
  return getStore("akaai-desk");
}

async function ensureDir() {
  await mkdir(path.dirname(filePath), { recursive: true });
}

export async function readStudio(): Promise<StudioState> {
  const parsed = await loadRaw();
  const next = normalizeStudio(parsed);
  if (!parsed || !Array.isArray((parsed as StudioState).projects)) {
    await writeStudio(next);
  }
  return next;
}

async function loadRaw(): Promise<StudioState | null> {
  if (onNetlify()) {
    const store = await blobStore();
    const raw = await store.get("studio.json", { type: "text" });
    if (!raw) return null;
    return JSON.parse(raw) as StudioState;
  }
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as StudioState;
  } catch {
    return null;
  }
}

export async function writeStudio(state: StudioState) {
  if (onNetlify()) {
    const store = await blobStore();
    await store.set("studio.json", JSON.stringify(state));
    return;
  }
  await ensureDir();
  await writeFile(filePath, JSON.stringify(state, null, 2));
}
