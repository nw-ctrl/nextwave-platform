"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  ChevronsUpDown,
  Command,
  LogOut,
  MoonStar,
  Search,
  SunMedium,
} from "lucide-react";
import { toast } from "sonner";
import type { PortalMembership, PortalSession } from "@/lib/auth";
import { getPortalNavItems } from "@/lib/portal-navigation";
import { PortalCommandMenu } from "@/components/portal-command-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

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

export function PortalWorkspaceShell({
  user,
  memberships,
  selectedClientId,
  currentMembership,
  pageTitle,
  pageDescription,
  planName,
  statusLabel,
  children,
}: Props) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [commandOpen, setCommandOpen] = useState(false);
  const [clinicPending, setClinicPending] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  const navItems = useMemo(
    () => getPortalNavItems({ user, memberships, selectedClientId }, currentMembership),
    [user, memberships, selectedClientId, currentMembership]
  );

  useEffect(() => {
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
  }, [resolvedTheme, setTheme]);

  async function handleSelectClinic(clientId: string) {
    if (!clientId || clientId === selectedClientId) {
      return;
    }

    setClinicPending(true);

    try {
      const response = await fetch("/api/auth/select-clinic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(typeof result?.error === "string" ? result.error : "Unable to switch clinic");
      }

      toast.success("Clinic context updated");
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Clinic selection failed");
      setClinicPending(false);
    }
  }

  async function handleLogout() {
    setLogoutPending(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch {
      setLogoutPending(false);
      toast.error("Unable to sign out right now.");
    }
  }

  function handleOpenBillingSettings() {
    setCommandOpen(false);
    window.location.href = "/api/billing/manage";
  }

  const roleLabel = currentMembership.role.charAt(0).toUpperCase() + currentMembership.role.slice(1);

  return (
    <SidebarProvider defaultOpen>
      <PortalCommandMenu
        open={commandOpen}
        onOpenChange={setCommandOpen}
        navItems={navItems}
        memberships={memberships}
        selectedClientId={selectedClientId}
        onSelectClinic={handleSelectClinic}
        onLogout={handleLogout}
        onOpenBillingSettings={handleOpenBillingSettings}
        onToggleTheme={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      />

      <Sidebar collapsible="icon" variant="inset" className="border-sidebar-border">
        <SidebarHeader className="gap-3 p-3">
          <div className="flex items-center gap-3 rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/60 p-3 shadow-sm">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
              <span className="text-sm font-semibold tracking-wide">MV</span>
            </div>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">MediFlow</p>
              <p className="truncate text-xs text-muted-foreground">GP Clinical Portal</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-10 justify-between rounded-2xl border-dashed bg-background/80 text-muted-foreground group-data-[collapsible=icon]:hidden"
            onClick={() => setCommandOpen(true)}
          >
            <span className="flex items-center gap-2">
              <Search className="size-4 text-primary" />
              Search patients or commands
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <Command className="size-3" />K
            </span>
          </Button>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;

                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label} size="lg">
                        <Link href={item.href}>
                          <Icon className="size-4" />
                          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
                            <span className="truncate">{item.label}</span>
                            <span className="truncate text-xs text-muted-foreground">{item.description}</span>
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
          <div className="rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/60 p-3 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarFallback>{initials(user.fullName ?? user.email)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sidebar-foreground">{user.fullName ?? user.email}</p>
                <p className="truncate text-xs text-muted-foreground">{currentMembership.clinicName}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full">{roleLabel}</Badge>
              {statusLabel ? <Badge variant="outline" className="rounded-full capitalize">{statusLabel}</Badge> : null}
            </div>
          </div>
          <Button variant="ghost" className="justify-start rounded-2xl group-data-[collapsible=icon]:justify-center" onClick={handleLogout} disabled={logoutPending}>
            <LogOut className="size-4" />
            <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
          </Button>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="bg-transparent">
        <div className="flex min-h-svh flex-col">
          <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
            <div className="flex flex-col gap-4 px-4 py-4 md:px-6 lg:px-8">
              <div className="flex flex-wrap items-center gap-3">
                <SidebarTrigger className="rounded-xl border border-border/70 bg-background shadow-sm" />
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1 justify-between rounded-2xl border-border/70 bg-card/80 px-4 text-left text-muted-foreground shadow-sm sm:max-w-md"
                  onClick={() => setCommandOpen(true)}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <Search className="size-4 text-primary" />
                    Search patients, clinics, or commands
                  </span>
                  <span className="hidden items-center gap-1 rounded-md bg-muted px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:inline-flex">
                    <Command className="size-3" />K
                  </span>
                </Button>
                {memberships.length > 1 ? (
                  <Select value={selectedClientId ?? memberships[0]?.clientId} onValueChange={handleSelectClinic} disabled={clinicPending}>
                    <SelectTrigger className="h-11 min-w-[220px] rounded-2xl bg-card/80 px-4 shadow-sm">
                      <SelectValue placeholder="Select clinic" />
                    </SelectTrigger>
                    <SelectContent>
                      {memberships.map((membership) => (
                        <SelectItem key={membership.clientId} value={membership.clientId}>
                          {membership.clinicName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-11 rounded-2xl border-border/70 bg-card/80 px-3 shadow-sm">
                      <SunMedium className="size-4 dark:hidden" />
                      <MoonStar className="hidden size-4 dark:block" />
                      <span className="hidden sm:inline">Theme</span>
                      <ChevronsUpDown className="size-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-2xl">
                    <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleOpenBillingSettings}>
                      Billing settings
                      <ArrowUpRight className="ml-auto size-4 text-muted-foreground" />
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Sign out
                      <LogOut className="ml-auto size-4 text-muted-foreground" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-full bg-primary/10 px-3 py-1 text-primary">{currentMembership.clinicName}</Badge>
                    <Badge variant="outline" className="rounded-full px-3 py-1 capitalize">{roleLabel}</Badge>
                    {statusLabel ? <Badge variant="outline" className="rounded-full px-3 py-1 capitalize">{statusLabel}</Badge> : null}
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{pageTitle}</h1>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">{pageDescription}</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[360px]">
                  <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-sm">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Current plan</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{planName ?? "Clinic access"}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-sm">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Clinic context</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{memberships.length} available {memberships.length === 1 ? "account" : "accounts"}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 px-4 py-6 md:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">{children}</div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
