"use client";

import React from "react";
import { Route, MapPin, CheckCircle2, AlertTriangle } from "lucide-react";
import Header, { type HeaderNavItem } from "../../components/layout/header";
import { OfflineSyncProvider } from "../../components/offline/offline-sync-provider";
import { ServiceWorkerRegister } from "../../components/pwa/service-worker-register";

const DRIVER_TABS: HeaderNavItem[] = [
  { name: "Run sheet",    icon: Route,         href: "/driver" },
  { name: "Current stop", icon: MapPin,        href: "/driver/stops" },
  { name: "Completed",    icon: CheckCircle2,   href: "/driver/pod" },
  { name: "Exceptions",   icon: AlertTriangle,  href: "/driver/exceptions", count: 0 },
];

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <OfflineSyncProvider>
      <ServiceWorkerRegister />
      <Header
        navItems={DRIVER_TABS}
        currentRole="Driver"
        brandName="Waypoint"
        brandSubtitle="Driver"
      />
      {children}
    </OfflineSyncProvider>
  );
}
