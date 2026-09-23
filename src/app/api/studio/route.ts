import { readStudio, writeStudio } from "@/lib/studio-file";
import type { StudioState } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await readStudio();
  return Response.json(state);
}

export async function PUT(request: Request) {
  const body = (await request.json()) as StudioState;
  if (!body || !Array.isArray(body.companies) || !Array.isArray(body.projects)) {
    return Response.json({ error: "Invalid desk" }, { status: 400 });
  }
  body.updatedAt = Date.now();
  await writeStudio(body);
  return Response.json({ ok: true, updatedAt: body.updatedAt });
}
