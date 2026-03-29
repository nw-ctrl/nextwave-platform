"use client";

import { useRouter } from "next/navigation";
import { Building2, CreditCard, LogOut, MoonStar, SunMedium } from "lucide-react";
import type { PortalMembership } from "@/lib/auth";
import type { PortalNavItem } from "@/lib/portal-navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

type PortalCommandMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  navItems: PortalNavItem[];
  memberships: PortalMembership[];
  selectedClientId: string | null;
  onSelectClinic: (clientId: string) => Promise<void>;
  onLogout: () => Promise<void>;
  onOpenBillingSettings: () => void;
  onToggleTheme: () => void;
};

export function PortalCommandMenu({
  open,
  onOpenChange,
  navItems,
  memberships,
  selectedClientId,
  onSelectClinic,
  onLogout,
  onOpenBillingSettings,
  onToggleTheme,
}: PortalCommandMenuProps) {
  const router = useRouter();

  function handleNavigate(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  async function handleClinic(clientId: string) {
    onOpenChange(false);
    await onSelectClinic(clientId);
  }

  async function handleLogoutAction() {
    onOpenChange(false);
    await onLogout();
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Workspace Command Menu"
      description="Search navigation, clinics, and actions."
      className="max-w-2xl border-border/60 bg-background/95 shadow-2xl backdrop-blur"
    >
      <CommandInput placeholder="Search patients, clinics, billing, and commands..." />
      <CommandList>
        <CommandEmpty>No matching workspace action.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem key={item.key} value={`${item.label} ${item.description}`} onSelect={() => handleNavigate(item.href)}>
                <Icon className="size-4 text-primary" />
                <div className="flex flex-col">
                  <span>{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </div>
                <CommandShortcut>{item.href === "/" ? "GH" : item.href === "/dashboard" ? "GD" : "GB"}</CommandShortcut>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem value="Open billing settings manage account invoices" onSelect={onOpenBillingSettings}>
            <CreditCard className="size-4 text-primary" />
            <span>Open billing settings</span>
          </CommandItem>
          <CommandItem value="Toggle theme light dark mode" onSelect={onToggleTheme}>
            <MoonStar className="size-4 text-primary dark:hidden" />
            <SunMedium className="hidden size-4 text-primary dark:block" />
            <span>Toggle appearance</span>
            <CommandShortcut>?J</CommandShortcut>
          </CommandItem>
          <CommandItem value="Sign out logout" onSelect={handleLogoutAction}>
            <LogOut className="size-4 text-primary" />
            <span>Sign out</span>
          </CommandItem>
        </CommandGroup>
        {memberships.length > 1 ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Switch clinic">
              {memberships.map((membership) => (
                <CommandItem
                  key={membership.clientId}
                  value={`${membership.clinicName} ${membership.role}`}
                  onSelect={() => handleClinic(membership.clientId)}
                >
                  <Building2 className="size-4 text-primary" />
                  <div className="flex flex-col">
                    <span>{membership.clinicName}</span>
                    <span className="text-xs capitalize text-muted-foreground">{membership.role}</span>
                  </div>
                  {membership.clientId === selectedClientId ? <CommandShortcut>Current</CommandShortcut> : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}
      </CommandList>
    </CommandDialog>
  );
}
