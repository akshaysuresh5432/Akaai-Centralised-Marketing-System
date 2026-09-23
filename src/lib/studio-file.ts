import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { seedState } from "@/lib/seed";
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
  if (onNetlify()) {
    const store = await blobStore();
    const raw = await store.get("studio.json", { type: "text" });
    if (!raw) {
      const seed = seedState();
      await store.set("studio.json", JSON.stringify(seed));
      return seed;
    }
    return normalizeStudio(JSON.parse(raw) as StudioState);
  }
  try {
    const raw = await readFile(filePath, "utf8");
    return normalizeStudio(JSON.parse(raw) as StudioState);
  } catch {
    const seed = seedState();
    await ensureDir();
    await writeFile(filePath, JSON.stringify(seed, null, 2));
    return seed;
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
