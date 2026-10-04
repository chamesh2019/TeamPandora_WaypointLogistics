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
  RotateCw,
  Plus,
  Package,
  ChevronRight,
  Snowflake,
  CheckCircle2,
  X,
  Thermometer,
  Shield,
  Layers,
  MapPin,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface OrderQueueItem {
  id: string;
  outlet: string;
  brand: "Fresh" | "Style" | "Tech";
  district: string;
  temperature: "Chilled" | "Ambient" | "Frozen";
  weight: string;
  volume: string;
  priority: "High" | "Medium" | "Low";
}

const INITIAL_QUEUE: OrderQueueItem[] = [
  {
    id: "OUT-104",
    outlet: "Cargills - Nugegoda",
    brand: "Fresh",
    district: "Colombo",
    temperature: "Chilled",
    weight: "820 kg",
    volume: "6.4 m³",
    priority: "High",
  },
  {
    id: "OUT-103",
    outlet: "Keells - Rajagiriya",
    brand: "Fresh",
    district: "Colombo",
    temperature: "Chilled",
    weight: "610 kg",
    volume: "5.1 m³",
    priority: "High",
  },
  {
    id: "OUT-102",
    outlet: "Cargills - Wellawatte",
    brand: "Fresh",
    district: "Colombo",
    temperature: "Ambient",
    weight: "440 kg",
    volume: "4.2 m³",
    priority: "Medium",
  },
  {
    id: "OUT-101",
    outlet: "Keells - Bambalapitiya",
    brand: "Style",
    district: "Colombo",
    temperature: "Ambient",
    weight: "320 kg",
    volume: "3.2 m³",
    priority: "Medium",
  },
  {
    id: "OUT-098",
    outlet: "Cargills - Kandy City",
    brand: "Fresh",
    district: "Kandy",
    temperature: "Chilled",
    weight: "910 kg",
    volume: "7.1 m³",
    priority: "Low",
  },
  {
    id: "OUT-097",
    outlet: "Arpico - Peradeniya",
    brand: "Style",
    district: "Kandy",
    temperature: "Ambient",
    weight: "280 kg",
    volume: "2.8 m³",
    priority: "Low",
  },
];

interface MapVehicle {
  id: string;
  code: string;
  plate: string;
  x: number;
  y: number;
  status: "normal" | "delayed" | "depot";
  type: string;
  driver: string;
  load: string;
}

const MAP_VEHICLES: MapVehicle[] = [
  {
    id: "v-014",
    code: "014",
    plate: "WP-NC-4472",
    x: 160,
    y: 125,
    status: "normal",
    type: "Reefer Truck 5T",
    driver: "Nimal Fernando",
    load: "84% loaded · Peliyagoda to Nugegoda",
  },
  {
    id: "v-037",
    code: "037",
    plate: "CP-LM-2104",
    x: 480,
    y: 65,
    status: "delayed",
    type: "Ambient Box 3.5T",
    driver: "Sunil Bandara",
    load: "Delayed +24m · Kadugannawa pass",
  },
  {
    id: "v-002",
    code: "002",
    plate: "WP-KL-5501",
    x: 245,
    y: 180,
    status: "normal",
    type: "Reefer Truck 5T",
    driver: "Chamara Silva",
    load: "92% loaded · Wellawatte dock",
  },
  {
    id: "v-018",
    code: "018",
    plate: "NWP-RA-7782",
    x: 495,
    y: 155,
    status: "normal",
    type: "Van 1.2T",
    driver: "Ruwan Dias",
    load: "Available · Kandy regional hub",
  },
];

export default function DispatcherPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAutoPlanning, setIsAutoPlanning] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<MapVehicle | null>(null);
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderQueueItem | null>(null);

  // New trip modal form state
  const [newTripData, setNewTripData] = useState({
    district: "Colombo Metropolitan",
    depot: "Peliyagoda Hub",
    vehicleType: "Reefer Truck 5T",
    scheduledDeparture: "08:30 AM",
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowNotificationToast(true);
    setTimeout(() => setShowNotificationToast(false), 3500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      triggerToast("Operations data refreshed successfully");
    }, 700);
  };

  const handleAutoPlan = () => {
    setIsAutoPlanning(true);
    setTimeout(() => {
      setIsAutoPlanning(false);
      triggerToast("AI Route Optimizer generated 4 multi-drop trips for 24 orders");
    }, 1200);
  };

  const handleCreateTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreateTripOpen(false);
    triggerToast(`Trip scheduled successfully for ${newTripData.depot} · ${newTripData.scheduledDeparture}`);
  };

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
              Good evening, Kasun
            </h1>

            {/* Subtext */}
            <p className="text-xs text-[#7B7B9D] font-medium mt-0.5">
              Real-time operations overview · 13 June 2025
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Cutoff pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/[0.08] shadow-[0_1px_4px_rgba(0,0,0,0.04)] text-xs font-bold text-[#0F1020]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>Cutoff 1h 18m</span>
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
                96
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#10B981] mt-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+8 since 06:00</span>
              </div>
            </div>

            {/* 10 Graduated Mint Green Bars */}
            <div className="mt-4 h-10 flex items-end gap-1.5">
              {[25, 30, 38, 45, 52, 60, 68, 75, 82, 94].map((h, i) => (
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
                18 / 21
              </div>
              <div className="text-[11px] font-medium text-[#7B7B9D] mt-1.5">
                3 idle at depot
              </div>
            </div>

            {/* 10 Graduated Soft Blue Bars */}
            <div className="mt-4 h-10 flex items-end gap-1.5">
              {[42, 48, 55, 60, 65, 70, 72, 78, 84, 90].map((h, i) => (
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
                3
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#F59E0B] mt-1.5">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>ML confidence 82%</span>
              </div>
            </div>

            {/* 10 Soft Amber Bars */}
            <div className="mt-4 h-10 flex items-end gap-1.5">
              {[20, 25, 30, 35, 48, 42, 36, 30, 26, 44].map((h, i) => (
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
                1h 18m
              </div>
              <div className="text-[11px] font-medium text-[#7B7B9D] mt-1.5">
                Order window closes 16:00
              </div>
            </div>

            {/* 10 Soft Purple Bars decreasing */}
            <div className="mt-4 h-10 flex items-end gap-1.5">
              {[96, 90, 84, 76, 68, 60, 50, 40, 30, 22].map((h, i) => (
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
        {/* 4. MIDDLE SECTION: QUEUE (LEFT) + LIVE MAP (RIGHT) */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT COLUMN (7 COLS): ORDER PLANNING QUEUE */}
          <div className="lg:col-span-7 bg-white rounded-[16px] border border-black/[0.06] shadow-[0_2px_12px_rgba(15,16,32,0.05)] p-5 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.05]">
                <div>
                  <h2 className="text-sm font-bold text-[#0F1020]">
                    Order planning queue
                  </h2>
                  <p className="text-xs text-[#7B7B9D] mt-0.5">
                    24 unallocated orders · Today
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
                      <th className="py-2.5 px-2 font-bold">ORDER ID</th>
                      <th className="py-2.5 px-2 font-bold">OUTLET</th>
                      <th className="py-2.5 px-2 font-bold text-center">BRAND</th>
                      <th className="py-2.5 px-2 font-bold">DISTRICT</th>
                      <th className="py-2.5 px-2 font-bold text-center">TEMPERATURE</th>
                      <th className="py-2.5 px-2 font-bold">WEIGHT</th>
                      <th className="py-2.5 px-2 font-bold">VOLUME</th>
                      <th className="py-2.5 px-2 font-bold text-center">PRIORITY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    {INITIAL_QUEUE.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedOrder(item)}
                        className="hover:bg-slate-50/80 transition-colors text-xs cursor-pointer group"
                      >
                        {/* Order ID */}
                        <td className="py-3 px-2 font-medium text-[#0F1020] text-[11px] whitespace-nowrap">
                          {item.id}
                        </td>

                        {/* Outlet */}
                        <td className="py-3 px-2 font-bold text-[#0F1020] text-xs whitespace-nowrap group-hover:text-blue-600 transition-colors">
                          {item.outlet}
                        </td>

                        {/* Brand */}
                        <td className="py-3 px-2 text-center whitespace-nowrap">
                          {item.brand === "Fresh" ? (
                            <span className="inline-block px-2 py-0.5 rounded-[5px] bg-emerald-50 text-[#10B981] border border-emerald-200/60 text-[9px] font-bold uppercase">
                              Fresh
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-[5px] bg-sky-50 text-[#4B8EF5] border border-sky-200/60 text-[9px] font-bold uppercase">
                              Style
                            </span>
                          )}
                        </td>

                        {/* District */}
                        <td className="py-3 px-2 text-[#7B7B9D] text-xs whitespace-nowrap">
                          {item.district}
                        </td>

                        {/* Temperature */}
                        <td className="py-3 px-2 text-center whitespace-nowrap">
                          {item.temperature === "Chilled" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 text-[#4B8EF5] border border-sky-200/60 text-[9px] font-bold">
                              <Snowflake className="w-2.5 h-2.5 text-[#4B8EF5]" />
                              <span>Chilled</span>
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/70 text-[9px] font-medium">
                              Ambient
                            </span>
                          )}
                        </td>

                        {/* Weight */}
                        <td className="py-3 px-2 font-bold text-[#0F1020] text-xs whitespace-nowrap">
                          {item.weight}
                        </td>

                        {/* Volume */}
                        <td className="py-3 px-2 text-[#7B7B9D] text-xs whitespace-nowrap">
                          {item.volume}
                        </td>

                        {/* Priority */}
                        <td className="py-3 px-2 text-center whitespace-nowrap">
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
                <span>View all 24 unallocated orders</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN (5 COLS): LIVE OPERATIONS MAP & ALERTS */}
          <div className="lg:col-span-5 bg-white rounded-[16px] border border-black/[0.06] shadow-[0_2px_12px_rgba(15,16,32,0.05)] p-5 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.05]">
                <div>
                  <h2 className="text-sm font-bold text-[#0F1020]">
                    Live operations map
                  </h2>
                  <p className="text-xs text-[#7B7B9D] mt-0.5">
                    18 active vehicles · All depots
                  </p>
                </div>

                {/* Live Pill */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#10B981] border border-emerald-200/60 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  <span>Live</span>
                </div>
              </div>

              {/* Map Canvas Card */}
              <div className="mt-3 relative rounded-[14px] bg-[#0C1524] border border-white/10 overflow-hidden h-[240px] shadow-inner select-none">
                {/* Overlay Top-Left Stats Badge */}
                <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-2.5 px-3 py-1 rounded-full bg-[#080E18]/80 border border-white/10 text-[11px] font-medium text-white/90 backdrop-blur-sm shadow-md">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>19 on road</span>
                  </div>
                  <span className="text-white/20">|</span>
                  <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>1 Delayed</span>
                  </div>
                </div>

                {/* SVG Network Map */}
                <svg
                  viewBox="0 0 600 240"
                  className="w-full h-full cursor-crosshair"
                >
                  <defs>
                    {/* Subtle Grid Pattern */}
                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path
                        d="M 30 0 L 0 0 0 30"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.04)"
                        strokeWidth="1"
                      />
                    </pattern>
                    <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#1E293B" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#0C1524" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Blueprint Grid Background */}
                  <rect width="600" height="240" fill="url(#grid)" />
                  <rect width="600" height="240" fill="url(#mapGlow)" />

                  {/* Dotted Interconnection Route Lines */}
                  {/* Route 1: 014 to 037 */}
                  <line
                    x1="160"
                    y1="125"
                    x2="480"
                    y2="65"
                    stroke="rgba(245, 197, 66, 0.25)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  {/* Route 2: 014 to 002 */}
                  <line
                    x1="160"
                    y1="125"
                    x2="245"
                    y2="180"
                    stroke="rgba(75, 142, 245, 0.25)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  {/* Route 3: 002 to 018 */}
                  <line
                    x1="245"
                    y1="180"
                    x2="495"
                    y2="155"
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  {/* Route 4: 037 to 018 */}
                  <line
                    x1="480"
                    y1="65"
                    x2="495"
                    y2="155"
                    stroke="rgba(239, 68, 68, 0.3)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />

                  {/* Vehicle Nodes */}

                  {/* Node 1: 014 (WP-NC-4472) */}
                  <g
                    className="cursor-pointer group"
                    onClick={() => setSelectedVehicle(MAP_VEHICLES[0])}
                  >
                    <circle cx="160" cy="125" r="18" fill="rgba(245, 197, 66, 0.2)" />
                    <circle cx="160" cy="125" r="12" fill="#F5C542" stroke="#0F1928" strokeWidth="2" />
                    <text
                      x="160"
                      y="129"
                      textAnchor="middle"
                      fill="#0F1928"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      014
                    </text>
                    <text
                      x="160"
                      y="149"
                      textAnchor="middle"
                      fill="rgba(255, 255, 255, 0.85)"
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      WP-NC-4472
                    </text>
                  </g>

                  {/* Node 2: 037 (CP-LM-2104) Delayed Red Node */}
                  <g
                    className="cursor-pointer group"
                    onClick={() => setSelectedVehicle(MAP_VEHICLES[1])}
                  >
                    <circle cx="480" cy="65" r="22" fill="rgba(239, 68, 68, 0.25)" className="animate-ping" />
                    <circle cx="480" cy="65" r="14" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
                    <text
                      x="480"
                      y="69"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      037
                    </text>
                    <text
                      x="480"
                      y="88"
                      textAnchor="middle"
                      fill="#F87171"
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      CP-LM-2104
                    </text>
                  </g>

                  {/* Node 3: 002 (WP-KL-5501) */}
                  <g
                    className="cursor-pointer group"
                    onClick={() => setSelectedVehicle(MAP_VEHICLES[2])}
                  >
                    <circle cx="245" cy="180" r="16" fill="rgba(245, 197, 66, 0.15)" />
                    <circle cx="245" cy="180" r="11" fill="#EAB308" stroke="#0F1928" strokeWidth="2" />
                    <text
                      x="245"
                      y="184"
                      textAnchor="middle"
                      fill="#0F1928"
                      fontSize="8"
                      fontWeight="bold"
                    >
                      002
                    </text>
                    <text
                      x="245"
                      y="202"
                      textAnchor="middle"
                      fill="rgba(255, 255, 255, 0.75)"
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      WP-KL-5501
                    </text>
                  </g>

                  {/* Node 4: 018 (NWP-RA-7782) */}
                  <g
                    className="cursor-pointer group"
                    onClick={() => setSelectedVehicle(MAP_VEHICLES[3])}
                  >
                    <circle cx="495" cy="155" r="16" fill="rgba(148, 163, 184, 0.2)" />
                    <circle cx="495" cy="155" r="11" fill="#475569" stroke="#94A3B8" strokeWidth="1.5" />
                    <text
                      x="495"
                      y="159"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="8"
                      fontWeight="bold"
                    >
                      018
                    </text>
                    <text
                      x="495"
                      y="177"
                      textAnchor="middle"
                      fill="rgba(255, 255, 255, 0.75)"
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      NWP-RA-7782
                    </text>
                  </g>
                </svg>

                {/* Map Tooltip if vehicle selected */}
                {selectedVehicle && (
                  <div className="absolute bottom-2 left-2 right-2 bg-[#0F1928]/95 border border-white/15 rounded-lg p-2 text-white text-xs flex items-center justify-between backdrop-blur-md shadow-xl animate-in fade-in zoom-in-95">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#F5C542] text-[#0F1928] font-black flex items-center justify-center text-[10px]">
                        {selectedVehicle.code}
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>{selectedVehicle.plate}</span>
                          <span className="text-[10px] text-white/50">({selectedVehicle.driver})</span>
                        </div>
                        <div className="text-[10px] text-white/70">{selectedVehicle.load}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedVehicle(null)}
                      className="text-white/40 hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Alerts List Under Map */}
              <div className="mt-3 space-y-2">
                {/* Alert 1: Late arrival risk */}
                <div
                  onClick={() => triggerToast("Viewing late arrival prediction for TRP-07")}
                  className="bg-amber-50/70 border border-amber-200/80 rounded-[12px] p-3 flex items-center justify-between hover:bg-amber-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[8px] bg-amber-100 text-[#F59E0B] flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0F1020] group-hover:text-amber-800 transition-colors">
                        TRP-07 · Late arrival risk · 82%
                      </div>
                      <div className="text-[11px] text-[#7B7B9D] mt-0.5">
                        Kandy Central · Window closes 09:00
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>

                {/* Alert 2: Reefer shortfall */}
                <div
                  onClick={() => triggerToast("Viewing chilled unassigned inventory at Peliyagoda")}
                  className="bg-sky-50/70 border border-sky-200/80 rounded-[12px] p-3 flex items-center justify-between hover:bg-sky-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[8px] bg-sky-100 text-[#4B8EF5] flex items-center justify-center flex-shrink-0">
                      <Snowflake className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0F1020] group-hover:text-sky-800 transition-colors">
                        Reefer shortfall
                      </div>
                      <div className="text-[11px] text-[#7B7B9D] mt-0.5">
                        3 chilled orders unassigned · Peliyagoda
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>

            {/* Fleet Management Link Footer */}
            <div className="pt-3 border-t border-black/[0.04] text-center mt-3">
              <Link
                href="/dispatcher/fleet"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 transition-colors"
              >
                <span>View fleet management</span>
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
            {/* Card 1: Vehicle Breakdown (Red Accent) */}
            <div className="bg-white rounded-[16px] border border-black/[0.06] border-t-[3px] border-t-rose-500 shadow-[0_2px_12px_rgba(15,16,32,0.05)] p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#0F1020]">
                    Vehicle Breakdown
                  </h3>
                  <p className="text-[11px] text-[#7B7B9D] mt-0.5">
                    WP GB-1145 · Colombo Rd
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-2.5 border-t border-black/[0.04]">
                <span className="px-2 py-0.5 rounded-[5px] bg-rose-50 text-rose-600 border border-rose-200/70 text-[9px] font-bold uppercase tracking-wider">
                  Critical
                </span>
                <span className="text-[11px] text-[#7B7B9D] font-mono font-medium">
                  07:12
                </span>
              </div>
            </div>

            {/* Card 2: Cold Chain Warning (Blue Accent) */}
            <div className="bg-white rounded-[16px] border border-black/[0.06] border-t-[3px] border-t-sky-500 shadow-[0_2px_12px_rgba(15,16,32,0.05)] p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-sky-50 text-sky-500 flex items-center justify-center flex-shrink-0">
                  <Snowflake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#0F1020]">
                    Cold Chain Warning
                  </h3>
                  <p className="text-[11px] text-[#7B7B9D] mt-0.5">
                    VFH-014 reefer +2.4°C breach
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-2.5 border-t border-black/[0.04]">
                <span className="px-2 py-0.5 rounded-[5px] bg-amber-50 text-[#F59E0B] border border-amber-200/70 text-[9px] font-bold uppercase tracking-wider">
                  High
                </span>
                <span className="text-[11px] text-[#7B7B9D] font-mono font-medium">
                  00:46
                </span>
              </div>
            </div>

            {/* Card 3: Loading Delay (Amber Accent) */}
            <div className="bg-white rounded-[16px] border border-black/[0.06] border-t-[3px] border-t-amber-500 shadow-[0_2px_12px_rgba(15,16,32,0.05)] p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-amber-50 text-[#F59E0B] flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#0F1020]">
                    Loading Delay
                  </h3>
                  <p className="text-[11px] text-[#7B7B9D] mt-0.5">
                    Bay 03 · 22 min behind schedule
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-2.5 border-t border-black/[0.04]">
                <span className="px-2 py-0.5 rounded-[5px] bg-amber-50 text-[#F59E0B] border border-amber-200/70 text-[9px] font-bold uppercase tracking-wider">
                  High
                </span>
                <span className="text-[11px] text-[#7B7B9D] font-mono font-medium">
                  05:55
                </span>
              </div>
            </div>

            {/* Card 4: Late Delivery Risk (Amber/Yellow Accent) */}
            <div className="bg-white rounded-[16px] border border-black/[0.06] border-t-[3px] border-t-amber-400 shadow-[0_2px_12px_rgba(15,16,32,0.05)] p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-amber-50 text-[#F59E0B] flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#0F1020]">
                    Late Delivery Risk
                  </h3>
                  <p className="text-[11px] text-[#7B7B9D] mt-0.5">
                    TRP-07 · Kandy Central
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-2.5 border-t border-black/[0.04]">
                <span className="px-2 py-0.5 rounded-[5px] bg-amber-50 text-[#F59E0B] border border-amber-200/70 text-[9px] font-bold uppercase tracking-wider">
                  High
                </span>
                <span className="text-[11px] text-[#7B7B9D] font-mono font-medium">
                  08:44
                </span>
              </div>
            </div>
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
                  <option>Colombo Metropolitan</option>
                  <option>Kandy Regional</option>
                  <option>Gampaha & Negombo</option>
                  <option>Galle Southern Hub</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#0F1020] mb-1">Origin Hub / Depot</label>
                <select
                  value={newTripData.depot}
                  onChange={(e) => setNewTripData({ ...newTripData, depot: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 bg-slate-50 focus:bg-white focus:border-[#F5C542] outline-none text-xs text-[#0F1020]"
                >
                  <option>Peliyagoda Hub</option>
                  <option>Kandy Regional Hub</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#0F1020] mb-1">Vehicle Asset</label>
                <select
                  value={newTripData.vehicleType}
                  onChange={(e) => setNewTripData({ ...newTripData, vehicleType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 bg-slate-50 focus:bg-white focus:border-[#F5C542] outline-none text-xs text-[#0F1020]"
                >
                  <option>Isuzu Forward Reefer 5T (VEH001)</option>
                  <option>Hino 300 Ambient Box 3.5T (VEH002)</option>
                  <option>Toyota HiAce Van 1.2T (VEH003)</option>
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
                <span className="font-bold text-[#0F1020]">{selectedOrder.weight} · {selectedOrder.volume}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#7B7B9D]">Priority:</span>
                <span className="font-bold text-rose-600">{selectedOrder.priority}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerToast(`Order ${selectedOrder.id} added to priority trip allocation`);
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
