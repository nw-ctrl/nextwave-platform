import { listTenantBranding, upsertTenantBranding } from "../../../../lib/tenants";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = url.searchParams.get("clientId") ?? undefined;
  const appId = url.searchParams.get("appId") ?? undefined;
  const items = await listTenantBranding(clientId, appId);
  return Response.json({ items });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.clientId || !body.brandName) {
    return Response.json({ error: "Missing clientId or brandName" }, { status: 400 });
  }

  const branding = await upsertTenantBranding({
    clientId: body.clientId,
    appId: body.appId,
    brandName: body.brandName,
    logoUrl: body.logoUrl,
    faviconUrl: body.faviconUrl,
    primaryColor: body.primaryColor,
    secondaryColor: body.secondaryColor,
    accentColor: body.accentColor,
    locale: body.locale,
    timezone: body.timezone,
    domain: body.domain,
    metadata: body.metadata
  });

  return Response.json({ saved: true, branding });
}