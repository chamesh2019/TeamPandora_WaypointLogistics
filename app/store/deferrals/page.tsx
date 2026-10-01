"use client";

import Header from "../../../components/layout/header";
import { Button } from "../../../components/design-system";
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

const summaryCards = [
  {
    label: "Deferred this month",
    value: "3",
    note: "All rescheduled",
    tone: "amber",
    icon: AlertTriangle,
    bars: [14, 18, 22, 20, 28, 27, 36],
  },
  {
    label: "Consecutive skips",
    value: "2",
    note: "Current run · Priority boosted",
    tone: "rose",
    icon: Calendar,
    bars: [18, 26, 22, 30, 27, 35, 42],
  },
  {
    label: "Avg delay",
    value: "1.4 days",
    note: "Between skip and serve",
    tone: "blue",
    icon: Clock3,
    bars: [14, 18, 26, 24, 34, 38, 42],
  },
  {
    label: "Resolved deferrals",
    value: "8",
    note: "Last 30 days",
    tone: "green",
    icon: Check,
    bars: [12, 24, 20, 32, 28, 39, 44],
  },
];

const deferHistory = [
  {
    order: "ORD-25601-2691",
    requested: "13 Jun",
    deferredOn: "13 Jun",
    routeCause: "First at capacity",
    dispatchNotes:
      "All reefer vehicles at capacity. Fresh Colombo district oversubscribed.",
    skips: 2,
    priorityBoost: -2,
    priorityLevel: "High priority",
    priorityTone: "amber",
  },
  {
    order: "ORD-25610-2711",
    requested: "10 Jun",
    deferredOn: "10 Jun",
    routeCause: "Time budget exceeded",
    dispatchNotes: "Combined trip twice exceeded 270-minute fresh window.",
    skips: 1,
    priorityBoost: -1,
    priorityLevel: "Priority",
    priorityTone: "yellow",
  },
  {
    order: "ORD-25606-2634",
    requested: "8 Jun",
    deferredOn: "8 Jun",
    routeCause: "No reefer vehicle",
    dispatchNotes: "No refrigerated van available for van-only outlet access.",
    skips: 0,
    priorityBoost: 0,
    priorityLevel: "Normal",
    priorityTone: "green",
  },
];

const priorityCards = [
  {
    title: "First skip",
    tag: "+1 priority",
    tone: "purple",
    text: "Your next order is placed ahead of same-priority orders in the allocation queue.",
  },
  {
    title: "Second skip",
    tag: "+2 priority",
    tone: "amber",
    text: "Skipping priority — allocated before standard orders in your district.",
  },
  {
    title: "Third + skip",
    tag: "+3 or escalated",
    tone: "red",
    text: "Management escalation trigger. Dispatcher must provide justification.",
  },
];

export default function DeferralsPage() {
  return (
    <>
      <Header
        navItems={storeNavItems}
        activeHref="/store/deferrals"
        brandName="Waypoint"
        brandSubtitle="Store Manager"
      />

      <div className="min-h-screen bg-[#E9EDF3] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-[20px] font-extrabold tracking-[-0.04em] text-[#0F1020] sm:text-[28px]">
                Deferrals
              </h1>
              <p className="mt-1 text-[11px] text-[#747B93]">
                Orders skipped due to fleet constraints · Bambalapitiyya Fresh
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="gap-2 px-3 py-2 text-[11px] font-semibold"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5 xl:[&>*]:min-w-[240px]">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              const toneClasses = {
                amber: {
                  badge: "bg-[#FFF3DF] text-[#F59E0B]",
                  bar: "bg-[#F5D59A]",
                  active: "bg-[#F5C542]",
                },
                rose: {
                  badge: "bg-[#FDE7E7] text-[#F25B5B]",
                  bar: "bg-[#F7C4C4]",
                  active: "bg-[#F25B5B]",
                },
                blue: {
                  badge: "bg-[#EAF4FF] text-[#3B82F6]",
                  bar: "bg-[#BBD8FF]",
                  active: "bg-[#5AA1FF]",
                },
                green: {
                  badge: "bg-[#EAFAF3] text-[#10B981]",
                  bar: "bg-[#9DE7C5]",
                  active: "bg-[#3ECF8E]",
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
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-[9px] ${toneClasses.badge}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="text-[18px] font-extrabold tracking-[-0.04em] text-[#0F1020] sm:text-[20px]">
                    {card.value}
                  </div>
                  <div className="mt-1 text-[10px] text-[#7B7B9D]">
                    {card.note}
                  </div>

                  <div className="mt-3 flex h-[32px] items-end gap-[3px]">
                    {card.bars.map((bar, index) => (
                      <div
                        key={`${card.label}-${index}`}
                        className={`flex-1 rounded-t-[3px] ${index === card.bars.length - 1 ? toneClasses.active : toneClasses.bar}`}
                        style={{ height: `${Math.max(18, bar)}%` }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          <div className="mt-5 flex items-center gap-2 rounded-[10px] border border-[#D7E6F3] bg-[#EDF5FF] px-3 py-2 text-[11px] text-[#5A6B7C]">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#F7E7C3] text-[#D97706]">
              <AlertTriangle className="h-2.5 w-2.5" />
            </span>
            Anti-station priority active: Your next order will be served first
            due to 2 consecutive skips.
          </div>

          <div className="mt-6 overflow-hidden rounded-[14px] border border-black/[0.07] bg-white shadow-[0_2px_12px_rgba(15,16,32,0.06)]">
            <div className="px-4 py-3">
              <div className="text-[13px] font-bold text-[#0F1020]">
                Deferal history
              </div>
              <div className="mt-0.5 text-[10px] text-[#7B7B9D]">
                Orders that could not be dispatched on the requested date
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="bg-[#F7F8FB] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B7B9D]">
                    <th className="px-4 py-3 font-semibold">Order</th>
                    <th className="px-4 py-3 font-semibold">Requested</th>
                    <th className="px-4 py-3 font-semibold">Deferred on</th>
                    <th className="px-4 py-3 font-semibold">Route cause</th>
                    <th className="px-4 py-3 font-semibold">Dispatch notes</th>
                    <th className="px-4 py-3 font-semibold">Consec. skips</th>
                    <th className="px-4 py-3 font-semibold">Priority boost</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {deferHistory.map((row) => (
                    <tr
                      key={row.order}
                      className="border-t border-[#E7EAF0] text-[12px] text-[#0F1020]"
                    >
                      <td className="px-4 py-3 font-medium">{row.order}</td>
                      <td className="px-4 py-3 text-[#51576D]">
                        {row.requested}
                      </td>
                      <td className="px-4 py-3 text-[#51576D]">
                        {row.deferredOn}
                      </td>
                      <td className="px-4 py-3 text-[#51576D]">
                        {row.routeCause}
                      </td>
                      <td className="px-4 py-3 text-[#51576D]">
                        {row.dispatchNotes}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex min-w-[22px] justify-center rounded-full bg-[#F3F6FA] px-1.5 py-0.5 font-semibold text-[#0F1020]">
                          {row.skips}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex min-w-[22px] justify-center rounded-full px-1.5 py-0.5 font-semibold ${
                            row.priorityBoost > 0
                              ? "bg-[#F5F3FF] text-[#7C3AED]"
                              : row.priorityBoost < 0
                                ? "bg-[#FFF7D6] text-[#D97706]"
                                : "bg-[#F3F6FA] text-[#0F1020]"
                          }`}
                        >
                          {row.priorityBoost > 0
                            ? `+${row.priorityBoost}`
                            : row.priorityBoost}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                            row.priorityTone === "amber"
                              ? "bg-[#FFF1D6] text-[#C77A00]"
                              : row.priorityTone === "yellow"
                                ? "bg-[#FFF8D8] text-[#B7791F]"
                                : "bg-[#EAFBEE] text-[#1A8A57]"
                          }`}
                        >
                          {row.priorityLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[14px] border border-black/[0.07] bg-white shadow-[0_2px_12px_rgba(15,16,32,0.06)]">
            <div className="px-4 py-3">
              <div className="text-[13px] font-bold text-[#0F1020]">
                How priority boost works
              </div>
            </div>

            <div className="grid gap-4 border-t border-[#E7EAF0] p-4 md:grid-cols-3">
              {priorityCards.map((card) => (
                <div
                  key={card.title}
                  className={`rounded-[10px] border px-4 py-3 ${
                    card.tone === "purple"
                      ? "border-[#E4D8FF] bg-[#F5F0FF]"
                      : card.tone === "amber"
                        ? "border-[#F5E5B2] bg-[#FFF8E8]"
                        : "border-[#FFDADA] bg-[#FFF2F2]"
                  }`}
                >
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B7B9D]">
                    First skip
                  </div>
                  <div className="mt-2 text-[14px] font-extrabold tracking-[-0.04em] text-[#0F1020]">
                    {card.tag}
                  </div>
                  <div className="mt-2 text-[11px] leading-5 text-[#4B5163]">
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
