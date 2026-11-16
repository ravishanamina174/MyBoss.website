import {
  LayoutDashboard,
  ListTodo,
  Users,
  Settings,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const ownerNavigation: NavigationItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Tasks",
    href: "/dashboard/tasks",
    icon: ListTodo,
  },
  {
    label: "Staff",
    href: "/dashboard/staff",
    icon: Users,
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    label: "Business info",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export const staffNavigation: NavigationItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Tasks",
    href: "/dashboard/tasks",
    icon: ListTodo,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];