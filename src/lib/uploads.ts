import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.join(
  process.env.VERCEL ? "/tmp/relay-desk" : process.cwd(),
  "data",
  "uploads"
);

export function uploadPath(id: string) {
  return path.join(root, id);
}

export async function saveUpload(id: string, bytes: Buffer) {
  await mkdir(root, { recursive: true });
  await writeFile(uploadPath(id), bytes);
}

export async function readUpload(id: string) {
  return readFile(uploadPath(id));
}

export async function deleteUpload(id: string) {
  try {
    await unlink(uploadPath(id));
  } catch {
    // already gone
  }
}
