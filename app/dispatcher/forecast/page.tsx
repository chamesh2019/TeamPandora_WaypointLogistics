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
  Package,
  CheckCircle2,
  X,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Brain,
  Info,
  ChevronDown,
} from "lucide-react";

interface DayForecast {
  day: number;
  dateStr: string;
  orders: number;
  percentage: number;
  confidence: number; // 0 to 100
}

const FORECAST_DAYS: DayForecast[] = [
  { day: 14, dateStr: "Sat 14 Jun", orders: 178, percentage: 48, confidence: 91 },
  { day: 15, dateStr: "Sun 15 Jun", orders: 192, percentage: 52, confidence: 92 },
  { day: 16, dateStr: "Mon 16 Jun", orders: 228, percentage: 68, confidence: 94 },
  { day: 17, dateStr: "Tue 17 Jun", orders: 247, percentage: 80, confidence: 96 },
  { day: 18, dateStr: "Wed 18 Jun", orders: 231, percentage: 74, confidence: 95 },
  { day: 19, dateStr: "Thu 19 Jun", orders: 158, percentage: 48, confidence: 90 },
  { day: 20, dateStr: "Fri 20 Jun", orders: 142, percentage: 42, confidence: 89 },
  { day: 21, dateStr: "Sat 21 Jun", orders: 215, percentage: 64, confidence: 93 },
  { day: 22, dateStr: "Sun 22 Jun", orders: 236, percentage: 73, confidence: 94 },
  { day: 23, dateStr: "Mon 23 Jun", orders: 249, percentage: 78, confidence: 95 },
  { day: 24, dateStr: "Tue 24 Jun", orders: 265, percentage: 88, confidence: 97 },
  { day: 25, dateStr: "Wed 25 Jun", orders: 224, percentage: 70, confidence: 92 },
  { day: 26, dateStr: "Thu 26 Jun", orders: 184, percentage: 53, confidence: 90 },
  { day: 27, dateStr: "Fri 27 Jun", orders: 168, percentage: 46, confidence: 88 },
];

interface DepotDayVehicle {
  dayLetter: string;
  dayName: string;
  needed: number;
  percentage: number;
}

const PELIYAGODA_DAYS: DepotDayVehicle[] = [
  { dayLetter: "M", dayName: "Monday", needed: 12, percentage: 45 },
  { dayLetter: "T", dayName: "Tuesday", needed: 16, percentage: 62 },
  { dayLetter: "W", dayName: "Wednesday", needed: 18, percentage: 78 },
  { dayLetter: "T", dayName: "Thursday", needed: 21, percentage: 95 },
  { dayLetter: "F", dayName: "Friday", needed: 17, percentage: 74 },
  { dayLetter: "S", dayName: "Saturday", needed: 11, percentage: 48 },
  { dayLetter: "S", dayName: "Sunday", needed: 9, percentage: 40 },
];

const KANDY_DAYS: DepotDayVehicle[] = [
  { dayLetter: "M", dayName: "Monday", needed: 6, percentage: 42 },
  { dayLetter: "T", dayName: "Tuesday", needed: 8, percentage: 55 },
  { dayLetter: "W", dayName: "Wednesday", needed: 9, percentage: 68 },
  { dayLetter: "T", dayName: "Thursday", needed: 11, percentage: 82 },
  { dayLetter: "F", dayName: "Friday", needed: 8, percentage: 60 },
  { dayLetter: "S", dayName: "Saturday", needed: 4, percentage: 26 },
  { dayLetter: "S", dayName: "Sunday", needed: 5, percentage: 32 },
];

export default function DispatcherForecastPage() {
  const [dateRange, setDateRange] = useState("Next 14 days");
  const [showDateModal, setShowDateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<DayForecast | null>(null);
  const [hoveredDepotDay, setHoveredDepotDay] = useState<{
    depot: string;
    item: DepotDayVehicle;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExport = (format: string) => {
    triggerToast(`Exporting ${format} Demand & Capacity Forecast...`);
    setTimeout(() => {
      setShowExportModal(false);
      triggerToast(`Export complete: Waypoint_Demand_Forecast_${format.toUpperCase()}.file`);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col">
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
      {/* 2. MAIN FORECAST CONTENT CONTAINER */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-[1550px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-5">
        {/* SUBHEADER: AI Pill & Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            {/* Small Top Pill: AI FORECAST · 94% ACCURACY */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[10px] font-bold tracking-wider uppercase">
                <Sparkles className="w-3 h-3 text-[#D97706]" />
                <span>AI FORECAST · 94% ACCURACY</span>
              </span>
            </div>

            {/* Main Title & Subtitle */}
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
              Demand Forecast
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              ML-powered order volume predictions · {dateRange}
            </p>
          </div>

          {/* Action Buttons: Date Range & Export */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto mt-2 sm:mt-0">
            {/* Date range button */}
            <button
              onClick={() => setShowDateModal(true)}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <span>Date range</span>
            </button>

            {/* Export button */}
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. 4 KPI METRIC CARDS */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Predicted orders */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Predicted orders</span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                1,500
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Next 7 days
              </div>
            </div>
            {/* 10 graduated bars (light purple, last bar solid purple) */}
            <div className="flex items-end gap-1.5 h-8 mt-3">
              {[25, 35, 45, 40, 58, 52, 68, 62, 78].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-[#EDE9FE] rounded-xs"
                />
              ))}
              <div style={{ height: "100%" }} className="flex-1 bg-[#7C3AED] rounded-xs" />
            </div>
          </div>

          {/* Card 2: Vehicles needed */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Vehicles needed</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                28
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Peak Tuesday forecast
              </div>
            </div>
            {/* 10 graduated bars (light blue, last bar solid blue) */}
            <div className="flex items-end gap-1.5 h-8 mt-3">
              {[28, 38, 48, 42, 60, 52, 68, 62, 80].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-[#D9E8F9] rounded-xs"
                />
              ))}
              <div style={{ height: "100%" }} className="flex-1 bg-[#2563EB] rounded-xs" />
            </div>
          </div>

          {/* Card 3: Peak day */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Peak day</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Package className="w-3.5 h-3.5 text-amber-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                Tue 17 Jun
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Estimated 247 orders
              </div>
            </div>
            {/* 10 graduated bars (light amber, last bar solid amber) */}
            <div className="flex items-end gap-1.5 h-8 mt-3">
              {[22, 32, 40, 48, 44, 60, 68, 74, 70].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-[#FEF3C7] rounded-xs"
                />
              ))}
              <div style={{ height: "100%" }} className="flex-1 bg-[#D97706] rounded-xs" />
            </div>
          </div>

          {/* Card 4: Forecast accuracy */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Forecast accuracy</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                94.2%
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Last 30-day MAE
              </div>
            </div>
            {/* 10 graduated bars (light emerald, last bar solid emerald) */}
            <div className="flex items-end gap-1.5 h-8 mt-3">
              {[30, 40, 50, 45, 62, 56, 72, 65, 82].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-[#D1FAE5] rounded-xs"
                />
              ))}
              <div style={{ height: "100%" }} className="flex-1 bg-[#10B981] rounded-xs" />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. MIDDLE SECTION: Order volume forecast & Brand-level */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Card: Order volume forecast (col-span-7) */}
          <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            {/* Header with ML model pill */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Order volume forecast
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    14-day outlook · All depots · All brands
                  </p>
                </div>
                {/* ML model pill */}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200/60 text-[10px] font-semibold">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                  <span>ML model</span>
                </span>
              </div>

              {/* Relative Bar Chart Container */}
              <div className="relative mt-7">
                {/* Hover Tooltip Overlay */}
                {hoveredDay && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0F1928] text-white text-[11px] px-3 py-1.5 rounded-md shadow-lg pointer-events-none z-20 flex items-center gap-2 border border-white/10">
                    <span className="font-bold text-[#F5C542]">
                      {hoveredDay.dateStr}:
                    </span>
                    <span>{hoveredDay.orders} orders</span>
                    <span className="text-slate-400">
                      ({hoveredDay.confidence}% confidence)
                    </span>
                  </div>
                )}

                {/* 14 Vertical Bars */}
                <div className="flex items-end justify-between gap-1.5 sm:gap-2.5 h-44 px-2 border-b border-slate-100">
                  {FORECAST_DAYS.map((d) => (
                    <div
                      key={d.day}
                      onMouseEnter={() => setHoveredDay(d)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                    >
                      {/* Bar with rounded top */}
                      <div
                        style={{ height: `${d.percentage}%` }}
                        className={`w-full rounded-t-sm transition-all duration-200 group-hover:scale-y-105 group-hover:brightness-95 ${
                          d.confidence >= 95
                            ? "bg-[#EAB308]"
                            : d.confidence >= 92
                            ? "bg-[#F5C542]"
                            : "bg-[#FCD34D]"
                        }`}
                      />
                    </div>
                  ))}
                </div>

                {/* Day Labels below bars */}
                <div className="flex justify-between gap-1.5 sm:gap-2.5 px-2 mt-2">
                  {FORECAST_DAYS.map((d) => (
                    <div
                      key={d.day}
                      className="flex-1 text-center text-[10px] text-slate-400 font-medium"
                    >
                      {d.day}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Legend */}
            <div className="flex items-center gap-4 mt-5 text-[11px] text-slate-400 pt-2 border-t border-slate-50">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F5C542]" />
                <span className="text-slate-600 font-medium">All brands</span>
              </div>
              <div className="text-slate-400">
                Darker = higher confidence
              </div>
            </div>
          </div>

          {/* Right Card: Brand-level forecast (col-span-5) */}
          <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Brand-level forecast
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Next 7-day volume by brand
              </p>

              {/* Brands list */}
              <div className="flex flex-col gap-6 mt-6">
                {/* 1. Waypoint Fresh */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">
                        Waypoint Fresh
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        691 orders
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-500">
                      +4.2%
                    </span>
                  </div>
                  {/* Yellow progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1">
                    <div
                      style={{ width: "88%" }}
                      className="bg-[#F5C542] h-full rounded-full"
                    />
                  </div>
                </div>

                {/* 2. Waypoint Style */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">
                        Waypoint Style
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        422 orders
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-500">
                      +1.8%
                    </span>
                  </div>
                  {/* Blue progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1">
                    <div
                      style={{ width: "62%" }}
                      className="bg-[#2563EB] h-full rounded-full"
                    />
                  </div>
                </div>

                {/* 3. Waypoint Tech */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">
                        Waypoint Tech
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        196 orders
                      </div>
                    </div>
                    <span className="text-xs font-bold text-rose-500">
                      -0.3%
                    </span>
                  </div>
                  {/* Purple progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1">
                    <div
                      style={{ width: "36%" }}
                      className="bg-[#7C3AED] h-full rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Insight */}
            <div className="mt-6 pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
              <span>Overall brand mix shift:</span>
              <span className="font-semibold text-slate-600">+5.7% net volume surge</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. BOTTOM SECTION: Depot capacity planning */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col gap-5">
          {/* Header */}
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Depot capacity planning
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Vehicle requirement forecast by depot
            </p>
          </div>

          {/* 2 Depots Grid: Peliyagoda & Kandy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Depot 1: Peliyagoda */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-slate-900">
                    Peliyagoda
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-500 border border-rose-100 text-[10px] font-bold">
                    85% utilization
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  18 needed · 21 available
                </div>

                {/* Relative Bars for Weekdays */}
                <div className="relative mt-6">
                  {/* Tooltip */}
                  {hoveredDepotDay && hoveredDepotDay.depot === "Peliyagoda" && (
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#0F1928] text-white text-[10px] px-2.5 py-1 rounded shadow-md pointer-events-none z-20 flex items-center gap-1.5 border border-white/10">
                      <span className="font-bold text-[#F5C542]">
                        {hoveredDepotDay.item.dayName}:
                      </span>
                      <span>{hoveredDepotDay.item.needed} vehicles</span>
                    </div>
                  )}

                  {/* 7 Bars */}
                  <div className="flex items-end justify-between gap-3 sm:gap-5 h-28 px-3 border-b border-slate-100">
                    {PELIYAGODA_DAYS.map((item, idx) => (
                      <div
                        key={idx}
                        onMouseEnter={() =>
                          setHoveredDepotDay({ depot: "Peliyagoda", item })
                        }
                        onMouseLeave={() => setHoveredDepotDay(null)}
                        className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                      >
                        <div
                          style={{ height: `${item.percentage}%` }}
                          className="w-full max-w-[14px] bg-[#F5C542] rounded-t-sm transition-all duration-200 group-hover:scale-y-105 group-hover:bg-[#EAB308]"
                        />
                      </div>
                    ))}
                  </div>

                  {/* X-axis Day Letters */}
                  <div className="flex justify-between gap-3 sm:gap-5 px-3 mt-2">
                    {PELIYAGODA_DAYS.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex-1 text-center text-[10px] text-slate-400 font-medium"
                      >
                        {item.dayLetter}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Depot 2: Kandy */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-slate-900">
                    Kandy
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold">
                    72% utilization
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  10 needed · 12 available
                </div>

                {/* Relative Bars for Weekdays */}
                <div className="relative mt-6">
                  {/* Tooltip */}
                  {hoveredDepotDay && hoveredDepotDay.depot === "Kandy" && (
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#0F1928] text-white text-[10px] px-2.5 py-1 rounded shadow-md pointer-events-none z-20 flex items-center gap-1.5 border border-white/10">
                      <span className="font-bold text-[#F5C542]">
                        {hoveredDepotDay.item.dayName}:
                      </span>
                      <span>{hoveredDepotDay.item.needed} vehicles</span>
                    </div>
                  )}

                  {/* 7 Bars */}
                  <div className="flex items-end justify-between gap-3 sm:gap-5 h-28 px-3 border-b border-slate-100">
                    {KANDY_DAYS.map((item, idx) => (
                      <div
                        key={idx}
                        onMouseEnter={() =>
                          setHoveredDepotDay({ depot: "Kandy", item })
                        }
                        onMouseLeave={() => setHoveredDepotDay(null)}
                        className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                      >
                        <div
                          style={{ height: `${item.percentage}%` }}
                          className="w-full max-w-[14px] bg-[#F5C542] rounded-t-sm transition-all duration-200 group-hover:scale-y-105 group-hover:bg-[#EAB308]"
                        />
                      </div>
                    ))}
                  </div>

                  {/* X-axis Day Letters */}
                  <div className="flex justify-between gap-3 sm:gap-5 px-3 mt-2">
                    {KANDY_DAYS.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex-1 text-center text-[10px] text-slate-400 font-medium"
                      >
                        {item.dayLetter}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* 6. INTERACTIVE DATE RANGE MODAL */}
      {/* ========================================================= */}
      {showDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#F5C542]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Select Forecast Horizon
                </h3>
              </div>
              <button
                onClick={() => setShowDateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 flex flex-col gap-2">
              {[
                "Next 7 days",
                "Next 14 days",
                "Next 30 days",
                "Month of June 2026",
                "Q3 2026 (Quarterly Outlook)",
              ].map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setDateRange(range);
                    setShowDateModal(false);
                    triggerToast(`Forecast horizon updated to: ${range}`);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    dateRange === range
                      ? "bg-[#F5C542]/20 text-[#0F1928] font-bold border border-[#F5C542]/50"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span>{range}</span>
                  {dateRange === range && (
                    <CheckCircle2 className="w-4 h-4 text-[#0F1928]" />
                  )}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setShowDateModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. INTERACTIVE EXPORT MODAL */}
      {/* ========================================================= */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-[#F5C542]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Export Forecast Dataset
                </h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 flex flex-col gap-2.5">
              <button
                onClick={() => handleExport("PDF")}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-[#F5C542] hover:bg-[#F5C542]/5 transition-all flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Executive Forecast Summary (PDF)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    High-level visual charts, depot plans, and brand distributions
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleExport("CSV")}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-[#F5C542] hover:bg-[#F5C542]/5 transition-all flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Raw Forecast Projections (CSV / Excel)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Per-day orders, confidence bands, vehicle requirements
                  </div>
                </div>
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
