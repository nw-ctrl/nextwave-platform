import { enforceSubscriptionAccess } from "../../../lib/subscription";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const customerId = searchParams.get("customerId") ?? undefined;
  const clientId = searchParams.get("clientId") ?? undefined;
  const result = await enforceSubscriptionAccess({ customerId, clientId });
  return Response.json(result);
}
