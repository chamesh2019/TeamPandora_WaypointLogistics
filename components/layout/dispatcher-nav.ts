import {
  LayoutDashboard,
  ClipboardList,
  GitFork,
  Route,
  Truck,
  Radio,
  AlertTriangle,
  Users,
  BarChart3,
  Sparkles,
} from "lucide-react";
import type { HeaderNavItem } from "./header";

export const dispatcherNavItems: HeaderNavItem[] = [
  {
    name: "Overview",
    href: "/dispatcher",
    icon: LayoutDashboard,
  },
  {
    name: "Orders",
    href: "/dispatcher/orders",
    icon: ClipboardList,
    count: 12,
  },
  {
    name: "Allocation",
    href: "/dispatcher/allocation",
    icon: GitFork,
  },
  {
    name: "Trip planning",
    href: "/dispatcher/trip-planning",
    icon: Route,
  },
  {
    name: "Fleet",
    href: "/dispatcher/fleet",
    icon: Truck,
  },
  {
    name: "Live Routes",
    href: "/dispatcher/live-routes",
    icon: Radio,
  },
  {
    name: "Exceptions",
    href: "/dispatcher/exceptions",
    icon: AlertTriangle,
    count: 3,
  },
  {
    name: "Users",
    href: "/dispatcher/users",
    icon: Users,
  },
  {
    name: "Reports",
    href: "/dispatcher/reports",
    icon: BarChart3,
  },
  {
    name: "Forecast",
    href: "/dispatcher/forecast",
    icon: Sparkles,
  },
];
