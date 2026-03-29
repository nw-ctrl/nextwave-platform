"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CreditCard, LogOut, MoonStar, Search, SunMedium, X } from "lucide-react";
import type { PortalMembership } from "@/lib/auth";
import type { PortalNavItem } from "@/lib/portal-navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

type CommandEntry = {
  id: string;
  title: string;
  description: string;
  group: string;
  meta?: string;
  run: () => void | Promise<void>;
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
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const entries = useMemo<CommandEntry[]>(() => {
    const navigation = navItems.map((item) => ({
      id: `nav-${item.key}`,
      title: item.label,
      description: item.description,
      group: "Navigate",
      meta: item.href === "/" ? "GH" : item.href === "/dashboard" ? "GD" : "GB",
      run: () => {
        onOpenChange(false);
        router.push(item.href);
      },
    }));

    const actions: CommandEntry[] = [
      {
        id: "action-billing-settings",
        title: "Open billing settings",
        description: "Manage plan and invoice settings for this clinic account.",
        group: "Actions",
        run: () => {
          onOpenChange(false);
          onOpenBillingSettings();
        },
      },
      {
        id: "action-theme",
        title: "Toggle appearance",
        description: "Switch between light and dark workspace themes.",
        group: "Actions",
        meta: "Ctrl+J",
        run: () => {
          onOpenChange(false);
          onToggleTheme();
        },
      },
      {
        id: "action-signout",
        title: "Sign out",
        description: "End the current portal session.",
        group: "Actions",
        run: async () => {
          onOpenChange(false);
          await onLogout();
        },
      },
    ];

    const clinics = memberships.length > 1
      ? memberships.map((membership) => ({
          id: `clinic-${membership.clientId}`,
          title: membership.clinicName,
          description: `Switch to ${membership.clinicName}.`,
          group: "Clinics",
          meta: membership.clientId === selectedClientId ? "Current" : membership.role,
          run: async () => {
            onOpenChange(false);
            await onSelectClinic(membership.clientId);
          },
        }))
      : [];

    return [...navigation, ...actions, ...clinics];
  }, [navItems, memberships, selectedClientId, onOpenChange, router, onOpenBillingSettings, onToggleTheme, onLogout, onSelectClinic]);

  const filteredEntries = entries.filter((entry) => {
    const haystack = `${entry.title} ${entry.description} ${entry.group} ${entry.meta ?? ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const grouped = filteredEntries.reduce<Record<string, CommandEntry[]>>((acc, entry) => {
    (acc[entry.group] ||= []).push(entry);
    return acc;
  }, {});

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/35 px-4 pt-[12vh] backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-border/70 bg-background shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-border/70 px-4 py-4 sm:px-5">
          <Search className="size-4 text-primary" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search patients, clinics, billing, and commands..."
            className="h-10 flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <Button type="button" variant="ghost" size="icon-sm" className="rounded-xl" onClick={() => onOpenChange(false)}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-3 py-3 sm:px-4">
          {filteredEntries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
              No matching workspace action.
            </div>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group} className="mb-4 last:mb-0">
                <div className="px-2 pb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{group}</div>
                <div className="space-y-2">
                  {items.map((entry) => {
                    const icon = group === "Navigate" ? <Search className="size-4 text-primary" /> : group === "Actions" ? <CreditCard className="size-4 text-primary" /> : <Building2 className="size-4 text-primary" />;
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => void entry.run()}
                        className="flex w-full items-start gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/[0.03]"
                      >
                        <div className="mt-0.5">{entry.id === "action-theme" ? <><MoonStar className="size-4 text-primary dark:hidden" /><SunMedium className="hidden size-4 text-primary dark:block" /></> : entry.id === "action-signout" ? <LogOut className="size-4 text-primary" /> : icon}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{entry.title}</span>
                            {entry.meta ? <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px]">{entry.meta}</Badge> : null}
                          </div>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">{entry.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
