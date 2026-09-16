import { saveUpload } from "@/lib/uploads";
import { uid } from "@/lib/id";
import { todayISO } from "@/lib/dates";
import type { FileAsset, FileKind } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  const kind = String(form.get("kind") ?? "source") as FileKind;
  const uploadedBy = String(form.get("uploadedBy") ?? "");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file" }, { status: 400 });
  }
  if (file.size > 600 * 1024 * 1024) {
    return Response.json({ error: "File is over 600 MB" }, { status: 413 });
  }
  const id = uid("file");
  const bytes = Buffer.from(await file.arrayBuffer());
  await saveUpload(id, bytes);
  const asset: FileAsset = {
    id,
    name: file.name,
    size: file.size,
    mime: file.type || "application/octet-stream",
    kind: kind === "final" ? "final" : "source",
    uploadedBy,
    uploadedAt: todayISO(),
  };
  return Response.json(asset);
}
