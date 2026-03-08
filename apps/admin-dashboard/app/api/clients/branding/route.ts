import { listTenantBranding, upsertTenantBranding } from "../../../../lib/tenants";
import { requireClientRole } from "../../../../lib/authz";

function normalizeHexColor(input?: string) {
  if (!input) {
    return undefined;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return undefined;
  }

  const candidate = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  const valid = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(candidate);
  if (!valid) {
    throw new Error(`Invalid hex color: ${input}`);
  }

  return candidate.toUpperCase();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = url.searchParams.get("clientId") ?? undefined;
  const appId = url.searchParams.get("appId") ?? undefined;
  const items = await listTenantBranding(clientId, appId);
  return Response.json({ items });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.clientId || !body.brandName) {
      return Response.json({ error: "Missing clientId or brandName" }, { status: 400 });
    }

    const actorUserId = await requireClientRole(request, body.clientId, ["admin"]);

    const branding = await upsertTenantBranding({
      clientId: body.clientId,
      appId: body.appId,
      brandName: body.brandName,
      logoUrl: body.logoUrl,
      faviconUrl: body.faviconUrl,
      primaryColor: normalizeHexColor(body.primaryColor),
      secondaryColor: normalizeHexColor(body.secondaryColor),
      accentColor: normalizeHexColor(body.accentColor),
      locale: body.locale,
      timezone: body.timezone,
      domain: body.domain,
      metadata: body.metadata
    });

    return Response.json({ saved: true, actorUserId, branding });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed_to_save_branding";
    return Response.json({ saved: false, error: message }, { status: 403 });
  }
}
