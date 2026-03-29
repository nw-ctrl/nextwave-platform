import { ShieldCheck, UserCog, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalLoginForm } from "@/components/portal-login-form";
import { PortalWorkspaceShell } from "@/components/portal-workspace-shell";
import { getPortalSession } from "@/lib/auth";
import { getReadablePortalPlanName } from "@/lib/portal-billing";
import { isAdmin } from "@/lib/role-helper";
import { createSupabaseServiceClient } from "@nextwave/database";
import { DoctorProfileForm } from "./doctor-profile-form";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getPortalSession();

  if (!session) {
    return <main className="grid min-h-screen place-items-center px-6 py-10"><PortalLoginForm /></main>;
  }

  const membership = session.memberships.find((item) => item.clientId === session.selectedClientId) ?? session.memberships[0];
  const adminVisible = isAdmin(session.user) || membership?.role === "manager" || membership?.role === "doctor";
  const planLabel = getReadablePortalPlanName(membership.subscription?.plan);
  const statusLabel = membership.subscription?.status ?? "inactive";

  if (!membership || !adminVisible) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
        <Card className="w-full rounded-[28px] border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Manage doctors</CardTitle>
            <CardDescription>Your account does not currently have permission to access this admin area.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full"><a href="/">Back to workspace</a></Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Fetch doctor profile data
  const supabase = createSupabaseServiceClient();

  const { data: profileRef } = await supabase
    .from("clinic_profiles")
    .select("id")
    .eq("client_id", membership.clientId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: members } = await supabase
    .from("clinic_members")
    .select("user_id")
    .eq("clinic_id", profileRef?.id ?? "")
    .in("role", ["Doctor", "Admin"])
    .order("role", { ascending: true })
    .limit(1);

  let doctorProfile = null;
  if (members && members.length > 0) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", members[0].user_id)
      .single();
    doctorProfile = profile;
  }

  return (
    <PortalWorkspaceShell
      user={session.user}
      memberships={session.memberships}
      selectedClientId={session.selectedClientId}
      currentMembership={membership}
      pageTitle="Doctor Profile"
      pageDescription="Manage qualifications, registration details, and prescription layout templates."
      planName={planLabel}
      statusLabel={statusLabel}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <div>
          {doctorProfile ? (
            <DoctorProfileForm initialProfile={doctorProfile} clientId={membership.clientId} />
          ) : (
             <Card className="rounded-[32px] border-border/70 shadow-sm">
               <CardHeader>
                 <CardTitle>Doctor Profile</CardTitle>
                 <CardDescription>No doctor profile could be resolved for this clinic.</CardDescription>
               </CardHeader>
             </Card>
          )}
        </div>

        <Card className="rounded-[32px] border-border/70 shadow-sm h-fit">
          <CardHeader>
            <CardDescription>Parity Information</CardDescription>
            <CardTitle className="text-2xl">Android Sync</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>Changes made to this profile impact both the web and Android app.</p>
            <p>Printing properties like font size and offsets are used directly by the Android prescription generator to format final PDFs.</p>
          </CardContent>
        </Card>
      </div>
    </PortalWorkspaceShell>
  );
}
