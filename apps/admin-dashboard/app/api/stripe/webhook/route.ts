import { verifyStripeWebhook } from "@nextwave/auth";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  const verified = verifyStripeWebhook(payload, signature);
  if (!verified) {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  return Response.json({ received: true });
}