"use client";

import Header from "../../../components/layout/header";
import { Button } from "../../../components/design-system";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Check,
  Clock3,
  FileText,
  LayoutGrid,
  Package,
  Plus,
  Eye,
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
    label: "Open claims",
    value: "1",
    note: "Under review",
    tone: "amber",
    icon: AlertTriangle,
    bars: [16, 18, 22, 24, 35, 28, 42],
  },
  {
    label: "Resolved this month",
    value: "3",
    note: "Avg 4 days resolution",
    tone: "green",
    icon: Check,
    bars: [18, 21, 19, 32, 36, 41, 38],
  },
  {
    label: "Total claimed",
    value: "LKR 12,400",
    note: "This quarter",
    tone: "purple",
    icon: FileText,
    bars: [12, 20, 24, 29, 36, 33, 41],
  },
  {
    label: "Oldest open claim",
    value: "3 days",
    note: "CLM-25601-0004",
    tone: "blue",
    icon: Clock3,
    bars: [18, 32, 24, 36, 44, 39, 52],
  },
];

const claimHistory = [
  {
    id: "CLM-25601-0004",
    orderRef: "ORD-25610-2744",
    type: "Short delivery",
    detail: "Received 18 of 24 cartons ordered",
    raised: "10 Jun",
    status: "Under review",
    statusTone: "amber",
  },
  {
    id: "CLM-25601-0002",
    orderRef: "ORD-25601-2691",
    type: "Cargo damage",
    detail: "4 cartons crushed · Credit issued",
    raised: "1 Jun",
    status: "Resolved",
    statusTone: "green",
  },
];

export default function ClaimsPage() {
  return (
    <>
      <Header
        navItems={storeNavItems}
        activeHref="/store/claims"
        brandName="Waypoint"
        brandSubtitle="Store Manager"
      />

      <div className="min-h-screen bg-[#E9EDF3] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-[20px] font-extrabold tracking-[-0.04em] text-[#0F1020] sm:text-[28px]">
                Claims
              </h1>
              <p className="mt-1 text-[11px] text-[#747B93]">
                Delivery issues and dispute tracking
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              className="px-3.5 py-2 text-[11px] font-bold shadow-[0_2px_8px_rgba(245,197,66,0.25)]"
            >
              <Plus className="h-3.5 w-3.5" />
              New claim
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
                green: {
                  badge: "bg-[#EAFAF3] text-[#10B981]",
                  bar: "bg-[#9DE7C5]",
                  active: "bg-[#3ECF8E]",
                },
                purple: {
                  badge: "bg-[#F2EAFF] text-[#8B5CF6]",
                  bar: "bg-[#DCCBFF]",
                  active: "bg-[#A78BFA]",
                },
                blue: {
                  badge: "bg-[#EAF4FF] text-[#3B82F6]",
                  bar: "bg-[#BBD8FF]",
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

          <div className="mt-6 overflow-hidden rounded-[14px] border border-black/[0.07] bg-white shadow-[0_2px_12px_rgba(15,16,32,0.06)]">
            <div className="px-4 py-3">
              <div className="text-[13px] font-bold text-[#0F1020]">
                Claim history
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="bg-[#F7F8FB] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B7B9D]">
                    <th className="px-4 py-3 font-semibold">Claim ID</th>
                    <th className="px-4 py-3 font-semibold">Order ref</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Detail</th>
                    <th className="px-4 py-3 font-semibold">Raised</th>
                    <th className="px-4 py-3 font-semibold text-center">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {claimHistory.map((claim) => (
                    <tr
                      key={claim.id}
                      className="border-t border-[#E7EAF0] text-[12px] text-[#0F1020]"
                    >
                      <td className="px-4 py-3 font-medium">{claim.id}</td>
                      <td className="px-4 py-3 font-medium text-[#51576D]">
                        {claim.orderRef}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-[#1F2430]">
                          {claim.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#51576D]">
                        {claim.detail}
                      </td>
                      <td className="px-4 py-3 text-[#51576D]">
                        {claim.raised}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                              claim.statusTone === "amber"
                                ? "bg-[#FFF3DF] text-[#C07B00]"
                                : "bg-[#EAFAF3] text-[#18895E]"
                            }`}
                          >
                            {claim.status}
                          </span>
                          <button
                            type="button"
                            aria-label={`View ${claim.id}`}
                            className="flex h-5 w-5 items-center justify-center rounded-full border border-[#DDE2EC] bg-white text-[#8E93A7] transition-colors hover:border-[#BFC9D6] hover:text-[#5E667E]"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
