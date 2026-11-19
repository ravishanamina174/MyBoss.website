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
  section: string;
};

export const ownerNavigation: NavigationItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    section: "Workspace",
  },
  {
    label: "Tasks",
    href: "/dashboard/tasks",
    icon: ListTodo,
    section: "Operations",
  },
  {
    label: "Staff",
    href: "/dashboard/staff",
    icon: Users,
    section: "Operations",
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
    section: "Insights",
  },
  {
    label: "Business info",
    href: "/dashboard/settings",
    icon: Settings,
    section: "Business",
  },
];

export const staffNavigation: NavigationItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    section: "Workspace",
  },
  {
    label: "My Tasks",
    href: "/dashboard/tasks",
    icon: ListTodo,
    section: "Work",
  },
];
