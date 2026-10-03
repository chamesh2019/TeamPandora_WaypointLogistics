"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "../../../components/layout/header";
import { Button, Panel } from "../../../components/design-system";
import type { LoaderReportDto } from "../../../lib/types/loader-api";
import {
  AlertTriangle,
  BarChart3,
  LayoutGrid,
  Loader2,
  Package,
  RefreshCw,
  Truck,
} from "lucide-react";

const loaderNavItems = [
  { name: "Overview", href: "/loader", icon: LayoutGrid },
  { name: "Active Trips", href: "/loader/activeTrips", icon: Truck },
  { name: "Manifests", href: "/loader/manifests", icon: Package },
  { name: "Shortfalls", href: "/loader/shortfails", icon: AlertTriangle },
  { name: "Reports", href: "/loader/reports", icon: BarChart3 },
];

export default function LoaderReportsPage() {
  const [reports, setReports] = useState<LoaderReportDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/loader/reports");
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setReports(json.data);
      } else {
        setError(json?.error?.message || "Failed to load reports");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const reportCards = [
    {
      label: "CARTONS LOADED THIS WEEK",
      value: reports ? reports.cartonsLoadedThisWeek.toLocaleString() : "1,842",
      note: reports ? reports.cartonsGrowthPct : "+4.2%",
      noteColor: "text-[#10B981]",
      labelColor: "text-[#4B8EF5]",
    },
    {
      label: "SHORTFALLS REPORTED",
      value: reports ? String(reports.shortfallsReported) : "7",
      note: reports ? reports.shortfallsDiffText : "-2 vs last week",
      noteColor: "text-[#F59E0B]",
      labelColor: "text-[#F59E0B]",
    },
    {
      label: "DAMAGE REPORTS",
      value: reports ? String(reports.damageReports) : "2",
      note: reports ? reports.damageStatusText : "All resolved",
      noteColor: "text-[#10B981]",
      labelColor: "text-[#7C3AED]",
    },
    {
      label: "ON-TIME DEPARTURES",
      value: reports ? `${reports.onTimeDeparturesPct}%` : "94%",
      note: reports ? reports.onTimeGrowthText : "+1.1%",
      noteColor: "text-[#10B981]",
      labelColor: "text-[#10B981]",
    },
  ];

  const weeklyData = reports?.weeklyLoadingData && reports.weeklyLoadingData.length > 0
    ? reports.weeklyLoadingData
    : [
        { day: "Mon", value: 312 },
        { day: "Tue", value: 298 },
        { day: "Wed", value: 334 },
        { day: "Thu", value: 276 },
        { day: "Fri", value: 318 },
        { day: "Sat", value: 244 },
        { day: "Sun", value: 60 },
      ];

  const maxValue = Math.max(...weeklyData.map((d) => d.value), 1);

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

            <Button
              type="button"
              variant="secondary"
              onClick={fetchReports}
              disabled={isLoading}
              className="px-3 py-2 text-[12px] font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {error && (
            <div className="mb-5 rounded-[12px] bg-red-50 p-4 border border-red-200 flex items-center justify-between">
              <span className="text-[12px] font-medium text-red-600">{error}</span>
              <Button type="button" variant="secondary" onClick={fetchReports} className="text-xs">
                Retry
              </Button>
            </div>
          )}

          {/* Report Stat Cards */}
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

              {isLoading && !reports ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-6 w-6 animate-spin text-[#4B8EF5]" />
                </div>
              ) : (
                <div className="px-5 py-8">
                  <div className="flex items-end justify-between gap-4" style={{ height: 200 }}>
                    {weeklyData.map((item) => {
                      const pct = Math.max(6, (item.value / maxValue) * 100);
                      return (
                        <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                          {/* Value */}
                          <span className="text-[11px] font-semibold text-[#7B7B9D]">
                            {item.value}
                          </span>
                          {/* Vertical Bar */}
                          <div
                            className="w-full rounded-[4px] bg-[#C7D2FE] hover:bg-[#818CF8] transition-colors"
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
              )}
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}
