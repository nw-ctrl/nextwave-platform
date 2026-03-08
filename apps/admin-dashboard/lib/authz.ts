import { getEffectiveAccess } from "./access";

type PlatformRole = "superuser" | "admin" | "auditor";
type ClientRole = "admin" | "manager" | "staff" | "viewer";

function getActorUserId(request: Request) {
  return request.headers.get("x-actor-user-id") ?? new URL(request.url).searchParams.get("actorUserId");
}

async function resolveActorAccess(request: Request) {
  const actorUserId = getActorUserId(request);
  if (!actorUserId) {
    throw new Error("Missing actor user id. Provide x-actor-user-id header or actorUserId query param.");
  }

  const access = await getEffectiveAccess(actorUserId);
  return { actorUserId, access };
}

export async function requirePlatformRole(request: Request, allowedRoles: PlatformRole[]) {
  const { actorUserId, access } = await resolveActorAccess(request);

  if (access.platform.isSuperuser) {
    return actorUserId;
  }

  const hasRole = access.platform.roles.some((role) => allowedRoles.includes(role as PlatformRole));
  if (!hasRole) {
    throw new Error(`Platform role required: ${allowedRoles.join(", ")}`);
  }

  return actorUserId;
}

export async function requireClientRole(
  request: Request,
  clientId: string,
  allowedRoles: ClientRole[],
  options?: { allowPlatformAdmin?: boolean }
) {
  const { actorUserId, access } = await resolveActorAccess(request);

  if (access.platform.isSuperuser) {
    return actorUserId;
  }

  if (options?.allowPlatformAdmin !== false && access.platform.isAdmin) {
    return actorUserId;
  }

  const membership = access.clients.find((item) => item.clientId === clientId);
  if (!membership || !allowedRoles.includes(membership.role as ClientRole)) {
    throw new Error(`Client role required for ${clientId}: ${allowedRoles.join(", ")}`);
  }

  return actorUserId;
}
