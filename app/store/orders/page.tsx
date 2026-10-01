"use client";

import { useState } from "react";
import Header from "../../../components/layout/header";
import { Button, StatCard } from "../../../components/design-system";
import PlaceOrderForm from "./place-order-form";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Check,
  Clock3,
  Eye,
  LayoutGrid,
  Package,
  Plus,
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

const orderRows = [
  {
    id: "ORD-250614-2901",
    placed: "Today 09:15",
    items: 36,
    volume: "6.2 m³",
    status: "Pending",
    eta: "14 Jun delivery",
    tone: "amber",
  },
  {
    id: "ORD-250613-2835",
    placed: "Yesterday",
    items: 24,
    volume: "4.2 m³",
    status: "Planned",
    eta: "14 Jun 07:00",
    tone: "blue",
  },
  {
    id: "ORD-250612-2791",
    placed: "12 Jun",
    items: 18,
    volume: "3.1 m³",
    status: "Delivered",
    eta: "Delivered 12 Jun",
    tone: "green",
  },
  {
    id: "ORD-250611-2766",
    placed: "11 Jun",
    items: 32,
    volume: "5.6 m³",
    status: "Delivered",
    eta: "Delivered 11 Jun",
    tone: "green",
  },
];

const metricBars = {
  blue: [22, 34, 28, 36, 42, 48, 54],
  green: [18, 26, 30, 36, 42, 38, 48],
  purple: [14, 18, 23, 28, 34, 30, 36],
  orange: [16, 21, 24, 30, 34, 32, 28],
};

export default function OrdersPage() {
  const [placeOrderOpen, setPlaceOrderOpen] = useState(false);

  return (
    <>
      <Header
        navItems={storeNavItems}
        activeHref="/store/orders"
        brandName="Waypoint"
        brandSubtitle="Store Manager"
      />

      <div className="min-h-screen bg-[#E9EDF3] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-[20px] font-extrabold tracking-[-0.04em] text-[#0F1020] sm:text-[28px]">
                My orders
              </h1>
              <p className="mt-1 text-[11px] text-[#747B93]">
                Bambalapitiya Fresh · Order history
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              className="px-4 py-2.5 text-[12px] font-bold"
              onClick={() => setPlaceOrderOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Place order
            </Button>
          </div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5 xl:[&>*]:min-w-[260px]">
            <StatCard
              icon={<Package className="h-4 w-4" />}
              label="Open orders"
              value="2"
              note="1 pending cutoff"
              tone="blue"
              bars={metricBars.blue}
            />
            <StatCard
              icon={<Clock3 className="h-4 w-4" />}
              label="Next delivery"
              value="07:00"
              note="14 June 2025"
              tone="green"
              bars={metricBars.green}
            />
            <StatCard
              icon={<Check className="h-4 w-4" />}
              label="Delivered this month"
              value="8"
              note="100% on time"
              tone="purple"
              bars={metricBars.purple}
            />
            <StatCard
              icon={<AlertTriangle className="h-4 w-4" />}
              label="Order cutoff"
              value="16:00"
              note="Today · 2h 14m left"
              tone="orange"
              bars={metricBars.orange}
            />
          </section>

          <div className="mt-6 overflow-hidden rounded-[14px] border border-black/[0.07] bg-white shadow-[0_2px_12px_rgba(15,16,32,0.07),0_0_0_1px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between border-b border-[#E7EAF0] px-5 py-3.5">
              <div>
                <div className="text-[13px] font-bold text-[#0F1020] leading-tight">
                  Order history
                </div>
                <div className="mt-0.5 text-[10px] text-[#7B7B9D]">
                  All orders for Bambalapitiya Fresh
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="bg-[#F6F7FB] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B7B9D]">
                    <th className="px-4 py-3 font-semibold">Order ID</th>
                    <th className="px-4 py-3 font-semibold">Placed</th>
                    <th className="px-4 py-3 font-semibold">Items</th>
                    <th className="px-4 py-3 font-semibold">Volume</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">ETA</th>
                    <th className="px-4 py-3 text-right font-semibold"> </th>
                  </tr>
                </thead>
                <tbody>
                  {orderRows.map((row) => {
                    const statusClasses = {
                      amber:
                        "bg-[#FFF7ED] text-[#B45309] border border-[#FCD9A7]",
                      blue: "bg-[#EEF4FF] text-[#2463EB] border border-[#D9E8FF]",
                      green:
                        "bg-[#ECFDF5] text-[#047857] border border-[#C7F0DA]",
                    }[row.tone];

                    return (
                      <tr
                        key={row.id}
                        className="border-b border-[#E7EAF0] text-[12px] text-[#0F1020]"
                      >
                        <td className="px-4 py-3 font-medium tracking-[-0.02em] text-[#0F1020]">
                          {row.id}
                        </td>
                        <td className="px-4 py-3 text-[#7B7B9D]">
                          {row.placed}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {row.items} cartons
                        </td>
                        <td className="px-4 py-3 text-[#7B7B9D]">
                          {row.volume}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-[9px] font-bold ${statusClasses}`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#7B7B9D]">{row.eta}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#DDE3EF] bg-white text-[#7B7B9D] transition-colors hover:border-[#C9D5F2] hover:text-[#0F1020]"
                            aria-label={`View ${row.id}`}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {placeOrderOpen && (
        <PlaceOrderForm onClose={() => setPlaceOrderOpen(false)} />
      )}
    </>
  );
}
