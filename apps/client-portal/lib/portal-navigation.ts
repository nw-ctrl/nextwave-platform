import type { LucideIcon } from "lucide-react";
import { CreditCard, Home, LayoutDashboard, Settings, UsersRound } from "lucide-react";
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
    label: "Home",
    href: "/",
    description: "Clinical workspace overview and clinic context.",
    icon: Home,
  },
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    description: "Account-level dashboard and quick operational summary.",
    icon: LayoutDashboard,
  },
  {
    key: "billing",
    label: "Subscription",
    href: "/billing",
    description: "Plan status, invoices, and billing settings.",
    icon: CreditCard,
    moduleKey: "billing",
    adminOnly: true,
  },
  {
    key: "doctors",
    label: "Manage Doctors",
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
