import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Users } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  ready: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, ready: true },
  { href: "/leads", label: "Leads", icon: Users, ready: true },
];
