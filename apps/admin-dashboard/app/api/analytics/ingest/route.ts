import { ingestUsageEvent } from "@nextwave/analytics";

export async function POST(request: Request) {
  const body = await request.json();
  const record = ingestUsageEvent(body);
  return Response.json({ ok: true, record });
}