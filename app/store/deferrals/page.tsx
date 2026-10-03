"use client";

import Header from "../../../components/layout/header";
import { Button, StatCard } from "../../../components/design-system";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Check,
  Clock3,
  Download,
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

const deferHistory = [
  {
    order: "ORD-250613-2901",
    requested: "13 Jun",
    deferredOn: "13 Jun",
    rootCause: "Fleet at capacity",
    rootCauseTone: "orange",
    dispatchNotes:
      "All reefer vehicles at capacity. Fresh Colombo district oversubscribed.",
    consecSkips: 2,
    priorityBoost: "+2",
    status: "High priority",
    statusTone: "red",
  },
  {
    order: "ORD-250610-2711",
    requested: "10 Jun",
    deferredOn: "10 Jun",
    rootCause: "Time budget exceeded",
    rootCauseTone: "purple",
    dispatchNotes: "Combined trip time would exceed 270-minute Fresh window.",
    consecSkips: 1,
    priorityBoost: "+1",
    status: "Priority",
    statusTone: "orange",
  },
  {
    order: "ORD-250608-2634",
    requested: "08 Jun",
    deferredOn: "08 Jun",
    rootCause: "No reefer vehicle",
    rootCauseTone: "green",
    dispatchNotes: "No refrigerated van available for van-only outlet access.",
    consecSkips: 0,
    priorityBoost: "+0",
    status: "Normal",
    statusTone: "green",
  },
];

const rootCauseStyles: Record<string, string> = {
  orange:
    "bg-[#FFF3E0] text-[#E65100] border border-[#FFB74D]/40",
  purple:
    "bg-[#F3E5F5] text-[#7B1FA2] border border-[#CE93D8]/40",
  green:
    "bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]/40",
};

const statusStyles: Record<string, string> = {
  red: "bg-[#FFEBEE] text-[#C62828] border border-[#EF9A9A]/40",
  orange: "bg-[#FFF8E1] text-[#E65100] border border-[#FFD54F]/40",
  green: "bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]/40",
};

const priorityBoostStyles: Record<string, string> = {
  "+2": "bg-[#EDE7F6] text-[#4527A0]",
  "+1": "bg-[#EDE7F6] text-[#4527A0]",
  "+0": "bg-[#F5F5F5] text-[#616161]",
};

const priorityCards = [
  {
    skipLabel: "FIRST SKIP",
    tag: "+1 priority",
    tagColor: "text-[#5C35C9]",
    text: "Your next order is placed ahead of same-priority peers in the allocation queue.",
    border: "border-[#D1C4E9] bg-[#F5F0FF]",
  },
  {
    skipLabel: "SECOND SKIP",
    tag: "+2 priority",
    tagColor: "text-[#5C35C9]",
    text: "Strong priority — allocated before standard orders in your district.",
    border: "border-[#D1C4E9] bg-[#F5F0FF]",
  },
  {
    skipLabel: "THIRD+ SKIP",
    tag: "+3 or escalated",
    tagColor: "text-[#5C35C9]",
    text: "Management escalation trigger. Dispatcher must provide justification.",
    border: "border-[#D1C4E9] bg-[#F5F0FF]",
  },
];

export default function DeferralsPage() {
  return (
    <>
      <Header
        navItems={storeNavItems}
        activeHref="/store/deferrals"
        brandName="Waypoint"
        brandSubtitle="CONTROL"
      />

      <div className="min-h-screen bg-[#ECEEF5] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">

          {/* Page title row */}
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[26px] font-extrabold tracking-[-0.03em] text-[#0F1020]">
                Deferrals
              </h1>
              <p className="mt-0.5 text-[12px] text-[#7B7B9D]">
                Orders skipped due to fleet constraints · Bambalapitiya Fresh
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </div>

          {/* KPI Stat Cards */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Deferred this month"
              value="3"
              note="All rescheduled"
              tone="yellow"
              icon={<AlertTriangle className="h-4 w-4" />}
              bars={[14, 18, 22, 20, 26, 22, 36]}
            />
            <StatCard
              label="Consecutive skips"
              value="2"
              note="Current run · Priority boosted"
              tone="red"
              icon={<Calendar className="h-4 w-4" />}
              bars={[18, 26, 22, 30, 27, 33, 42]}
            />
            <StatCard
              label="Avg delay"
              value="1.4 days"
              note="Between skip and serve"
              tone="blue"
              icon={<Clock3 className="h-4 w-4" />}
              bars={[14, 18, 26, 24, 34, 38, 42]}
            />
            <StatCard
              label="Resolved deferrals"
              value="8"
              note="Last 30 days"
              tone="green"
              icon={<Check className="h-4 w-4" />}
              bars={[12, 24, 20, 32, 28, 39, 44]}
            />
          </section>

          {/* Anti-starvation alert banner */}
          <div className="mt-5 flex items-center gap-2 rounded-[10px] border border-[#F5C542]/40 bg-[#FFFBE6] px-3 py-2.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#D97706]" />
            <p className="text-[11px] font-medium text-[#92540A]">
              <span className="font-bold">Anti-starvation priority active</span>
              {" · Your next order will be served first due to 2 consecutive skips"}
            </p>
          </div>

          {/* Deferral History Table */}
          <div className="mt-6 overflow-hidden rounded-[14px] border border-black/[0.07] bg-white shadow-[0_2px_12px_rgba(15,16,32,0.06)]">
            <div className="px-5 py-4">
              <div className="text-[14px] font-bold text-[#0F1020]">
                Deferral history
              </div>
              <div className="mt-0.5 text-[11px] text-[#7B7B9D]">
                Orders that could not be dispatched on the requested date
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="bg-[#F7F8FB] text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7B7B9D]">
                    <th className="border-t border-[#E7EAF0] px-5 py-3 font-semibold">
                      Order
                    </th>
                    <th className="border-t border-[#E7EAF0] px-5 py-3 font-semibold">
                      Requested
                    </th>
                    <th className="border-t border-[#E7EAF0] px-5 py-3 font-semibold">
                      Deferred On
                    </th>
                    <th className="border-t border-[#E7EAF0] px-5 py-3 font-semibold">
                      Root Cause
                    </th>
                    <th className="border-t border-[#E7EAF0] px-5 py-3 font-semibold">
                      Dispatcher Notes
                    </th>
                    <th className="border-t border-[#E7EAF0] px-5 py-3 font-semibold">
                      Consec. Skips
                    </th>
                    <th className="border-t border-[#E7EAF0] px-5 py-3 font-semibold">
                      Priority Boost
                    </th>
                    <th className="border-t border-[#E7EAF0] px-5 py-3 font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {deferHistory.map((row) => (
                    <tr
                      key={row.order}
                      className="border-t border-[#E7EAF0] text-[12px] text-[#0F1020] transition-colors hover:bg-[#F7F8FB]"
                    >
                      <td className="px-5 py-3.5 font-medium">{row.order}</td>
                      <td className="px-5 py-3.5 text-[#51576D]">
                        {row.requested}
                      </td>
                      <td className="px-5 py-3.5 text-[#51576D]">
                        {row.deferredOn}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${rootCauseStyles[row.rootCauseTone]}`}
                        >
                          {row.rootCause}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[#51576D] max-w-[280px]">
                        {row.dispatchNotes}
                      </td>
                      <td className="px-5 py-3.5 text-center font-semibold text-[#0F1020]">
                        {row.consecSkips}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex min-w-[34px] justify-center rounded-full px-2 py-1 text-[10px] font-bold ${priorityBoostStyles[row.priorityBoost] ?? "bg-[#F3F6FA] text-[#0F1020]"}`}
                        >
                          {row.priorityBoost}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[row.statusTone]}`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* How Priority Boost Works */}
          <div className="mt-6 overflow-hidden rounded-[14px] border border-black/[0.07] bg-white shadow-[0_2px_12px_rgba(15,16,32,0.06)]">
            <div className="px-5 py-4">
              <div className="text-[14px] font-bold text-[#0F1020]">
                How priority boost works
              </div>
            </div>

            <div className="grid gap-4 border-t border-[#E7EAF0] p-5 md:grid-cols-3">
              {priorityCards.map((card) => (
                <div
                  key={card.skipLabel}
                  className={`rounded-[10px] border px-4 py-4 ${card.border}`}
                >
                  <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#7B7B9D]">
                    {card.skipLabel}
                  </div>
                  <div className={`mt-2 text-[15px] font-extrabold tracking-[-0.03em] ${card.tagColor}`}>
                    {card.tag}
                  </div>
                  <div className="mt-2 text-[11px] leading-[1.6] text-[#4B5163]">
                    {card.text}
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
