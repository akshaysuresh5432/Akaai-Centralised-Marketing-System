import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { seedState } from "@/lib/seed";
import type { StudioState } from "@/lib/types";

const filePath = path.join(
  process.env.VERCEL ? "/tmp/relay-desk" : process.cwd(),
  "data",
  "studio.json"
);

async function ensureDir() {
  await mkdir(path.dirname(filePath), { recursive: true });
}

export async function readStudio(): Promise<StudioState> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as StudioState;
  } catch {
    const seed = seedState();
    await ensureDir();
    await writeFile(filePath, JSON.stringify(seed, null, 2));
    return seed;
  }
}

export async function writeStudio(state: StudioState) {
  await ensureDir();
  await writeFile(filePath, JSON.stringify(state, null, 2));
}
