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
  const [mounted, setMounted] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [clinicPending, setClinicPending] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = useMemo(
    () => getPortalNavItems({ user, memberships, selectedClientId }, currentMembership),
    [user, memberships, selectedClientId, currentMembership]
  );

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

  if (!mounted) return null;

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

      <Sidebar collapsible="icon" variant="inset" className="sidebar-glass border-none">
        <SidebarHeader className="gap-3 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-primary/5 p-3 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all hover:bg-primary/10">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <span className="text-xs font-bold tracking-tight">MF</span>
            </div>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-bold tracking-tight text-foreground">MediFlow</p>
              <p className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground opacity-60">Operations</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground opacity-50">Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label} size="lg" className="rounded-xl px-4 hover:bg-primary/5 active:scale-[0.98] transition-all">
                        <Link href={item.href}>
                          <Icon className={`size-4 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
                            <span className={`truncate text-sm ${active ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                              {item.label}
                            </span>
                            <span className="truncate text-[10px] opacity-60">{item.description}</span>
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

      <SidebarInset className="bg-transparent flex flex-col min-h-screen">
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-3xl border-b border-border/50 px-4 py-4 md:px-8">
            <div className="mx-auto flex w-full max-w-7xl items-center gap-4">
              <SidebarTrigger className="rounded-xl border-none bg-white/50 dark:bg-black/20 shadow-sm transition-all hover:bg-white/80" />
              <div className="flex flex-1 items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1 justify-between rounded-2xl border-none bg-white/40 dark:bg-black/20 px-4 text-left text-muted-foreground shadow-sm transition-all hover:bg-white/60 sm:max-w-sm"
                  onClick={() => setCommandOpen(true)}
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Search className="size-4 text-primary mb-0.5" />
                    Search everything...
                  </span>
                  <span className="hidden items-center gap-1 rounded-lg bg-black/5 dark:bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-widest opacity-40 sm:inline-flex">
                    <Command className="size-2.5" />K
                  </span>
                </Button>
                <div className="flex items-center gap-2 ml-auto">
                    <Select value={selectedClientId ?? memberships[0]?.clientId} onValueChange={handleSelectClinic} disabled={clinicPending}>
                      <SelectTrigger className="h-11 min-w-[170px] rounded-2xl border-none bg-white/40 dark:bg-black/20 px-4 shadow-sm transition-all hover:bg-white/60 md:min-w-[200px]">
                        <SelectValue placeholder="Select Clinic" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none glass overflow-hidden">
                        {memberships.map((membership) => (
                          <SelectItem key={membership.clientId} value={membership.clientId} className="rounded-xl mx-1 my-0.5 focus:bg-primary/5">
                            {membership.clinicName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-11 rounded-2xl border-none bg-white/40 dark:bg-black/20 px-3 pr-4 shadow-sm hover:bg-white/60">
                          <Avatar className="size-8 shadow-sm">
                            <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">{initials(user.fullName ?? user.email)}</AvatarFallback>
                          </Avatar>
                          <ChevronsUpDown className="size-3.5 ml-2 text-muted-foreground opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 rounded-[24px] border-none glass p-2 mt-2">
                        <DropdownMenuLabel className="p-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold text-foreground">{user.fullName ?? user.email}</span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60">
                              {currentMembership.clinicName}
                            </span>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-muted-foreground/10 mx-2" />
                        <DropdownMenuItem asChild className="rounded-xl h-11 px-3">
                          <Link href="/settings">
                            <Settings2 className="mr-2 size-4 opacity-70" />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleOpenBillingSettings} className="rounded-xl h-11 px-3">
                          <ArrowUpRight className="mr-2 size-4 opacity-70" />
                          Billing
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-muted-foreground/10 mx-2" />
                        <div className="flex p-1 gap-1">
                            <Button variant="ghost" size="sm" className="flex-1 rounded-xl h-9 hover:bg-primary/5" onClick={() => setTheme("light")}>
                                <SunMedium className="size-4 mr-2" /> Light
                            </Button>
                            <Button variant="ghost" size="sm" className="flex-1 rounded-xl h-9 hover:bg-primary/5" onClick={() => setTheme("dark")}>
                                <MoonStar className="size-4 mr-2" /> Dark
                            </Button>
                        </div>
                        <DropdownMenuSeparator className="bg-muted-foreground/10 mx-2" />
                        <DropdownMenuItem onClick={handleLogout} className="rounded-xl h-11 px-3 text-destructive focus:text-destructive focus:bg-destructive/5">
                          <LogOut className="mr-2 size-4" />
                          Sign out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 px-4 py-8 md:px-8">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
                <div className="space-y-1 ml-1">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">{pageTitle}</h1>
                    <p className="text-sm text-muted-foreground max-w-2xl opacity-70">{pageDescription}</p>
                </div>
                {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
