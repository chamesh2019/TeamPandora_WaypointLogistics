"use client";

import Header from "../../../components/layout/header";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  LayoutGrid,
  Package,
  Truck,
  TruckIcon,
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

const summaryCards = [
  {
    label: "Orders this month",
    value: "14",
    note: "-2 vs last month",
    tone: "green",
    icon: CheckCircle2,
    bars: [18, 22, 20, 28, 34, 24, 30],
  },
  {
    label: "On-time deliveries",
    value: "93%",
    note: "13 of 14 orders",
    tone: "green",
    icon: Check,
    bars: [16, 20, 24, 28, 32, 30, 36],
  },
  {
    label: "Claims raised",
    value: "1",
    note: "1 resolved",
    tone: "amber",
    icon: AlertTriangle,
    bars: [14, 12, 18, 26, 24, 20, 28],
  },
  {
    label: "Avg lead time",
    value: "1.2 days",
    note: "Order to delivery",
    tone: "blue",
    icon: TruckIcon,
    bars: [18, 22, 28, 30, 27, 36, 32],
  },
];

const monthlyVolume = [
  { month: "Jan", value: 82 },
  { month: "Feb", value: 91 },
  { month: "Mar", value: 76 },
  { month: "Apr", value: 88 },
  { month: "May", value: 94 },
  { month: "Jun", value: 68 },
];

const deliveryPerformance = [
  { label: "On time", value: 3, tone: "green" },
  { label: "Late (>2h)", value: 1, tone: "amber" },
  { label: "Damaged", value: 0, tone: "gray" },
  { label: "Short delivery", value: 1, tone: "red" },
];

export default function ReportsPage() {
  return (
    <>
      <Header
        navItems={storeNavItems}
        activeHref="/store/reports"
        brandName="Waypoint"
        brandSubtitle="Store Manager"
      />

      <div className="min-h-screen bg-[#E9EDF3] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-5">
            <h1 className="text-[20px] font-extrabold tracking-[-0.04em] text-[#0F1020] sm:text-[28px]">
              Reports
            </h1>
            <p className="mt-1 text-[11px] text-[#747B93]">
              Order and delivery performance · Bambalapitiyya Fresh
            </p>
          </div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5 xl:[&>*]:min-w-[240px]">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              const toneClasses = {
                green: {
                  badge: "bg-[#EAF9F1] text-[#10B981]",
                  bar: "bg-[#A7E4C4]",
                  active: "bg-[#3ECF8E]",
                },
                amber: {
                  badge: "bg-[#FFF4DF] text-[#F59E0B]",
                  bar: "bg-[#F1D39A]",
                  active: "bg-[#F5C542]",
                },
                blue: {
                  badge: "bg-[#EAF4FF] text-[#3B82F6]",
                  bar: "bg-[#BFD8FF]",
                  active: "bg-[#5AA1FF]",
                },
              }[card.tone];

              return (
                <div
                  key={card.label}
                  className="rounded-[14px] border border-black/[0.07] bg-white p-4 shadow-[0_2px_12px_rgba(15,16,32,0.05)]"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-[#7B7B9D]">
                      {card.label}
                    </span>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-[9px] ${toneClasses.badge}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="text-[18px] font-extrabold tracking-[-0.04em] text-[#0F1020] sm:text-[20px]">
                    {card.value}
                  </div>
                  <div className="mt-1 text-[10px] text-[#7B7B9D]">{card.note}</div>

                  <div className="mt-3 flex h-[32px] items-end gap-[3px]">
                    {card.bars.map((bar, index) => (
                      <div
                        key={`${card.label}-${index}`}
                        className={`flex-1 rounded-t-[3px] ${index === card.bars.length - 1 ? toneClasses.active : toneClasses.bar}`}
                        style={{ height: `${Math.max(20, bar)}%` }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1.7fr_1fr]">
            <div className="overflow-hidden rounded-[14px] border border-black/[0.07] bg-white shadow-[0_2px_12px_rgba(15,16,32,0.06)]">
              <div className="px-4 py-3">
                <div className="text-[13px] font-bold text-[#0F1020]">Monthly order volume</div>
                <div className="mt-0.5 text-[10px] text-[#7B7B9D]">Cartons ordered per month</div>
              </div>

              <div className="px-4 pb-4">
                <div className="flex h-[180px] items-end gap-5 px-3 pb-3 pt-4">
                  {monthlyVolume.map((item) => (
                    <div key={item.month} className="flex flex-1 flex-col items-center justify-end gap-2">
                      <div className="flex h-[120px] w-full items-end justify-center">
                        <div
                          className="w-full rounded-t-[8px] bg-[#DDEAFD] shadow-[inset_0_-1px_0_rgba(0,0,0,0.04)]"
                          style={{ height: `${item.value}%` }}
                        />
                      </div>
                      <div className="text-[10px] font-medium text-[#7B7B9D]">{item.month}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[14px] border border-black/[0.07] bg-white shadow-[0_2px_12px_rgba(15,16,32,0.06)]">
              <div className="px-4 py-3">
                <div className="text-[13px] font-bold text-[#0F1020]">Delivery performance</div>
                <div className="mt-0.5 text-[10px] text-[#7B7B9D]">Last 14 deliveries</div>
              </div>

              <div className="space-y-3 px-4 pb-4 pt-1">
                {deliveryPerformance.map((item) => {
                  const barMax = 14;
                  const fillWidth = item.value === 0 ? 6 : (item.value / barMax) * 100;
                  const toneClasses = {
                    green: "bg-[#4BC59C]",
                    amber: "bg-[#F3B552]",
                    gray: "bg-[#DDE2EC]",
                    red: "bg-[#F36A6A]",
                  }[item.tone];

                  return (
                    <div key={item.label} className="flex items-center gap-3 text-[12px] text-[#0F1020]">
                      <span className="w-[110px] text-[#4B5163]">{item.label}</span>

                      <div className="flex flex-1 items-center gap-2">
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#F0F3F8]">
                          <div
                            className={`h-full rounded-full ${toneClasses}`}
                            style={{ width: `${Math.max(fillWidth, item.value === 0 ? 8 : 12)}%` }}
                          />
                        </div>
                        <span className="min-w-[18px] text-right text-[10px] font-semibold text-[#4B5163]">
                          {item.value}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
