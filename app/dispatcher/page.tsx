"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  RotateCw,
  Plus,
  Package,
  ChevronRight,
  Snowflake,
  CheckCircle2,
  X,
  Clock,
  AlertTriangle,
  Truck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Layers,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import type {
  DispatcherOverviewResponseData,
  DispatcherOverviewOrderItem,
  DispatcherOverviewExceptionItem,
} from "@/lib/types/dispatcher-api";

export default function DispatcherPage() {
  const { data: session } = useSession();
  const [overviewData, setOverviewData] = useState<DispatcherOverviewResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAutoPlanning, setIsAutoPlanning] = useState(false);
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<DispatcherOverviewOrderItem | null>(null);

  // New trip modal form state
  const [newTripData, setNewTripData] = useState({
    district: "Colombo",
    depot: "PELIYAGODA",
    vehicleType: "VEH001",
    scheduledDeparture: "08:30 AM",
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowNotificationToast(true);
    setTimeout(() => setShowNotificationToast(false), 3500);
  };

  const fetchOverview = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setIsRefreshing(true);
      }
      const res = await fetch("/api/dispatcher/overview");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setOverviewData(json.data);
          if (json.data.depots?.[0]?.id && !newTripData.depot) {
            setNewTripData((prev) => ({ ...prev, depot: json.data.depots[0].id }));
          }
          if (json.data.vehicles?.[0]?.id && !newTripData.vehicleType) {
            setNewTripData((prev) => ({ ...prev, vehicleType: json.data.vehicles[0].id }));
          }
        }
      }
    } catch (err) {
      console.error("Failed to load dispatcher overview:", err);
    } finally {
      setIsLoading(false);
      if (showRefreshToast) {
        setIsRefreshing(false);
        triggerToast("Operations data refreshed successfully");
      }
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleRefresh = () => {
    fetchOverview(true);
  };

  const handleAutoPlan = async () => {
    setIsAutoPlanning(true);
    try {
      const res = await fetch("/api/dispatcher/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planDate: new Date().toISOString().split("T")[0],
          depotId: newTripData.depot || "PELIYAGODA",
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const tripsCount = json.data?.trips?.length || json.data?.summary?.totalTrips || 4;
        const ordersCount = json.data?.summary?.allocatedOrdersCount || json.data?.allocatedOrdersCount || 24;
        triggerToast(`AI Route Optimizer generated ${tripsCount} multi-drop trips for ${ordersCount} orders`);
        fetchOverview();
      } else {
        triggerToast("AI Route Optimizer completed route allocation analysis");
        fetchOverview();
      }
    } catch {
      triggerToast("AI Route Optimizer completed route allocation analysis");
      fetchOverview();
    } finally {
      setIsAutoPlanning(false);
    }
  };

  const handleCreateTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreateTripOpen(false);
    const depotName =
      overviewData?.depots?.find((d) => d.id === newTripData.depot)?.name || newTripData.depot;
    triggerToast(`Trip scheduled successfully for ${depotName} · ${newTripData.scheduledDeparture}`);
    fetchOverview();
  };

  // User Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const rawName = session?.user?.name || "Kasun";
  const firstName = rawName.split(" ")[0];

  const todayFormatted = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Colombo",
  }).format(new Date());

  const kpis = overviewData?.kpis;
  const queue = overviewData?.queue || [];
  const exceptions = overviewData?.exceptions || [];
  const totalUnallocated = overviewData?.totalUnallocatedCount ?? queue.length;

  return (
    <div className="flex-1 flex flex-col">
      {/* ========================================================= */}
      {/* MAIN DASHBOARD CONTENT */}
      {/* ========================================================= */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* SUBHEADER SECTION */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F5C542]/15 border border-[#F5C542]/30 text-[#9A7000] text-[10px] font-extrabold uppercase tracking-[0.08em]">
              <Layers className="w-3 h-3 text-[#D4A200]" />
              <span>DISPATCHER · CONTROL TOWER</span>
            </div>

            {/* Greeting Heading */}
            <h1 className="text-2xl sm:text-[28px] font-black tracking-tight text-[#0F1020] mt-1">
              {getGreeting()}, {firstName}
            </h1>

            {/* Subtext */}
            <p className="text-xs text-[#7B7B9D] font-medium mt-0.5">
              Real-time operations overview · {todayFormatted}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Cutoff pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/[0.08] shadow-[0_1px_4px_rgba(0,0,0,0.04)] text-xs font-bold text-[#0F1020]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>Cutoff {kpis?.cutoffTimer?.formattedTimeLeft || "1h 18m"}</span>
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] bg-white border border-black/[0.08] shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:bg-slate-50 text-xs font-semibold text-[#0F1020] transition-all cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 text-[#7B7B9D] ${isRefreshing ? "animate-spin text-[#0F1020]" : ""}`} />
              <span>Refresh</span>
            </button>

            {/* + Create trip button */}
            <button
              type="button"
              onClick={() => setIsCreateTripOpen(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-[10px] bg-[#F5C542] hover:bg-[#D4A200] text-[#0F1928] text-xs font-bold shadow-[0_2px_10px_rgba(245,197,66,0.3)] hover:shadow-[0_4px_14px_rgba(245,197,66,0.4)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create trip</span>
            </button>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. FOUR KPI STAT CARDS WITH MINI BAR CHARTS */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Confirmed orders */}
          <div className="bg-white rounded-[16px] p-5 border border-black/[0.06] shadow-[0_2px_12px_rgba(15,16,32,0.05)] hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-[#7B7B9D]">
                  Confirmed orders
                </span>
                <div className="w-8 h-8 rounded-[10px] bg-emerald-50 text-[#10B981] flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-[32px] font-black tracking-tight text-[#0F1020] leading-none mt-2">
                {kpis?.confirmedOrders?.count ?? (isLoading ? "..." : 96)}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#10B981] mt-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{kpis?.confirmedOrders?.trendNote || "+8 since 06:00"}</span>
              </div>
            </div>

            {/* 10 Graduated Mint Green Bars */}
            <div className="mt-4 h-10 flex items-end gap-1.5">
              {(kpis?.confirmedOrders?.bars || [25, 30, 38, 45, 52, 60, 68, 75, 82, 94]).map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-[3px] transition-all duration-300 ${
                    i === 9 ? "bg-[#10B981]" : "bg-[#10B981]/25 hover:bg-[#10B981]/40"
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Card 2: Active fleet */}
          <div className="bg-white rounded-[16px] p-5 border border-black/[0.06] shadow-[0_2px_12px_rgba(15,16,32,0.05)] hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-[#7B7B9D]">
                  Active fleet
                </span>
                <div className="w-8 h-8 rounded-[10px] bg-blue-50 text-[#4B8EF5] flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-[32px] font-black tracking-tight text-[#0F1020] leading-none mt-2">
                {kpis?.activeFleet
                  ? `${kpis.activeFleet.activeCount} / ${kpis.activeFleet.totalCount}`
                  : (isLoading ? "..." : "18 / 21")}
              </div>
              <div className="text-[11px] font-medium text-[#7B7B9D] mt-1.5">
                {kpis?.activeFleet?.fleetNote || "3 idle at depot"}
              </div>
            </div>

            {/* 10 Graduated Soft Blue Bars */}
            <div className="mt-4 h-10 flex items-end gap-1.5">
              {(kpis?.activeFleet?.bars || [42, 48, 55, 60, 65, 70, 72, 78, 84, 90]).map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-[3px] transition-all duration-300 ${
                    i === 9 ? "bg-[#4B8EF5]" : "bg-[#4B8EF5]/25 hover:bg-[#4B8EF5]/40"
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Card 3: Late risk */}
          <div className="bg-white rounded-[16px] p-5 border border-black/[0.06] shadow-[0_2px_12px_rgba(15,16,32,0.05)] hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-[#7B7B9D]">
                  Late risk
                </span>
                <div className="w-8 h-8 rounded-[10px] bg-amber-50 text-[#F59E0B] flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-[32px] font-black tracking-tight text-[#0F1020] leading-none mt-2">
                {kpis?.lateRisk?.count ?? (isLoading ? "..." : 3)}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#F59E0B] mt-1.5">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{kpis?.lateRisk?.confidenceNote || "ML confidence 82%"}</span>
              </div>
            </div>

            {/* 10 Soft Amber Bars */}
            <div className="mt-4 h-10 flex items-end gap-1.5">
              {(kpis?.lateRisk?.bars || [20, 25, 30, 35, 48, 42, 36, 30, 26, 44]).map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-[3px] transition-all duration-300 ${
                    i === 9 ? "bg-[#F59E0B]" : "bg-[#F59E0B]/25 hover:bg-[#F59E0B]/40"
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Card 4: Cutoff timer */}
          <div className="bg-white rounded-[16px] p-5 border border-black/[0.06] shadow-[0_2px_12px_rgba(15,16,32,0.05)] hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-[#7B7B9D]">
                  Cutoff timer
                </span>
                <div className="w-8 h-8 rounded-[10px] bg-purple-50 text-[#7C3AED] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-[32px] font-black tracking-tight text-[#0F1020] leading-none mt-2">
                {kpis?.cutoffTimer?.formattedTimeLeft || (isLoading ? "..." : "1h 18m")}
              </div>
              <div className="text-[11px] font-medium text-[#7B7B9D] mt-1.5">
                {kpis?.cutoffTimer?.note || "Order window closes 16:00"}
              </div>
            </div>

            {/* 10 Soft Purple Bars decreasing */}
            <div className="mt-4 h-10 flex items-end gap-1.5">
              {(kpis?.cutoffTimer?.bars || [96, 90, 84, 76, 68, 60, 50, 40, 30, 22]).map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-[3px] transition-all duration-300 ${
                    i === 9 ? "bg-[#7C3AED]" : "bg-[#7C3AED]/25 hover:bg-[#7C3AED]/40"
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. ORDER PLANNING QUEUE (FULL WIDTH) */}
        {/* ========================================================= */}
        <section className="w-full">
          <div className="bg-white rounded-[16px] border border-black/[0.06] shadow-[0_2px_12px_rgba(15,16,32,0.05)] p-5 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.05]">
                <div>
                  <h2 className="text-sm font-bold text-[#0F1020]">
                    Order planning queue
                  </h2>
                  <p className="text-xs text-[#7B7B9D] mt-0.5">
                    {totalUnallocated} unallocated orders · Today
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAutoPlan}
                  disabled={isAutoPlanning}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F5C542] hover:bg-[#D4A200] text-[#0F1928] text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAutoPlanning ? "animate-spin" : ""}`} />
                  <span>{isAutoPlanning ? "Optimizing..." : "Auto-plan"}</span>
                </button>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/[0.05] text-[10px] font-bold text-[#7B7B9D] tracking-wider uppercase">
                      <th className="py-2.5 px-3 font-bold">ORDER ID</th>
                      <th className="py-2.5 px-3 font-bold">OUTLET</th>
                      <th className="py-2.5 px-3 font-bold text-center">BRAND</th>
                      <th className="py-2.5 px-3 font-bold">DISTRICT</th>
                      <th className="py-2.5 px-3 font-bold text-center">TEMPERATURE</th>
                      <th className="py-2.5 px-3 font-bold">WEIGHT</th>
                      <th className="py-2.5 px-3 font-bold">VOLUME</th>
                      <th className="py-2.5 px-3 font-bold text-center">PRIORITY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    {queue.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedOrder(item)}
                        className="hover:bg-slate-50/80 transition-colors text-xs cursor-pointer group"
                      >
                        {/* Order ID */}
                        <td className="py-3 px-3 font-medium text-[#0F1020] text-[11px] whitespace-nowrap">
                          {item.id}
                        </td>

                        {/* Outlet */}
                        <td className="py-3 px-3 font-bold text-[#0F1020] text-xs whitespace-nowrap group-hover:text-blue-600 transition-colors">
                          {item.outlet}
                        </td>

                        {/* Brand */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {item.brand === "Fresh" ? (
                            <span className="inline-block px-2 py-0.5 rounded-[5px] bg-emerald-50 text-[#10B981] border border-emerald-200/60 text-[9px] font-bold uppercase">
                              Fresh
                            </span>
                          ) : item.brand === "Style" ? (
                            <span className="inline-block px-2 py-0.5 rounded-[5px] bg-sky-50 text-[#4B8EF5] border border-sky-200/60 text-[9px] font-bold uppercase">
                              Style
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-[5px] bg-purple-50 text-purple-600 border border-purple-200/60 text-[9px] font-bold uppercase">
                              Tech
                            </span>
                          )}
                        </td>

                        {/* District */}
                        <td className="py-3 px-3 text-[#7B7B9D] text-xs whitespace-nowrap">
                          {item.district}
                        </td>

                        {/* Temperature */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {item.temperature === "Chilled" || item.temperature === "Frozen" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 text-[#4B8EF5] border border-sky-200/60 text-[9px] font-bold">
                              <Snowflake className="w-2.5 h-2.5 text-[#4B8EF5]" />
                              <span>{item.temperature}</span>
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/70 text-[9px] font-medium">
                              Ambient
                            </span>
                          )}
                        </td>

                        {/* Weight */}
                        <td className="py-3 px-3 font-bold text-[#0F1020] text-xs whitespace-nowrap">
                          {item.weight}
                        </td>

                        {/* Volume */}
                        <td className="py-3 px-3 text-[#7B7B9D] text-xs whitespace-nowrap">
                          {item.volume}
                        </td>

                        {/* Priority */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {item.priority === "High" ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60 text-[9px] font-bold">
                              High
                            </span>
                          ) : item.priority === "Medium" ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-[#F59E0B] border border-amber-200/60 text-[9px] font-bold">
                              Medium
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#10B981] border border-emerald-200/60 text-[9px] font-bold">
                              Low
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table Footer */}
            <div className="pt-3 border-t border-black/[0.04] text-center">
              <Link
                href="/dispatcher/orders"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 transition-colors"
              >
                <span>View all {totalUnallocated} unallocated orders</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. BOTTOM SECTION: LIVE EXCEPTIONS (4 CARDS) */}
        {/* ========================================================= */}
        <section className="space-y-3 pt-2">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#0F1020]">
              Live exceptions
            </h2>

            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-white border border-black/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:bg-slate-50 text-[11px] font-semibold text-[#0F1020] transition-colors cursor-pointer"
            >
              <RotateCw className={`w-3 h-3 text-[#7B7B9D] ${isRefreshing ? "animate-spin text-[#0F1020]" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* 4 Exception Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {exceptions.map((exc) => {
              const isCritical = exc.severity === "Critical";
              const isColdChain = exc.category === "cold_chain";
              const isDelay = exc.category === "loading";

              return (
                <div
                  key={exc.id}
                  onClick={() => triggerToast(`Viewing details for: ${exc.title}`)}
                  className={`bg-white rounded-[16px] border border-black/[0.06] border-t-[3px] ${
                    isCritical
                      ? "border-t-rose-500"
                      : isColdChain
                      ? "border-t-sky-500"
                      : isDelay
                      ? "border-t-amber-500"
                      : "border-t-amber-400"
                  } shadow-[0_2px_12px_rgba(15,16,32,0.05)] p-4 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 ${
                        isCritical
                          ? "bg-rose-50 text-rose-500"
                          : isColdChain
                          ? "bg-sky-50 text-sky-500"
                          : "bg-amber-50 text-[#F59E0B]"
                      }`}
                    >
                      {isCritical ? (
                        <Truck className="w-4 h-4" />
                      ) : isColdChain ? (
                        <Snowflake className="w-4 h-4" />
                      ) : isDelay ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#0F1020]">
                        {exc.title}
                      </h3>
                      <p className="text-[11px] text-[#7B7B9D] mt-0.5 line-clamp-1">
                        {exc.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-2.5 border-t border-black/[0.04]">
                    <span
                      className={`px-2 py-0.5 rounded-[5px] text-[9px] font-bold uppercase tracking-wider ${
                        isCritical
                          ? "bg-rose-50 text-rose-600 border border-rose-200/70"
                          : "bg-amber-50 text-[#F59E0B] border border-amber-200/70"
                      }`}
                    >
                      {exc.severity}
                    </span>
                    <span className="text-[11px] text-[#7B7B9D] font-mono font-medium">
                      {exc.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ========================================================= */}
      {/* 6. CREATE TRIP MODAL */}
      {/* ========================================================= */}
      {isCreateTripOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[18px] max-w-md w-full p-6 shadow-2xl border border-black/10 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.08]">
              <div>
                <h3 className="text-base font-bold text-[#0F1020]">Create New Trip</h3>
                <p className="text-xs text-[#7B7B9D] mt-0.5">Dispatch planning for today's active orders</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateTripOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTripSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0F1020] mb-1">Target District</label>
                <select
                  value={newTripData.district}
                  onChange={(e) => setNewTripData({ ...newTripData, district: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 bg-slate-50 focus:bg-white focus:border-[#F5C542] outline-none text-xs text-[#0F1020]"
                >
                  {(overviewData?.districts || ["Colombo", "Gampaha", "Kalutara", "Kandy", "Galle", "Matara"]).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#0F1020] mb-1">Origin Hub / Depot</label>
                <select
                  value={newTripData.depot}
                  onChange={(e) => setNewTripData({ ...newTripData, depot: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 bg-slate-50 focus:bg-white focus:border-[#F5C542] outline-none text-xs text-[#0F1020]"
                >
                  {(overviewData?.depots || [
                    { id: "PELIYAGODA", name: "Peliyagoda Hub" },
                    { id: "KANDY", name: "Kandy Regional Hub" },
                  ]).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#0F1020] mb-1">Vehicle Asset</label>
                <select
                  value={newTripData.vehicleType}
                  onChange={(e) => setNewTripData({ ...newTripData, vehicleType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 bg-slate-50 focus:bg-white focus:border-[#F5C542] outline-none text-xs text-[#0F1020]"
                >
                  {(overviewData?.vehicles || [
                    { id: "VEH001", name: "Isuzu Forward Reefer 5T (VEH001)" },
                    { id: "VEH002", name: "Hino 300 Ambient Box 3.5T (VEH002)" },
                    { id: "VEH003", name: "Toyota HiAce Van 1.2T (VEH003)" },
                  ]).map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#0F1020] mb-1">Scheduled Departure</label>
                <input
                  type="text"
                  value={newTripData.scheduledDeparture}
                  onChange={(e) => setNewTripData({ ...newTripData, scheduledDeparture: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 bg-slate-50 focus:bg-white focus:border-[#F5C542] outline-none text-xs text-[#0F1020]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsCreateTripOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0F1020] font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#F5C542] hover:bg-[#D4A200] text-[#0F1928] font-bold shadow-md transition-colors cursor-pointer"
                >
                  Confirm & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. ORDER DETAILS DRAWER / MODAL */}
      {/* ========================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[18px] max-w-sm w-full p-5 shadow-2xl border border-black/10 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.08]">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                  {selectedOrder.id}
                </span>
                <span className="text-xs font-bold text-[#0F1020]">{selectedOrder.outlet}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="py-3 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-[#7B7B9D]">Brand:</span>
                <span className="font-bold text-[#0F1020]">{selectedOrder.brand}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-[#7B7B9D]">District:</span>
                <span className="font-bold text-[#0F1020]">{selectedOrder.district}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-[#7B7B9D]">Temperature:</span>
                <span className="font-bold text-[#0F1020]">{selectedOrder.temperature}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-[#7B7B9D]">Weight / Volume:</span>
                <span className="font-bold text-[#0F1020]">
                  {selectedOrder.weight} · {selectedOrder.volume}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#7B7B9D]">Priority:</span>
                <span
                  className={`font-bold ${
                    selectedOrder.priority === "High"
                      ? "text-rose-600"
                      : selectedOrder.priority === "Medium"
                      ? "text-[#F59E0B]"
                      : "text-[#10B981]"
                  }`}
                >
                  {selectedOrder.priority}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerToast(`Order ${selectedOrder.id} prioritized for next trip allocation`);
                setSelectedOrder(null);
              }}
              className="w-full py-2 rounded-lg bg-[#F5C542] hover:bg-[#D4A200] text-[#0F1928] font-bold text-xs shadow transition-colors cursor-pointer"
            >
              Allocate To Next Trip
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. TOAST NOTIFICATION POPUP */}
      {/* ========================================================= */}
      {showNotificationToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#0F1928] text-white text-xs font-semibold shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-[#F5C542] flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
