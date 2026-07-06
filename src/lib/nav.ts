import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Users, KanbanSquare, BarChart3 } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  ready: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, ready: true },
  { href: "/leads", label: "CRM / Leads", icon: Users, ready: true },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare, ready: true },
  { href: "/analytics", label: "Analytics", icon: BarChart3, ready: true },
];
