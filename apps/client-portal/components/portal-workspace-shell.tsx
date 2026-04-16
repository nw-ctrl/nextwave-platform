"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { startTransition, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  ChevronsUpDown,
  Command,
  LayoutGrid,
  LogOut,
  MoonStar,
  Search,
  Settings2,
  SunMedium,
} from "lucide-react";
import { toast } from "sonner";
import type { PortalMembership, PortalSession } from "@/lib/auth";
import { getPortalNavItems } from "@/lib/portal-navigation";
import { PortalCommandMenu } from "@/components/portal-command-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger } from "@/components/ui/sidebar";

function initials(input?: string | null) {
  const value = (input ?? "").trim();
  if (!value) return "MV";
  const parts = value.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "MV";
}

type Props = {
  user: PortalSession["user"];
  memberships: PortalMembership[];
  selectedClientId: string | null;
  currentMembership: PortalMembership;
  pageTitle: string;
  pageDescription: string;
  planName?: string | null;
  statusLabel?: string | null;
  children: React.ReactNode;
};

export function PortalWorkspaceShell({ user, memberships, selectedClientId, currentMembership, pageTitle, pageDescription, planName, statusLabel, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [clinicPending, setClinicPending] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = useMemo(() => getPortalNavItems({ user, memberships, selectedClientId }, currentMembership), [user, memberships, selectedClientId, currentMembership]);

  useEffect(() => {
    if (!mounted) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "j") {
        event.preventDefault();
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mounted, resolvedTheme, setTheme]);

  async function handleSelectClinic(clientId: string) {
    if (!clientId || clientId === selectedClientId) return;
    setClinicPending(true);

    try {
      const response = await fetch("/api/auth/select-clinic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(typeof result?.error === "string" ? result.error : "Unable to switch clinic");

      toast.success("Clinic context updated");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Clinic selection failed");
      setClinicPending(false);
      return;
    }

    setClinicPending(false);
  }

  async function handleLogout() {
    setLogoutPending(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      startTransition(() => {
        router.replace("/");
        router.refresh();
      });
    } catch {
      setLogoutPending(false);
      toast.error("Unable to sign out right now.");
    }
  }

  function handleOpenBillingSettings() {
    setCommandOpen(false);
    router.push("/api/billing/manage");
  }

  const roleLabel = currentMembership.role.charAt(0).toUpperCase() + currentMembership.role.slice(1);
  const activeCount = navItems.length;

  if (!mounted) return null;

  return (
    <SidebarProvider
      defaultOpen
      className="[--sidebar-background:204_24%_18%] [--sidebar-foreground:0_0%_100%] [--sidebar-primary:185_74%_46%] [--sidebar-border:203_19%_27%] [--sidebar-ring:185_74%_46%]"
    >
      <PortalCommandMenu open={commandOpen} onOpenChange={setCommandOpen} navItems={navItems} memberships={memberships} selectedClientId={selectedClientId} onSelectClinic={handleSelectClinic} onLogout={handleLogout} onOpenBillingSettings={handleOpenBillingSettings} onToggleTheme={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} />

      <Sidebar collapsible="icon" variant="inset" className="border-r border-[#334351] bg-[linear-gradient(180deg,#233340_0%,#1c2933_100%)] text-white shadow-[16px_0_40px_rgba(16,33,50,0.14)]">
        <SidebarHeader className="gap-3 p-4">
          <div className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/5 p-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#29b8c7] text-white shadow-md">
              <span className="text-xs font-bold tracking-tight">MF</span>
            </div>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-bold tracking-tight text-white">MediFlow</p>
              <p className="truncate text-[10px] font-medium uppercase tracking-[0.18em] text-slate-300">Clinical Workspace</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarSeparator className="bg-white/10" />

        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label} size="lg" className={`rounded-[18px] px-4 transition-all active:scale-[0.98] ${active ? "bg-[#38c8d5] text-slate-950 hover:bg-[#47d2dd]" : "text-slate-200 hover:bg-white/10"}`}>
                        <Link href={item.href}>
                          <Icon className={`size-4 ${active ? "text-slate-950" : "text-slate-300"}`} />
                          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
                            <span className={`truncate text-sm ${active ? "font-semibold text-slate-950" : "font-medium text-white"}`}>{item.label}</span>
                            <span className={`truncate text-[10px] ${active ? "text-slate-700" : "text-slate-400"}`}>{item.description}</span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-3">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-3 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarFallback className="bg-[#29b8c7] text-white">{initials(user.fullName ?? user.email)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{user.fullName ?? user.email}</p>
                <p className="truncate text-xs text-slate-300">{currentMembership.clinicName}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className="rounded-full border-none bg-[#29b8c7] text-white">{roleLabel}</Badge>
              {statusLabel ? <Badge variant="outline" className="rounded-full border-white/10 capitalize text-slate-200">{statusLabel}</Badge> : null}
            </div>
          </div>
          <Button variant="ghost" className="justify-start rounded-2xl text-slate-200 hover:bg-white/10 hover:text-white group-data-[collapsible=icon]:justify-center" onClick={handleLogout} disabled={logoutPending}>
            <LogOut className="size-4" />
            <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
          </Button>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#edf2f5_0%,#f8fbfc_100%)]">
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-[#d9e2e8] bg-white/90 px-4 py-4 backdrop-blur-xl md:px-8">
            <div className="mx-auto flex w-full max-w-[1720px] items-center gap-4">
              <SidebarTrigger className="rounded-2xl border border-[#d9e2e8] bg-white text-slate-700 shadow-sm transition-all hover:bg-slate-50" />
              <div className="flex flex-1 items-center gap-3">
                <Button type="button" variant="outline" className="h-11 flex-1 justify-between rounded-[18px] border border-[#d9e2e8] bg-[#f8fbfc] px-4 text-left text-slate-500 shadow-sm transition-all hover:bg-white sm:max-w-sm" onClick={() => setCommandOpen(true)}>
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-600"><Search className="mb-0.5 size-4 text-[#1bb8cf]" />Search records, patients, templates...</span>
                  <span className="hidden items-center gap-1 rounded-lg bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:inline-flex"><Command className="size-2.5" />K</span>
                </Button>
                <div className="ml-auto flex items-center gap-2">
                  <Select value={selectedClientId ?? memberships[0]?.clientId} onValueChange={handleSelectClinic} disabled={clinicPending}>
                    <SelectTrigger className="h-11 min-w-[170px] rounded-[18px] border border-[#d9e2e8] bg-white px-4 text-slate-700 shadow-sm transition-all hover:bg-slate-50 md:min-w-[220px]">
                      <SelectValue placeholder="Select Clinic" />
                    </SelectTrigger>
                    <SelectContent className="overflow-hidden rounded-2xl border border-[#d9e2e8] bg-white text-slate-800 shadow-[0_20px_60px_rgba(16,33,50,0.16)]">
                      {memberships.map((membership) => <SelectItem key={membership.clientId} value={membership.clientId} className="mx-1 my-0.5 rounded-xl focus:bg-slate-100">{membership.clinicName}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-11 rounded-[18px] border border-[#d9e2e8] bg-white px-3 pr-4 shadow-sm hover:bg-slate-50">
                        <Avatar className="size-8 shadow-sm">
                          <AvatarFallback className="bg-[#29b8c7] text-[10px] font-bold text-white">{initials(user.fullName ?? user.email)}</AvatarFallback>
                        </Avatar>
                        <ChevronsUpDown className="ml-2 size-3.5 text-slate-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="mt-2 w-64 rounded-[24px] border border-[#d9e2e8] bg-white p-2 text-slate-800 shadow-[0_20px_60px_rgba(16,33,50,0.16)]">
                      <DropdownMenuLabel className="p-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold text-slate-900">{user.fullName ?? user.email}</span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{currentMembership.clinicName}</span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="mx-2 bg-slate-200" />
                      <DropdownMenuItem asChild className="h-11 rounded-xl px-3 focus:bg-slate-100"><Link href="/settings"><Settings2 className="mr-2 size-4 opacity-70" />Settings</Link></DropdownMenuItem>
                      <DropdownMenuItem onClick={handleOpenBillingSettings} className="h-11 rounded-xl px-3 focus:bg-slate-100"><ArrowUpRight className="mr-2 size-4 opacity-70" />Billing</DropdownMenuItem>
                      <DropdownMenuSeparator className="mx-2 bg-slate-200" />
                      <div className="flex gap-1 p-1">
                        <Button variant="ghost" size="sm" className="h-9 flex-1 rounded-xl text-slate-600 hover:bg-slate-100" onClick={() => setTheme("light")}><SunMedium className="mr-2 size-4" /> Light</Button>
                        <Button variant="ghost" size="sm" className="h-9 flex-1 rounded-xl text-slate-600 hover:bg-slate-100" onClick={() => setTheme("dark")}><MoonStar className="mr-2 size-4" /> Dark</Button>
                      </div>
                      <DropdownMenuSeparator className="mx-2 bg-slate-200" />
                      <DropdownMenuItem onClick={handleLogout} className="h-11 rounded-xl px-3 text-rose-600 focus:bg-rose-50 focus:text-rose-700"><LogOut className="mr-2 size-4" />Sign out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 px-4 py-8 md:px-8">
            <div className="mx-auto flex w-full max-w-[1720px] flex-col gap-8">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.75fr)]">
                <div className="glass-panel rounded-[30px] px-6 py-5 md:px-7">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                        <Building2 className="size-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-bold uppercase tracking-[0.2em] text-[#1bb8cf]">Clinic Workspace</p>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{pageTitle}</h1>
                        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{pageDescription}</p>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
                      <div className="glass-soft rounded-[20px] px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Clinic</p>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-900">{currentMembership.clinicName}</p>
                      </div>
                      <div className="glass-soft rounded-[20px] px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Plan</p>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-900">{planName ?? "Clinic plan"}</p>
                      </div>
                      <div className="glass-soft rounded-[20px] px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Status</p>
                        <p className="mt-1 truncate text-sm font-semibold capitalize text-slate-900">{statusLabel?.replaceAll("_", " ") ?? `${activeCount} modules`}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button type="button" className="rounded-[16px] bg-[#1bb8cf] text-white shadow-sm hover:bg-[#1297b0]" onClick={() => setCommandOpen(true)}>
                      <LayoutGrid className="mr-2 size-4" />
                      Open Command Menu
                    </Button>
                    <Button asChild variant="outline" className="rounded-[16px] border-[#d9e2e8] bg-white text-slate-700 hover:bg-slate-50">
                      <Link href="/patients">Open Patients</Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-[16px] border-[#d9e2e8] bg-white text-slate-700 hover:bg-slate-50">
                      <Link href="/templates">View Templates</Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-[16px] border-[#d9e2e8] bg-white text-slate-700 hover:bg-slate-50">
                      <Link href="/settings">Settings</Link>
                    </Button>
                  </div>
                </div>

                <div className="glass-panel rounded-[30px] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1bb8cf]">Session</p>
                      <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">{user.fullName ?? user.email}</h2>
                      <p className="mt-1 text-sm text-slate-500">{roleLabel} access across {activeCount} workspace areas</p>
                    </div>
                    <Avatar className="size-12">
                      <AvatarFallback className="bg-slate-100 text-slate-700">{initials(user.fullName ?? user.email)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="glass-soft rounded-[20px] px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Membership</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{currentMembership.clinicName}</p>
                    </div>
                    <div className="glass-soft rounded-[20px] px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Account</p>
                      <p className="mt-1 text-sm font-semibold capitalize text-slate-900">{user.accountStatus ?? "active"}</p>
                    </div>
                  </div>
                </div>
              </div>
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
