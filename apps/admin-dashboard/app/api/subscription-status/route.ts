import { enforceSubscriptionAccess } from "../../../lib/subscription";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const customerId = new URL(request.url).searchParams.get("customerId") ?? "";
  const result = await enforceSubscriptionAccess(customerId);
  return Response.json(result);
}
