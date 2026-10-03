"use client";

import React from "react";
import { Route, MapPin, CheckCircle2, AlertTriangle } from "lucide-react";
import { RoleNavBar } from "../../components/layout/role-nav-bar";
import type { NavTabItem } from "../../lib/types";

const DRIVER_TABS: NavTabItem[] = [
  { id: "run-sheet",    label: "Run sheet",    icon: <Route className="w-3.5 h-3.5" />,         href: "/driver" },
  { id: "current-stop", label: "Current stop", icon: <MapPin className="w-3.5 h-3.5" />,        href: "/driver/stops" },
  { id: "completed",   label: "Completed",    icon: <CheckCircle2 className="w-3.5 h-3.5" />,   href: "/driver/pod" },
  { id: "exceptions",  label: "Exceptions",   icon: <AlertTriangle className="w-3.5 h-3.5" />,  href: "/driver/exceptions", badgeCount: 0 },
];

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RoleNavBar
        tabs={DRIVER_TABS}
        currentRole="Driver"
        userName="Nimal Perera"
        userInitials="NP"
        roleBadgeCount={4}
        notificationCount={1}
      />
      {children}
    </>
  );
}
