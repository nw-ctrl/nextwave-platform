import { ShieldCheck, UserCog, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalLoginForm } from "@/components/portal-login-form";
import { PortalWorkspaceShell } from "@/components/portal-workspace-shell";
import { getPortalSession } from "@/lib/auth";
import { getDoctorProfile } from "@/lib/clinical-data";
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

  const doctorProfile = members && members.length > 0
    ? await getDoctorProfile(membership.clientId, members[0].user_id)
    : null;

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
        <div className="grid gap-6">
          <Card className="rounded-[32px] border border-[#d9e2e8] bg-white shadow-[0_18px_48px_rgba(16,33,50,0.08)]">
            <CardContent className="grid gap-4 p-6 md:grid-cols-3">
              <div className="rounded-[24px] border border-[#e6edf1] bg-[#f8fbfc] p-5">
                <UserCog className="mb-3 size-8 text-[#1297b0]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Profile</p>
                <p className="mt-2 text-base font-semibold text-slate-900">Doctor identity and print settings</p>
              </div>
              <div className="rounded-[24px] border border-[#e6edf1] bg-[#f8fbfc] p-5">
                <UsersRound className="mb-3 size-8 text-[#1297b0]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Clinic sync</p>
                <p className="mt-2 text-base font-semibold text-slate-900">Shared across connected clinic surfaces</p>
              </div>
              <div className="rounded-[24px] border border-[#e6edf1] bg-[#eef9fb] p-5">
                <ShieldCheck className="mb-3 size-8 text-[#1297b0]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Parity</p>
                <p className="mt-2 text-base font-semibold text-slate-900">Aligned with Android prescription output</p>
              </div>
            </CardContent>
          </Card>

          {doctorProfile ? (
            <DoctorProfileForm initialProfile={doctorProfile} clientId={membership.clientId} />
          ) : (
            <Card className="rounded-[32px] border border-[#d9e2e8] bg-white shadow-[0_18px_48px_rgba(16,33,50,0.08)]">
              <CardHeader>
                <CardTitle className="text-slate-900">Doctor Profile</CardTitle>
                <CardDescription className="text-slate-500">No doctor profile could be resolved for this clinic.</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>

        <Card className="h-fit rounded-[32px] border border-[#d9e2e8] bg-white shadow-[0_18px_48px_rgba(16,33,50,0.08)]">
          <CardHeader>
            <CardDescription className="text-slate-500">Parity Information</CardDescription>
            <CardTitle className="text-2xl text-slate-900">Android Sync</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-slate-500">
            <p>Changes made to this profile impact both the web and Android app.</p>
            <p>Printing properties like font size, date offset, divider alignment, signature position, and letterhead are read from the same doctor profile used by Android prescription generation.</p>
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full border-none bg-[#e8f8fb] text-[#1297b0]">Shared data model</Badge>
              <Badge className="rounded-full border-none bg-[#f8fbfc] text-slate-700">Prescription parity</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalWorkspaceShell>
  );
}
