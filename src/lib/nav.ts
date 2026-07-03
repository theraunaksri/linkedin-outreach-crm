import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Activity,
  PhoneCall,
  Bell,
  Video,
  FileText,
  FileSignature,
  BarChart3,
  Scale,
  Gauge,
  ListChecks,
} from "lucide-react";

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
  { href: "/activity", label: "Activity Tracker", icon: Activity, ready: false },
  { href: "/calls", label: "Calls", icon: PhoneCall, ready: false },
  { href: "/follow-ups", label: "Follow-ups", icon: Bell, ready: false },
  { href: "/discovery", label: "Discovery Calls", icon: Video, ready: false },
  { href: "/proposals", label: "Proposals", icon: FileText, ready: false },
  { href: "/contracts", label: "Contracts", icon: FileSignature, ready: false },
  { href: "/comparison", label: "Account Comparison", icon: Scale, ready: false },
  { href: "/analytics", label: "Analytics", icon: BarChart3, ready: true },
  { href: "/productivity", label: "Productivity", icon: Gauge, ready: false },
  { href: "/tasks", label: "Tasks", icon: ListChecks, ready: false },
];
