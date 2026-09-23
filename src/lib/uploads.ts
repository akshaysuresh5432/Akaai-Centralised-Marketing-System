import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { onNetlify } from "@/lib/platform";

const root = path.join(
  process.env.VERCEL ? "/tmp/relay-desk" : process.cwd(),
  "data",
  "uploads"
);

async function blobStore() {
  const { getStore } = await import("@netlify/blobs");
  return getStore("akaai-uploads");
}

export function uploadPath(id: string) {
  return path.join(root, id);
}

export async function saveUpload(id: string, bytes: Buffer) {
  if (onNetlify()) {
    const store = await blobStore();
    const copy = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(copy).set(bytes);
    await store.set(id, copy);
    return;
  }
  await mkdir(root, { recursive: true });
  await writeFile(uploadPath(id), bytes);
}

export async function readUpload(id: string) {
  if (onNetlify()) {
    const store = await blobStore();
    const data = await store.get(id, { type: "arrayBuffer" });
    if (!data) throw new Error("missing");
    return Buffer.from(data);
  }
  return readFile(uploadPath(id));
}

export async function deleteUpload(id: string) {
  try {
    if (onNetlify()) {
      const store = await blobStore();
      await store.delete(id);
      return;
    }
    await unlink(uploadPath(id));
  } catch {
    // already gone
  }
}
