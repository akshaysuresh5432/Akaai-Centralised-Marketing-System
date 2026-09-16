import { readUpload } from "@/lib/uploads";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!/^file-[a-z0-9]+$/i.test(id)) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const bytes = await readUpload(id);
    const name = _request.url.includes("name=")
      ? decodeURIComponent(new URL(_request.url).searchParams.get("name") ?? id)
      : id;
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${name.replace(/"/g, "")}"`,
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
