import { getEffectiveAccess } from "../../../../lib/access";

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId) {
    return Response.json({ error: "Missing userId" }, { status: 400 });
  }

  const access = await getEffectiveAccess(userId);
  return Response.json(access);
}