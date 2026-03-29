import { resolveConnectionForClient, createSupabaseServiceClient } from "@nextwave/database";
import { requireClientModule } from "../../../lib/authz";

export async function GET(request: Request) {
  const clientId = new URL(request.url).searchParams.get("clientId");
  if (!clientId) {
    return Response.json({ error: "Missing clientId" }, { status: 400 });
  }

  let authContext;
  try {
    authContext = await requireClientModule(request, clientId, "doctors", ["admin", "manager", "staff", "viewer"]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "forbidden";
    return Response.json({ error: message }, { status: 403 });
  }

  const resolved = await resolveConnectionForClient(clientId);
  if (!resolved) {
    return Response.json({ error: "No active connection found for client" }, { status: 404 });
  }

  const supabase = createSupabaseServiceClient();

  // Find the first doctor for this clinic if user is admin, else find their own profile.
  // Actually, wait: the Android contract binds doctor info directly to `profiles`.
  // First get the user's ID from authContext
  const userId = authContext.userId;
  
  // If the requester is an admin or manager, they might be viewing the clinic's primary doctor.
  // We look up the clinic_members to find a doctor profile.
  const { data: members, error: memberErr } = await supabase
    .from("clinic_members")
    .select("user_id")
    .eq("clinic_id", clientId)
    .in("role", ["Doctor", "Admin"])
    .order("role", { ascending: true })
    .limit(1);

  if (memberErr || !members || members.length === 0) {
    return Response.json({ doctorProfile: null });
  }

  const targetUserId = members[0].user_id;
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", targetUserId)
    .single();

  if (error || !profile) {
    return Response.json({ doctorProfile: null });
  }

  return Response.json({
    doctorProfile: profile,
    router: {
      connectionId: resolved.id,
    }
  });
}

export async function PUT(request: Request) {
  const clientId = new URL(request.url).searchParams.get("clientId");
  if (!clientId) {
    return Response.json({ error: "Missing clientId" }, { status: 400 });
  }

  let authContext;
  try {
    authContext = await requireClientModule(request, clientId, "doctors", ["admin", "manager", "staff"]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "forbidden";
    return Response.json({ error: message }, { status: 403 });
  }

  const resolved = await resolveConnectionForClient(clientId);
  if (!resolved) {
    return Response.json({ error: "No active connection found for client" }, { status: 404 });
  }

  const data = await request.json();
  const supabase = createSupabaseServiceClient();

  const { data: members } = await supabase
    .from("clinic_members")
    .select("user_id")
    .eq("clinic_id", clientId)
    .in("role", ["Doctor", "Admin"])
    .order("role", { ascending: true })
    .limit(1);

  if (!members || members.length === 0) {
    return Response.json({ error: "No doctor found in clinic" }, { status: 404 });
  }

  const targetUserId = members[0].user_id;
  
  // Clean payload
  const { id, is_active, ...updates } = data;

  const { data: updatedProfile, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", targetUserId)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    updated: true,
    data: updatedProfile,
    router: {
      connectionId: resolved.id,
    }
  });
}
