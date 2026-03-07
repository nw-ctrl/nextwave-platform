import { getSecret, listSecrets, putSecret } from "../../../lib/secrets";

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (key) {
    const secret = getSecret(key);
    if (!secret) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json({ key: secret.key, updatedAt: secret.updatedAt });
  }

  return Response.json({ items: listSecrets() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = putSecret(body.key, body.value);
  return Response.json({ stored: true, secret: result });
}
