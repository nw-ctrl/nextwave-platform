import { resolveConnectionForClient, createSupabaseServiceClient } from "@nextwave/database";
import { requireClientModule } from "../../../lib/authz";

export async function GET(request: Request) {
  const clientId = new URL(request.url).searchParams.get("clientId");
  if (!clientId) {
    return Response.json({ error: "Missing clientId" }, { status: 400 });
  }

  try {
    await requireClientModule(request, clientId, "doctors", ["admin", "manager", "staff", "viewer"]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "forbidden";
    return Response.json({ error: message }, { status: 403 });
  }

  const resolved = await resolveConnectionForClient(clientId);
  if (!resolved) {
    return Response.json({ error: "No active connection found for client" }, { status: 404 });
  }

  const supabase = createSupabaseServiceClient();

  const { data: profileRef } = await supabase
    .from("clinic_profiles")
    .select("id")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!profileRef?.id) {
    return Response.json({ doctorProfile: null });
  }

  const { data: members, error: memberErr } = await supabase
    .from("clinic_members")
    .select("user_id")
    .eq("clinic_id", profileRef.id)
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

  try {
    await requireClientModule(request, clientId, "doctors", ["admin", "manager", "staff"]);
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

  const { data: profileRef } = await supabase
    .from("clinic_profiles")
    .select("id")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!profileRef?.id) {
    return Response.json({ error: "No clinic profile linked" }, { status: 404 });
  }

  const { data: members } = await supabase
    .from("clinic_members")
    .select("user_id")
    .eq("clinic_id", profileRef.id)
    .in("role", ["Doctor", "Admin"])
    .order("role", { ascending: true })
    .limit(1);

  if (!members || members.length === 0) {
    return Response.json({ error: "No doctor found in clinic" }, { status: 404 });
  }

  const targetUserId = members[0].user_id;

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
