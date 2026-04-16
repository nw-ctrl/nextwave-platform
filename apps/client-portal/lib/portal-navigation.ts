import type { LucideIcon } from "lucide-react";
import { CreditCard, FileText, Home, Plus, Settings, UserRoundSearch, UsersRound } from "lucide-react";
import type { PortalMembership, PortalSession } from "./auth";

export type PortalNavItem = {
  key: string;
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
  moduleKey?: string;
  adminOnly?: boolean;
};

const portalNavItems: PortalNavItem[] = [
  {
    key: "home",
    label: "Dashboard",
    href: "/",
    description: "Clinical overview and quick actions.",
    icon: Home,
  },
  {
    key: "patients",
    label: "Patients",
    href: "/patients",
    description: "Search, open, and manage clinic patients.",
    icon: UserRoundSearch,
  },
  {
    key: "new-patient",
    label: "New Patient",
    href: "/patients/new",
    description: "Register a new patient record.",
    icon: Plus,
  },
  {
    key: "templates",
    label: "Templates",
    href: "/templates",
    description: "Diagnosis and prescription templates.",
    icon: FileText,
  },
  {
    key: "billing",
    label: "Billing",
    href: "/billing",
    description: "Plan status, invoices, and billing settings.",
    icon: CreditCard,
    moduleKey: "billing",
    adminOnly: true,
  },
  {
    key: "doctors",
    label: "Doctors",
    href: "/doctors",
    description: "Administrative doctor access controls.",
    icon: UsersRound,
    adminOnly: true,
  },
  {
    key: "settings",
    label: "Settings",
    href: "/settings",
    description: "System-level clinic workspace configuration.",
    icon: Settings,
    adminOnly: true,
  },
];

export function getPortalNavItems(session: PortalSession, membership: PortalMembership) {
  const adminVisible = session.user.role === "admin" || membership.role === "admin" || membership.role === "manager";

  return portalNavItems.filter((item) => {
    if (item.adminOnly && !adminVisible) {
      return false;
    }

    if (!item.moduleKey) {
      return true;
    }

    return membership.modules.length === 0 || membership.modules.includes(item.moduleKey);
  });
}

