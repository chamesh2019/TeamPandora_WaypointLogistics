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
  Phone,
  Navigation,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Check,
  ChevronRight,
} from "lucide-react";

interface LiveVehicle {
  id: string;
  nodeNumber: string;
  status: "On route" | "Delayed" | "Idle" | "Workshop";
  driver: string;
  route: string;
  stops: string;
  eta: string;
  delayText?: string;
  position: { left: string; top: string };
  nodeColor: "yellow" | "red" | "slate";
  phone: string;
  waypoints?: string[];
}

const LIVE_VEHICLES: LiveVehicle[] = [
  {
    id: "WP NC-4872",
    nodeNumber: "014",
    status: "On route",
    driver: "N. Perera",
    route: "Colombo North",
    stops: "8 / 12",
    eta: "07:42",
    position: { left: "24%", top: "36%" },
    nodeColor: "yellow",
    phone: "+94 77 234 5678",
    waypoints: [
      "Peliyagoda Central Depot (Departed 05:30)",
      "Wattala Super Fresh (Completed 06:15)",
      "Ja-Ela Express (Completed 06:45)",
      "Kandana Mart (Completed 07:10)",
      "Ragama General Hospital (Current Stop 8/12 - Unloading)",
      "Mahabage Fresh (ETA 07:42)",
      "Hendala Branch (ETA 08:05)",
      "Peliyagoda Return Bay (ETA 08:35)",
    ],
  },
  {
    id: "CP LM-2134",
    nodeNumber: "037",
    status: "Delayed",
    driver: "S. Bandara",
    route: "Kandy Central",
    stops: "3 / 7",
    eta: "08:15",
    delayText: "+12 min",
    position: { left: "68%", top: "25%" },
    nodeColor: "red",
    phone: "+94 71 889 1234",
    waypoints: [
      "Kandy Regional Depot (Departed 06:15)",
      "Peradeniya Fresh (Completed 06:50)",
      "Katugastota Central (Completed 07:30)",
      "Kandy Lake Round (Heavy Traffic Congestion)",
      "Dalada Veediya Fresh (ETA 08:15 +12m delay)",
      "Kandy City Centre Mart (ETA 08:45)",
      "Kandy Depot Return (ETA 09:20)",
    ],
  },
  {
    id: "WP KL-8301",
    nodeNumber: "009",
    status: "On route",
    driver: "R. Silva",
    route: "Colombo South",
    stops: "2 / 11",
    eta: "09:05",
    position: { left: "38%", top: "65%" },
    nodeColor: "yellow",
    phone: "+94 76 543 9876",
    waypoints: [
      "Peliyagoda Depot (Departed 06:45)",
      "Kollupitiya Super (Completed 07:20)",
      "Bambalapitiya Fresh (Current Stop 2/11)",
      "Wellawatte Express (ETA 08:10)",
      "Dehiwala Central (ETA 08:35)",
      "Mount Lavinia Mart (ETA 09:05)",
    ],
  },
  {
    id: "NWP RA-7762",
    nodeNumber: "011",
    status: "Idle",
    driver: "Unassigned",
    route: "—",
    stops: "—",
    eta: "—",
    position: { left: "78%", top: "56%" },
    nodeColor: "slate",
    phone: "+94 77 000 0000",
  },
  {
    id: "WP GE-1145",
    nodeNumber: "015",
    status: "Workshop",
    driver: "Unassigned",
    route: "—",
    stops: "—",
    eta: "—",
    position: { left: "52%", top: "50%" },
    nodeColor: "slate",
    phone: "+94 77 000 0000",
  },
];

export default function DispatcherLiveRoutesPage() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("WP NC-4872");
  const [filterMode, setFilterMode] = useState<"All" | "Active" | "Delayed" | "Idle">("All");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showCallModal, setShowCallModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertText, setAlertText] = useState("Heavy congestion reported on route. Divert via Marine Drive.");

  const selectedVehicle =
    LIVE_VEHICLES.find((v) => v.id === selectedVehicleId) || LIVE_VEHICLES[0];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendAlert = () => {
    triggerToast(`High-priority alert dispatched to ${selectedVehicle.driver} (${selectedVehicle.id})`);
    setShowAlertModal(false);
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
      {/* 2. MAIN LIVE ROUTES CONTENT CONTAINER */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-[1550px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-4">
        {/* SUBHEADER: Title & Live Operations badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            {/* Live Operations Chip */}
            <div className="inline-flex items-center gap-1.5 bg-[#FFF8E7] text-[#B45309] border border-[#FDE68A] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1">
              <MapPin className="w-3 h-3 text-[#B45309]" />
              <span>Live Operations</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Live Routes</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Real-time fleet position · All depots
            </p>
          </div>

          {/* Right Tools */}
          <div className="flex items-center gap-2.5">
            {/* 18 vehicles tracked */}
            <div className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>18 vehicles tracked</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => triggerToast("Live GPS telemetry refreshed for all active vehicles")}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-600" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 3. LIVE OPERATIONS RADAR / MAP CARD */}
        <div className="bg-[#0B1528] rounded-xl border border-slate-700/40 shadow-sm relative h-[310px] overflow-hidden">
          {/* Subtle Radar Background Grid Lines */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#60A5FA" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#radarGrid)" />
            </svg>
          </div>

          {/* Map Status Pills in Top Left */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            {/* 12 Active */}
            <button
              onClick={() => setFilterMode("Active")}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                filterMode === "Active"
                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/80 ring-2 ring-emerald-500/30"
                  : "bg-[#132338]/90 text-white/80 border border-white/10 hover:border-emerald-500/50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>12 Active</span>
            </button>

            {/* 1 Delayed */}
            <button
              onClick={() => setFilterMode("Delayed")}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                filterMode === "Delayed"
                  ? "bg-rose-950/80 text-rose-300 border border-rose-500/80 ring-2 ring-rose-500/30"
                  : "bg-[#132338]/90 text-white/80 border border-white/10 hover:border-rose-500/50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-rose-400 font-bold">1 Delayed</span>
            </button>

            {/* 3 Idle */}
            <button
              onClick={() => setFilterMode("Idle")}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                filterMode === "Idle"
                  ? "bg-slate-800 text-white border border-slate-400 ring-2 ring-slate-400/30"
                  : "bg-[#132338]/90 text-white/70 border border-white/10 hover:border-slate-500"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>3 Idle</span>
            </button>
          </div>

          {/* Interactive Vehicle Nodes Placed on the Dark Map */}
          {LIVE_VEHICLES.map((vehicle) => {
            const isSelected = vehicle.id === selectedVehicleId;

            return (
              <div
                key={vehicle.id}
                onClick={() => setSelectedVehicleId(vehicle.id)}
                style={{
                  left: vehicle.position.left,
                  top: vehicle.position.top,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group transition-transform z-20 hover:scale-110"
              >
                {/* Glow ring if selected */}
                {isSelected && (
                  <span className="absolute -inset-2 rounded-full bg-[#F5C542]/25 animate-pulse" />
                )}

                {/* Node Circle */}
                {vehicle.nodeColor === "yellow" && (
                  <div
                    className={`w-8 h-8 rounded-full bg-[#F5C542] text-[#0F1928] font-black text-xs flex items-center justify-center shadow-lg transition-all ${
                      isSelected
                        ? "ring-4 ring-[#F5C542]/40 shadow-[0_0_20px_rgba(245,197,66,0.8)]"
                        : "group-hover:ring-2 group-hover:ring-[#F5C542]/50"
                    }`}
                  >
                    {vehicle.nodeNumber}
                  </div>
                )}

                {vehicle.nodeColor === "red" && (
                  <div
                    className={`w-8 h-8 rounded-full bg-[#EF4444] text-white font-black text-xs flex items-center justify-center shadow-lg transition-all animate-pulse ${
                      isSelected
                        ? "ring-4 ring-rose-500/40 shadow-[0_0_20px_rgba(239,68,68,0.8)]"
                        : "group-hover:ring-2 group-hover:ring-rose-400"
                    }`}
                  >
                    {vehicle.nodeNumber}
                  </div>
                )}

                {vehicle.nodeColor === "slate" && (
                  <div
                    className={`w-8 h-8 rounded-full bg-[#334155] text-slate-300 font-bold text-xs flex items-center justify-center shadow-md transition-all ${
                      isSelected
                        ? "ring-4 ring-slate-400/40 shadow-[0_0_15px_rgba(148,163,184,0.5)]"
                        : "group-hover:ring-2 group-hover:ring-slate-400"
                    }`}
                  >
                    {vehicle.nodeNumber}
                  </div>
                )}

                {/* Vehicle Plate Tag below */}
                <div className="mt-1 px-1.5 py-0.5 rounded bg-[#070F1E]/95 border border-white/20 text-[9px] font-mono font-medium text-white shadow-md whitespace-nowrap">
                  {vehicle.id}
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. VEHICLE STATUS CARDS GRID (3 on top row, 2 on second row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Card 1: WP NC-4872 (Selected) */}
          {LIVE_VEHICLES.slice(0, 3).map((vehicle) => {
            const isSelected = vehicle.id === selectedVehicleId;
            return (
              <div
                key={vehicle.id}
                onClick={() => setSelectedVehicleId(vehicle.id)}
                className={`rounded-xl p-4 transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-[#FFFDF5] border-[#F5C542] ring-1 ring-[#F5C542] shadow-sm"
                    : "bg-white border-slate-200/80 hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                }`}
              >
                {/* Header row: ID & Status Badge */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {vehicle.id}
                  </span>
                  {vehicle.status === "On route" && (
                    <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-medium px-2 py-0.5 rounded-full">
                      On route
                    </span>
                  )}
                  {vehicle.status === "Delayed" && (
                    <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-medium px-2 py-0.5 rounded-full">
                      Delayed
                    </span>
                  )}
                  {vehicle.status === "Idle" && (
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium px-2 py-0.5 rounded-full">
                      Idle
                    </span>
                  )}
                  {vehicle.status === "Workshop" && (
                    <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-medium px-2 py-0.5 rounded-full">
                      Workshop
                    </span>
                  )}
                </div>

                {/* Content Rows */}
                <div className="mt-2.5 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Driver</span>
                    <span className="font-semibold text-slate-800">{vehicle.driver}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Route</span>
                    <span className="font-semibold text-slate-800">{vehicle.route}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Stops</span>
                    <span className="font-semibold text-slate-800">{vehicle.stops}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">ETA</span>
                    <span className="font-semibold text-slate-800">
                      {vehicle.eta}
                      {vehicle.delayText && (
                        <span className="text-rose-600 font-bold ml-1.5">
                          {vehicle.delayText}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Row 2: 2 cards (NWP RA-7762 and WP GE-1145) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {LIVE_VEHICLES.slice(3, 5).map((vehicle) => {
            const isSelected = vehicle.id === selectedVehicleId;
            return (
              <div
                key={vehicle.id}
                onClick={() => setSelectedVehicleId(vehicle.id)}
                className={`rounded-xl p-4 transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-[#FFFDF5] border-[#F5C542] ring-1 ring-[#F5C542] shadow-sm"
                    : "bg-white border-slate-200/80 hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                }`}
              >
                {/* Header row: ID & Status Badge */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {vehicle.id}
                  </span>
                  {vehicle.status === "Idle" && (
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium px-2 py-0.5 rounded-full">
                      Idle
                    </span>
                  )}
                  {vehicle.status === "Workshop" && (
                    <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-medium px-2 py-0.5 rounded-full">
                      Workshop
                    </span>
                  )}
                </div>

                {/* Content Rows */}
                <div className="mt-2.5 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Driver</span>
                    <span className="text-slate-400">{vehicle.driver}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Route</span>
                    <span className="text-slate-400">{vehicle.route}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Stops</span>
                    <span className="text-slate-400">{vehicle.stops}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">ETA</span>
                    <span className="text-slate-400">{vehicle.eta}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 5. BOTTOM DETAILS BAR: Selected · WP NC-4872 */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5 mt-1">
          {/* Header row: Selected title & Status pill */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm text-slate-900 font-mono tracking-tight">
                Selected · {selectedVehicle.id}
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Live tracking · {selectedVehicle.driver}
              </p>
            </div>
            <div>
              {selectedVehicle.status === "On route" && (
                <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-medium px-2.5 py-0.5 rounded-full">
                  On route
                </span>
              )}
              {selectedVehicle.status === "Delayed" && (
                <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-medium px-2.5 py-0.5 rounded-full">
                  Delayed
                </span>
              )}
              {selectedVehicle.status === "Idle" && (
                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium px-2.5 py-0.5 rounded-full">
                  Idle
                </span>
              )}
              {selectedVehicle.status === "Workshop" && (
                <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-medium px-2.5 py-0.5 rounded-full">
                  Workshop
                </span>
              )}
            </div>
          </div>

          {/* 4-Column Grid: ROUTE, STOPS, ETA, DRIVER */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 py-3.5">
            <div className="pr-4 py-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Route
              </span>
              <span className="text-sm font-bold text-slate-900 block mt-0.5">
                {selectedVehicle.route}
              </span>
            </div>

            <div className="sm:px-4 py-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Stops
              </span>
              <span className="text-sm font-bold text-slate-900 block mt-0.5">
                {selectedVehicle.stops}
              </span>
            </div>

            <div className="sm:px-4 py-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                ETA
              </span>
              <span className="text-sm font-bold text-slate-900 block mt-0.5">
                {selectedVehicle.eta}
                {selectedVehicle.delayText && (
                  <span className="text-rose-600 font-bold ml-1.5">
                    {selectedVehicle.delayText}
                  </span>
                )}
              </span>
            </div>

            <div className="sm:pl-4 py-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Driver
              </span>
              <span className="text-sm font-bold text-slate-900 block mt-0.5">
                {selectedVehicle.driver}
              </span>
            </div>
          </div>

          {/* Action Buttons: Call Driver, Track Route, Send Alert */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
            {/* Call driver */}
            <button
              onClick={() => setShowCallModal(true)}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-slate-600" />
              <span>Call driver</span>
            </button>

            {/* Track route */}
            <button
              onClick={() => setShowTrackModal(true)}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-slate-600" />
              <span>Track route</span>
            </button>

            {/* Send alert (Yellow Button) */}
            <button
              onClick={() => setShowAlertModal(true)}
              className="bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#0F1928]" />
              <span>Send alert</span>
            </button>
          </div>
        </div>
      </main>

      {/* MODAL 1: Call Driver */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Direct Dispatcher Call</h3>
                <p className="text-xs text-slate-500">{selectedVehicle.driver}</p>
              </div>
            </div>

            <div className="my-4 text-xs text-slate-600 space-y-2">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                <span className="text-[11px] text-slate-400 block">Cellular Link</span>
                <span className="font-mono font-bold text-base text-slate-900">
                  {selectedVehicle.phone}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                  ● Hands-free in-cab headset connected
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowCallModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  triggerToast(`Call initiated to ${selectedVehicle.driver}`);
                  setShowCallModal(false);
                }}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Dial Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Track Route Waypoints */}
      {showTrackModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Route Waypoint Sequence · {selectedVehicle.id}
                </h3>
              </div>
              <button
                onClick={() => setShowTrackModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="my-3 space-y-2 max-h-64 overflow-y-auto text-xs">
              {selectedVehicle.waypoints && selectedVehicle.waypoints.length > 0 ? (
                selectedVehicle.waypoints.map((wp, idx) => {
                  const isDone = wp.includes("Completed") || wp.includes("Departed");
                  const isCurrent = wp.includes("Current");

                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                        isCurrent
                          ? "bg-amber-50 border-amber-200 font-semibold text-amber-900"
                          : isDone
                          ? "bg-slate-50 border-slate-200/80 text-slate-500"
                          : "bg-white border-slate-200 text-slate-800"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                          isDone
                            ? "bg-emerald-100 text-emerald-700"
                            : isCurrent
                            ? "bg-[#F5C542] text-[#0F1928]"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div>{wp}</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-slate-400">
                  No active waypoints for this vehicle.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowTrackModal(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Send Alert */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Send Mobile Alert to {selectedVehicle.driver}
                </h3>
                <p className="text-xs text-slate-500">Cab Telematics Display</p>
              </div>
            </div>

            <div className="my-4 space-y-2 text-xs">
              <label className="block font-bold text-slate-700">Dispatch Message</label>
              <textarea
                rows={3}
                value={alertText}
                onChange={(e) => setAlertText(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-[#F5C542]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAlertModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendAlert}
                className="px-4 py-1.5 text-xs font-bold bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>Send Alert</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
