"use client";

import Header from "../../../components/layout/header";
import { Button } from "../../../components/design-system";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Check,
  Clock3,
  LayoutGrid,
  Package,
  ShieldAlert,
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

const summaryStats = [
  {
    label: "Pending sign-off",
    value: "2",
    sub: "Confirm to close",
    tone: "amber",
    icon: Check,
    bars: [30, 26, 35, 45, 52, 59, 40],
  },
  {
    label: "Confirmed this month",
    value: "8",
    sub: "No discrepancies",
    tone: "green",
    icon: Check,
    bars: [24, 34, 42, 58, 55, 60, 72],
  },
  {
    label: "With discrepancies",
    value: "1",
    sub: "Shortfall noted",
    tone: "purple",
    icon: ShieldAlert,
    bars: [18, 27, 32, 41, 48, 60, 50],
  },
  {
    label: "Avg confirmation",
    value: "4h 12m",
    sub: "Time after delivery",
    tone: "blue",
    icon: Clock3,
    bars: [28, 30, 45, 52, 60, 48, 64],
  },
];

const pendingReceipts = [
  {
    id: "ORD-250611-1842",
    date: "Delivered 11 Jun · 09:14",
    cartons: "24 cartons",
    driver: "R. Silva",
  },
  {
    id: "ORD-250612-1910",
    date: "Delivered 12 Jun · 07:48",
    cartons: "12 cartons",
    driver: "N. Perera",
  },
];

export default function ReceiptsPage() {
  return (
    <>
      <Header
        navItems={storeNavItems}
        activeHref="/store/receipts"
        brandName="Waypoint"
        brandSubtitle="Store Manager"
      />

      <div className="min-h-screen bg-[#E9EDF3] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-5">
            <h1 className="text-[20px] font-extrabold tracking-[-0.04em] text-[#0F1020] sm:text-[28px]">
              Receipts
            </h1>
            <p className="mt-1 text-[11px] text-[#747B93]">
              Deliveries awaiting your confirmation
            </p>
          </div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5 xl:[&>*]:min-w-[240px]">
            {summaryStats.map((item) => {
              const Icon = item.icon;
              const toneMap = {
                amber: {
                  box: "bg-[#FFF7E8] text-[#F59E0B]",
                  bar: "bg-[#F8E5B2]",
                  active: "bg-[#F5C542]",
                },
                green: {
                  box: "bg-[#E9F9F1] text-[#10B981]",
                  bar: "bg-[#CEF1DE]",
                  active: "bg-[#10B981]",
                },
                purple: {
                  box: "bg-[#F2EAFF] text-[#7C3AED]",
                  bar: "bg-[#E2D4FF]",
                  active: "bg-[#7C3AED]",
                },
                blue: {
                  box: "bg-[#EEF4FF] text-[#4B8EF5]",
                  bar: "bg-[#CFE1FF]",
                  active: "bg-[#4B8EF5]",
                },
              }[item.tone];

              return (
                <div
                  key={item.label}
                  className="rounded-[14px] border border-black/[0.07] bg-white p-4 shadow-[0_2px_12px_rgba(15,16,32,0.07)]"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-[#7B7B9D]">
                      {item.label}
                    </span>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-[9px] ${toneMap.box}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="text-[18px] font-extrabold tracking-[-0.04em] text-[#0F1020]">
                    {item.value}
                  </div>
                  <div className="mt-1 text-[10px] text-[#7B7B9D]">
                    {item.sub}
                  </div>

                  <div className="mt-3 flex h-[34px] items-end gap-[3px]">
                    {item.bars.map((bar, idx) => (
                      <div
                        key={`${item.label}-${idx}`}
                        className={`flex-1 rounded-t-[3px] ${idx === item.bars.length - 1 ? toneMap.active : toneMap.bar}`}
                        style={{ height: `${Math.max(14, bar)}%` }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          <div className="mt-6 overflow-hidden rounded-[14px] border border-black/[0.07] bg-white shadow-[0_2px_12px_rgba(15,16,32,0.07),0_0_0_1px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between border-b border-[#E7EAF0] px-5 py-3.5">
              <div>
                <div className="text-[13px] font-bold text-[#0F1020] leading-tight">
                  Pending receipts
                </div>
                <div className="mt-0.5 text-[10px] text-[#7B7B9D]">
                  Confirm carton count and condition
                </div>
              </div>

              <span className="inline-flex items-center rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[9px] font-bold text-[#EF4444]">
                {pendingReceipts.length}
              </span>
            </div>

            <div className="divide-y divide-[#E7EAF0]">
              {pendingReceipts.map((receipt, idx) => (
                <div
                  key={receipt.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B7B9D]">
                      {receipt.date}
                    </div>
                    <div className="mt-1 text-[15px] font-extrabold tracking-[-0.04em] text-[#0F1020]">
                      {receipt.id}
                    </div>
                    <div className="mt-1 text-[10px] text-[#7B7B9D]">
                      {receipt.cartons} · Driver: {receipt.driver}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="min-h-[28px] px-2.5 py-1 text-[9px] font-semibold text-[#7B7B9D] hover:bg-[#F5F6FB] hover:text-[#0F1020]"
                    >
                      Review
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      className="min-h-[30px] px-3 py-1.5 text-[10px] font-bold"
                    >
                      Confirm
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
