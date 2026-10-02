"use client";

import { useState } from "react";
import Header from "../../../components/layout/header";
import { Button, Panel, StatCard } from "../../../components/design-system";
import ReportShortfallForm from "./report-shortfall-form";
import {
  AlertTriangle,
  BarChart3,
  Check,
  Clock,
  Eye,
  LayoutGrid,
  Package,
  Truck,
} from "lucide-react";

const loaderNavItems = [
  { name: "Overview", href: "/loader", icon: LayoutGrid },
  { name: "Active Trips", href: "/loader/activeTrips", icon: Truck },
  { name: "Manifests", href: "/loader/manifests", icon: Package },
  { name: "Shortfalls", href: "/loader/shortfails", icon: AlertTriangle },
  { name: "Reports", href: "/loader/reports", icon: BarChart3 },
];

const metricBars = {
  orange: [16, 21, 24, 30, 34, 38, 42],
  green: [18, 26, 30, 36, 42, 38, 48],
  greenAlt: [20, 28, 32, 38, 44, 40, 50],
  blue: [14, 18, 23, 28, 34, 30, 36],
};

const shortfallEntries = [
  {
    id: "WPF-CHKN-FRZ-24",
    status: "Pending" as const,
    description: "Frozen chicken 2.4 kg · 6 units short",
    tripInfo: "Trip: TRP-250614-01 · Stock exhausted at depot · 05:48",
    showEscalate: true,
  },
  {
    id: "WPS-JEANS-32W",
    status: "Substituted" as const,
    description: "Denim jeans size 32W · 4 units short",
    tripInfo: "Trip: TRP-250614-02 · Picking error · 04:22",
    showEscalate: false,
  },
];

const statusStyles: Record<string, { bg: string; text: string }> = {
  Pending: { bg: "bg-[rgba(245,158,11,.12)]", text: "text-[#F59E0B]" },
  Substituted: { bg: "bg-[rgba(75,142,245,.12)]", text: "text-[#4B8EF5]" },
};

export default function LoaderShortfailsPage() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <>
      <Header
        navItems={loaderNavItems}
        activeHref="/loader/shortfails"
        brandName="Waypoint"
        brandSubtitle="Loader"
      />

      <div className="min-h-screen bg-[#E9EDF3] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-[20px] font-extrabold tracking-[-0.04em] text-[#0F1020] sm:text-[28px]">
                Shortfalls
              </h1>
              <p className="mt-1 text-[11px] text-[#747B93]">
                Missing or insufficient stock reports
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              className="px-4 py-2.5 text-[12px] font-bold"
              onClick={() => setFormOpen(true)}
            >
              <span className="text-base leading-none">+</span>
              Report shortfall
            </Button>
          </div>

          {/* Stat Cards */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5 xl:[&>*]:min-w-[260px]">
            <StatCard
              icon={<AlertTriangle className="h-4 w-4" />}
              label="Open shortfalls"
              value="2"
              note="Awaiting resolution"
              tone="orange"
              bars={metricBars.orange}
            />
            <StatCard
              icon={<Check className="h-4 w-4" />}
              label="Resolved today"
              value="3"
              note="2 substituted · 1 cancelled"
              tone="green"
              bars={metricBars.green}
            />
            <StatCard
              icon={<Package className="h-4 w-4" />}
              label="Units short today"
              value="10"
              note="Across 2 trips"
              tone="green"
              bars={metricBars.greenAlt}
            />
            <StatCard
              icon={<Clock className="h-4 w-4" />}
              label="Avg resolution"
              value="22 min"
              note="Last 7 days"
              tone="blue"
              bars={metricBars.blue}
            />
          </section>

          {/* Shortfall Log */}
          <div className="mt-6">
            <Panel>
              <div className="px-5 py-4 border-b border-[#E7EAF0]">
                <div className="text-[15px] font-bold text-[#0F1020] leading-tight">
                  Shortfall log
                </div>
                <div className="mt-0.5 text-[10px] text-[#7B7B9D]">
                  Today · Peliyagoda depot
                </div>
              </div>

              <div>
                {shortfallEntries.map((entry, idx) => {
                  const colors = statusStyles[entry.status];
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-start gap-4 px-5 py-4 ${
                        idx < shortfallEntries.length - 1
                          ? "border-b border-[#E7EAF0]"
                          : ""
                      }`}
                    >
                      {/* Icon */}
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(239,68,68,.08)] border border-[rgba(239,68,68,.15)]">
                        <Package className="h-4 w-4 text-[#EF4444]" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[13px] font-bold text-[#0F1020]">
                            {entry.id}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${colors.bg} ${colors.text}`}
                          >
                            {entry.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#7B7B9D]">
                          {entry.description}
                        </div>
                        <div className="mt-0.5 text-[10px] text-[#A0A3B5]">
                          {entry.tripInfo}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                        {entry.showEscalate && (
                          <Button
                            type="button"
                            variant="secondary"
                            className="min-h-[30px] px-3 py-1.5 text-[10px] font-bold"
                          >
                            Escalate
                          </Button>
                        )}
                        <button
                          type="button"
                          className="p-1 rounded-md hover:bg-[#E7EAF0] transition-colors"
                        >
                          <Eye className="h-4 w-4 text-[#7B7B9D]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>
        </div>
      </div>

      {formOpen && (
        <ReportShortfallForm onClose={() => setFormOpen(false)} />
      )}
    </>
  );
}
