"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  GitFork,
  Route,
  Truck,
  Radio,
  AlertTriangle,
  Users,
  BarChart3,
  Sparkles,
  Search,
  Clock,
  Bell,
  Settings,
  Calendar,
  Download,
  Check,
  CheckCircle2,
  Package,
  Fuel,
  TrendingUp,
  X,
  FileText,
  Printer,
  ChevronDown,
} from "lucide-react";

interface DailyTripVolume {
  day: number;
  trips: number;
  percentage: number;
}

const DAILY_VOLUMES: DailyTripVolume[] = [
  { day: 1, trips: 18, percentage: 50 },
  { day: 2, trips: 23, percentage: 65 },
  { day: 3, trips: 20, percentage: 56 },
  { day: 4, trips: 31, percentage: 88 },
  { day: 5, trips: 26, percentage: 74 },
  { day: 6, trips: 16, percentage: 46 },
  { day: 7, trips: 13, percentage: 38 },
  { day: 8, trips: 21, percentage: 60 },
  { day: 9, trips: 24, percentage: 68 },
  { day: 10, trips: 19, percentage: 54 },
  { day: 11, trips: 25, percentage: 72 },
  { day: 12, trips: 27, percentage: 77 },
  { day: 13, trips: 22, percentage: 63 },
  { day: 14, trips: 25, percentage: 72 },
];

export default function DispatcherReportsPage() {
  const [activeNav, setActiveNav] = useState("Reports");
  const [globalSearch, setGlobalSearch] = useState("");
  const [dateRange, setDateRange] = useState("Last 30 days");
  const [showDateModal, setShowDateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<DailyTripVolume | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportPDF = () => {
    triggerToast("Generating comprehensive PDF performance report...");
    setTimeout(() => {
      setShowExportModal(false);
      triggerToast("PDF downloaded: Waypoint_Logistics_Monthly_Report.pdf");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#ECEEF5] text-[#0F1020] font-sans antialiased flex flex-col selection:bg-[#F5C542]/30 selection:text-[#0F1928]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0F1928] text-white px-4 py-3 rounded-lg shadow-xl border border-[#F5C542]/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#F5C542]" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. TOP NAVIGATION BAR */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 bg-[#0F1928] border-b border-white/5 shadow-md">
        <div className="w-full px-3 sm:px-5 lg:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Group: Logo & Nav Links */}
          <div className="flex items-center gap-3 lg:gap-5 overflow-x-auto no-scrollbar py-1">
            {/* Logo */}
            <Link href="/dispatcher" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-8 h-8 rounded-lg bg-[#F5C542] text-[#0F1928] font-black flex items-center justify-center text-sm shadow-[0_0_14px_rgba(245,197,66,0.4)] group-hover:scale-105 transition-transform">
                W
              </div>
              <div className="leading-tight">
                <div className="text-[14px] font-bold text-white tracking-tight flex items-center gap-1.5">
                  Waypoint
                </div>
                <div className="text-[8px] font-bold text-white/40 tracking-[0.18em] uppercase">
                  CONTROL
                </div>
              </div>
              {/* Badge 48 */}
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-white/10 text-white/80 text-[10px] font-bold border border-white/10">
                48
              </span>
            </Link>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1">
              {/* 1. Overview */}
              <Link
                href="/dispatcher"
                onClick={() => setActiveNav("Overview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeNav === "Overview"
                    ? "bg-[#F5C542] text-[#0F1928] font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Overview</span>
              </Link>

              {/* 2. Orders */}
              <Link
                href="/dispatcher/orders"
                onClick={() => setActiveNav("Orders")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeNav === "Orders"
                    ? "bg-[#F5C542] text-[#0F1928] font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Orders</span>
                <span className="w-4 h-4 rounded-full bg-white/15 text-white/80 text-[9px] font-bold flex items-center justify-center">
                  12
                </span>
              </Link>

              {/* 3. Allocation */}
              <Link
                href="/dispatcher/allocation"
                onClick={() => setActiveNav("Allocation")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeNav === "Allocation"
                    ? "bg-[#F5C542] text-[#0F1928] font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>Allocation</span>
              </Link>

              {/* 4. Trip planning */}
              <Link
                href="/dispatcher/trip-planning"
                onClick={() => setActiveNav("Trip planning")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeNav === "Trip planning"
                    ? "bg-[#F5C542] text-[#0F1928] font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <Route className="w-3.5 h-3.5" />
                <span>Trip planning</span>
              </Link>

              {/* 5. Fleet */}
              <Link
                href="/dispatcher/fleet"
                onClick={() => setActiveNav("Fleet")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeNav === "Fleet"
                    ? "bg-[#F5C542] text-[#0F1928] font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Fleet</span>
              </Link>

              {/* 6. Live Routes */}
              <Link
                href="/dispatcher/live-routes"
                onClick={() => setActiveNav("Live Routes")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeNav === "Live Routes"
                    ? "bg-[#F5C542] text-[#0F1928] font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Live Routes</span>
              </Link>

              {/* 7. Exceptions */}
              <Link
                href="/dispatcher/exceptions"
                onClick={() => setActiveNav("Exceptions")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeNav === "Exceptions"
                    ? "bg-[#F5C542] text-[#0F1928] font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Exceptions</span>
                <span className="w-4 h-4 rounded-full bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[9px] font-bold flex items-center justify-center">
                  3
                </span>
              </Link>

              {/* 8. Users */}
              <Link
                href="/dispatcher/users"
                onClick={() => setActiveNav("Users")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeNav === "Users"
                    ? "bg-[#F5C542] text-[#0F1928] font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Users</span>
              </Link>

              {/* 9. Reports (ACTIVE PILL) */}
              <Link
                href="/dispatcher/reports"
                onClick={() => setActiveNav("Reports")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-[0_2px_8px_rgba(245,197,66,0.35)] ${
                  activeNav === "Reports"
                    ? "bg-[#F5C542] text-[#0F1928]"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-[#0F1928]" />
                <span>Reports</span>
              </Link>

              {/* 10. Forecast */}
              <Link
                href="/dispatcher/forecast"
                onClick={() => setActiveNav("Forecast")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeNav === "Forecast"
                    ? "bg-[#F5C542] text-[#0F1928] font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F5C542]" />
                <span>Forecast</span>
              </Link>
            </nav>
          </div>

          {/* Right Group: Search, Demo, Notifications, Settings, Avatar */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            {/* Search Input */}
            <div className="hidden xl:flex items-center gap-2 h-9 px-3.5 rounded-full bg-white/[0.07] border border-white/10 text-white/60 focus-within:border-[#F5C542] focus-within:bg-white/10 transition-colors w-52">
              <Search className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search orders, trips..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-xs text-white placeholder-white/40 font-normal"
              />
            </div>

            {/* Demo Button */}
            <button
              type="button"
              onClick={() => triggerToast("Demo Mode: Simulation active")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.07] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors text-xs font-medium cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-white/50" />
              <span>Demo</span>
            </button>

            {/* Bell Icon with Red Dot */}
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => triggerToast("3 Active Operational Exceptions")}
              className="relative w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.07] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border border-[#0F1928]" />
            </button>

            {/* Settings Gear */}
            <button
              type="button"
              aria-label="Settings"
              onClick={() => triggerToast("Analytics & KPI Generation Engine v2.4")}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.07] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User Avatar KP */}
            <div className="w-8 h-8 rounded-full bg-[#F5C542] text-[#0F1928] font-bold text-xs flex items-center justify-center border border-[#F5C542]/40 shadow-sm cursor-pointer hover:ring-2 hover:ring-[#F5C542]/50 transition-all">
              KP
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN REPORTS CONTENT CONTAINER */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-[1550px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-5">
        {/* SUBHEADER: Title & Date Range / Export PDF */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Reports</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Operational performance · {dateRange}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Date range button */}
            <button
              onClick={() => setShowDateModal(true)}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <span>Date range</span>
            </button>

            {/* Export PDF button */}
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* 4 KPI METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: On-time delivery */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">On-time delivery</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                94.2%
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                +1.8% vs last month
              </div>
            </div>
            {/* 10 graduated bars */}
            <div className="flex items-end gap-1.5 h-8 mt-3">
              {[28, 38, 48, 42, 60, 52, 68, 62, 80].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-[#D1FAE5] rounded-xs"
                />
              ))}
              <div style={{ height: "100%" }} className="flex-1 bg-[#10B981] rounded-xs" />
            </div>
          </div>

          {/* Card 2: Trips completed */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Trips completed</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Route className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                312
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                This month
              </div>
            </div>
            {/* 10 graduated bars */}
            <div className="flex items-end gap-1.5 h-8 mt-3">
              {[25, 35, 45, 40, 58, 52, 68, 62, 78].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-[#D9E8F9] rounded-xs"
                />
              ))}
              <div style={{ height: "100%" }} className="flex-1 bg-[#2563EB] rounded-xs" />
            </div>
          </div>

          {/* Card 3: Orders fulfilled */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Orders fulfilled</span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                3,847
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                98.1% fill rate
              </div>
            </div>
            {/* 10 graduated bars */}
            <div className="flex items-end gap-1.5 h-8 mt-3">
              {[22, 32, 40, 48, 44, 60, 68, 74, 70].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-[#EDE9FE] rounded-xs"
                />
              ))}
              <div style={{ height: "100%" }} className="flex-1 bg-[#7C3AED] rounded-xs" />
            </div>
          </div>

          {/* Card 4: Fuel efficiency */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Fuel efficiency</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Fuel className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                8.2 km/L
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Fleet average
              </div>
            </div>
            {/* 10 graduated bars */}
            <div className="flex items-end gap-1.5 h-8 mt-3">
              {[20, 30, 38, 48, 42, 60, 54, 68, 62].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-[#FEF3C7] rounded-xs"
                />
              ))}
              <div style={{ height: "100%" }} className="flex-1 bg-[#F59E0B] rounded-xs" />
            </div>
          </div>
        </div>

        {/* 3. MAIN VISUALIZATION PANELS (2 Cards Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* LEFT CARD: Daily trip volume (8 cols on lg) */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 flex flex-col justify-between">
            {/* Card Header */}
            <div>
              <h2 className="text-sm font-bold text-slate-900">Daily trip volume</h2>
              <p className="text-xs text-slate-400 mt-0.5">Trips completed per day · This month</p>
            </div>

            {/* Hover Tooltip display */}
            <div className="h-6 flex items-center justify-end">
              {hoveredDay ? (
                <span className="text-[11px] font-mono font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 animate-in fade-in">
                  Day {hoveredDay.day}: <strong>{hoveredDay.trips} trips</strong>
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium">
                  Hover over bars for daily totals
                </span>
              )}
            </div>

            {/* 14 Vertical Yellow Bars Chart */}
            <div className="pt-4 pb-2">
              <div className="flex items-end justify-between gap-2.5 sm:gap-3.5 h-44 sm:h-48 px-2 border-b border-slate-100">
                {DAILY_VOLUMES.map((d) => (
                  <div
                    key={d.day}
                    onMouseEnter={() => setHoveredDay(d)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                  >
                    <div
                      style={{ height: `${d.percentage}%` }}
                      className="w-full max-w-[28px] bg-[#F5C542] hover:bg-[#E5B532] rounded-t-sm transition-all group-hover:scale-y-[1.03] group-hover:shadow-[0_0_12px_rgba(245,197,66,0.4)]"
                    />
                  </div>
                ))}
              </div>

              {/* X-Axis labels: 1 through 14 */}
              <div className="flex items-center justify-between gap-2.5 sm:gap-3.5 px-2 mt-2 text-[10px] text-slate-400 font-mono">
                {DAILY_VOLUMES.map((d) => (
                  <div key={d.day} className="flex-1 text-center">
                    {d.day}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT CARD: On-time rate by brand (4 cols on lg) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 flex flex-col justify-between">
            {/* Card Header */}
            <div>
              <h2 className="text-sm font-bold text-slate-900">On-time rate by brand</h2>
              <p className="text-xs text-slate-400 mt-0.5">This month</p>
            </div>

            {/* Brand Progress Bars Stack */}
            <div className="my-auto space-y-6 py-4">
              {/* Brand 1: Waypoint Fresh (96%) */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div>
                    <span className="font-bold text-slate-800">Waypoint Fresh</span>
                    <span className="text-[10px] text-slate-400 block">Last 30 days</span>
                  </div>
                  <span className="font-bold text-emerald-600 text-xs">96%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: "96%" }}
                    className="h-full bg-[#F5C542] rounded-full"
                  />
                </div>
              </div>

              {/* Brand 2: Waypoint Style (93%) */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div>
                    <span className="font-bold text-slate-800">Waypoint Style</span>
                    <span className="text-[10px] text-slate-400 block">Last 30 days</span>
                  </div>
                  <span className="font-bold text-blue-600 text-xs">93%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: "93%" }}
                    className="h-full bg-[#2563EB] rounded-full"
                  />
                </div>
              </div>

              {/* Brand 3: Waypoint Tech (91%) */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div>
                    <span className="font-bold text-slate-800">Waypoint Tech</span>
                    <span className="text-[10px] text-slate-400 block">Last 30 days</span>
                  </div>
                  <span className="font-bold text-purple-600 text-xs">91%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: "91%" }}
                    className="h-full bg-[#7C3AED] rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center font-medium">
              Consolidated SLA threshold: 90.0% minimum
            </div>
          </div>
        </div>
      </main>

      {/* MODAL 1: Date Range Picker */}
      {showDateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-600" />
                <span>Select Reporting Period</span>
              </h3>
              <button
                onClick={() => setShowDateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="my-3 space-y-1.5 text-xs">
              {[
                "Last 7 days",
                "Last 30 days",
                "This month (June 2025)",
                "Last month (May 2025)",
                "Q2 2025 YTD",
              ].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setDateRange(opt);
                    setShowDateModal(false);
                    triggerToast(`Reporting period updated to: ${opt}`);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-between ${
                    dateRange === opt
                      ? "bg-amber-50/70 border-amber-300 font-bold text-slate-900"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span>{opt}</span>
                  {dateRange === opt && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowDateModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Export PDF Confirmation */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Export Monthly PDF</h3>
                <p className="text-xs text-slate-500">Executive Performance Brief</p>
              </div>
            </div>

            <div className="my-4 text-xs text-slate-600 space-y-2">
              <p>
                Includes all 4 KPI cards, daily trip distributions (days 1-14), brand compliance rates,
                fuel efficiency metrics, and exception logs for <strong>{dateRange}</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleExportPDF}
                className="px-4 py-1.5 text-xs font-bold bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
