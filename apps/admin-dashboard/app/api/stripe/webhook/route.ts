import { processStripeWebhookEvent, verifyStripeWebhookEvent } from "../../../../lib/subscription";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  const verified = await verifyStripeWebhookEvent(payload, signature);
  if (!verified.ok) {
    return Response.json({ error: "Invalid webhook signature", reason: verified.reason }, { status: 400 });
  }

  const result = await processStripeWebhookEvent(verified.event, verified.context);
  return Response.json({ received: true, source: verified.source, result });
}