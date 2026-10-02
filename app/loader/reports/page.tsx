"use client";

import Header from "../../../components/layout/header";
import { Panel } from "../../../components/design-system";
import {
  AlertTriangle,
  BarChart3,
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

const reportCards = [
  {
    label: "CARTONS LOADED THIS WEEK",
    value: "1,842",
    note: "+4.2%",
    noteColor: "text-[#10B981]",
    labelColor: "text-[#4B8EF5]",
  },
  {
    label: "SHORTFALLS REPORTED",
    value: "7",
    note: "-2 vs last week",
    noteColor: "text-[#F59E0B]",
    labelColor: "text-[#F59E0B]",
  },
  {
    label: "DAMAGE REPORTS",
    value: "2",
    note: "All resolved",
    noteColor: "text-[#10B981]",
    labelColor: "text-[#7C3AED]",
  },
  {
    label: "ON-TIME DEPARTURES",
    value: "94%",
    note: "+1.1%",
    noteColor: "text-[#10B981]",
    labelColor: "text-[#10B981]",
  },
];

const weeklyData = [
  { day: "Mon", value: 312 },
  { day: "Tue", value: 298 },
  { day: "Wed", value: 334 },
  { day: "Thu", value: 276 },
  { day: "Fri", value: 318 },
  { day: "Sat", value: 244 },
  { day: "Sun", value: 60 },
];

const maxValue = Math.max(...weeklyData.map((d) => d.value));

export default function LoaderReportsPage() {
  return (
    <>
      <Header
        navItems={loaderNavItems}
        activeHref="/loader/reports"
        brandName="Waypoint"
        brandSubtitle="Loader"
      />

      <div className="min-h-screen bg-[#E9EDF3] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-[20px] font-extrabold tracking-[-0.04em] text-[#0F1020] sm:text-[28px]">
                Reports
              </h1>
              <p className="mt-1 text-[11px] text-[#747B93]">
                Loader performance · Peliyagoda depot
              </p>
            </div>
          </div>

          {/* Report Stat Cards (custom - no icons/bars) */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
            {reportCards.map((card) => (
              <div
                key={card.label}
                className="rounded-[16px] bg-white border border-black/[0.07] shadow-[0_2px_12px_rgba(15,16,32,0.07),0_0_0_1px_rgba(0,0,0,0.04)] p-[26px] hover:shadow-[0_8px_28px_rgba(15,16,32,0.1)] hover:-translate-y-[2px] transition-all duration-200"
              >
                <div
                  className={`text-[9px] font-bold uppercase tracking-[0.1em] ${card.labelColor} mb-3`}
                >
                  {card.label}
                </div>
                <div className="text-[36px] font-extrabold tracking-[-0.04em] text-[#0F1020] leading-none mb-2">
                  {card.value}
                </div>
                <div className={`text-[10px] font-semibold ${card.noteColor}`}>
                  {card.note}
                </div>
              </div>
            ))}
          </section>

          {/* Weekly Loading Log */}
          <div className="mt-6">
            <Panel>
              <div className="px-5 py-4 border-b border-[#E7EAF0]">
                <div className="text-[15px] font-bold text-[#0F1020] leading-tight">
                  Weekly loading log
                </div>
                <div className="mt-0.5 text-[10px] text-[#7B7B9D]">
                  Cartons loaded per day this week
                </div>
              </div>

              <div className="px-5 py-8">
                <div className="flex items-end justify-between gap-4" style={{ height: 200 }}>
                  {weeklyData.map((item) => {
                    const pct = (item.value / maxValue) * 100;
                    return (
                      <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        {/* Value */}
                        <span className="text-[11px] font-semibold text-[#7B7B9D]">
                          {item.value}
                        </span>
                        {/* Vertical Bar */}
                        <div
                          className="w-full rounded-[4px] bg-[#C7D2FE]"
                          style={{ height: `${pct}%`, minHeight: 6 }}
                        />
                        {/* Day */}
                        <span className="text-[10px] font-medium text-[#7B7B9D]">
                          {item.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}
