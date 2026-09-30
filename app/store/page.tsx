"use client";

import Header from "../../components/layout/header";
import {
  Button,
  StatusBadge,
  BrandTag,
  RoleHeaderBadge,
  CutoffChip,
  KpiChip,
  StatCard,
  Panel,
  PanelHeader,
  CountPill,
  DarkSection,
  DarkSectionHeader,
  DarkRow,
  DonutGauge,
} from "../../components/design-system";
import {
  LayoutGrid,
  Package,
  Truck,
  Check,
  AlertTriangle,
  Calendar,
  BarChart3,
} from "lucide-react";

const storeNavItems = [
  { name: "Overview", href: "/store", icon: LayoutGrid },
  { name: "Orders", href: "/store/orders", icon: Package },
  { name: "Incoming", href: "/store/incoming", icon: Truck },
  { name: "Receipts", href: "/store/Receipts", icon: Check },
  { name: "Claims", href: "/store/claims", icon: AlertTriangle },
  { name: "Deferrals", href: "/store/deferrals", icon: Calendar },
  { name: "Reports", href: "/store/reports", icon: BarChart3 },
];

export default function StorePage() {
  return (
    <>
      <Header
        navItems={storeNavItems}
        activeHref="/store"
        brandName="Waypoint"
        brandSubtitle="Store Manager"
      />
    </>
  );
}
