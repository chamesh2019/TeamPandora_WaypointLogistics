"use client";

import Header from "../../../components/layout/header";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Check,
  LayoutGrid,
  Package,
  Truck,
} from "lucide-react";

const storeNavItems = [
  { name: "Overview", href: "/store", icon: LayoutGrid },
  { name: "Orders", href: "/store/orders", icon: Package },
  { name: "Incoming", href: "/store/incoming", icon: Truck },
  { name: "Receipts", href: "/store/receipts", icon: Check },
  { name: "Claims", href: "/store/claims", icon: AlertTriangle },
  { name: "Deferrals", href: "/store/deferrals", icon: Calendar },
  { name: "Reports", href: "/store/reports", icon: BarChart3 },
];

export default function IncomingPage() {
  return (
    <>
      <Header
        navItems={storeNavItems}
        activeHref="/store/incoming"
        brandName="Waypoint"
        brandSubtitle="Store Manager"
      />

      <div className="min-h-screen bg-[#ECEEF5] p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-extrabold tracking-[-0.04em] text-[#0F1020]">
            Incoming
          </h1>
        </div>
      </div>
    </>
  );
}
