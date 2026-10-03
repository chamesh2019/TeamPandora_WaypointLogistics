"use client";

import React, { useState, useMemo } from "react";
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
  Filter,
  Download,
  Eye,
  Snowflake,
  Check,
  CheckCircle2,
  Wrench,
  AlertCircle,
  X,
  Gauge,
  Thermometer,
  Fuel,
  MapPin,
  Calendar,
  User,
  SlidersHorizontal,
} from "lucide-react";

interface FleetVehicle {
  id: string;
  type: "Reefer Truck" | "Ambient";
  temperature: string;
  capacityKg: number;
  volumeM3: number;
  fuelPct: number;
  status: "Active" | "Idle" | "Workshop";
  driver: string;
  depot: "Peliyagoda" | "Kandy";
  tripAssigned: string | null;
  odometerKm?: number;
  engineTemp?: string;
  lastService?: string;
}

const INITIAL_FLEET: FleetVehicle[] = [
  {
    id: "WP NC-4872",
    type: "Reefer Truck",
    temperature: "Chilled (-2°C)",
    capacityKg: 5000,
    volumeM3: 24,
    fuelPct: 72,
    status: "Active",
    driver: "N. Perera",
    depot: "Peliyagoda",
    tripAssigned: "TRP-250613-04",
    odometerKm: 84320,
    engineTemp: "88°C (Normal)",
    lastService: "02 May 2025",
  },
  {
    id: "CP LM-2134",
    type: "Reefer Truck",
    temperature: "Chilled (-2°C)",
    capacityKg: 4500,
    volumeM3: 21,
    fuelPct: 58,
    status: "Active",
    driver: "S. Bandara",
    depot: "Kandy",
    tripAssigned: "TRP-250613-07",
    odometerKm: 112450,
    engineTemp: "91°C (Normal)",
    lastService: "18 Apr 2025",
  },
  {
    id: "WP KL-8301",
    type: "Ambient",
    temperature: "Ambient",
    capacityKg: 3000,
    volumeM3: 18,
    fuelPct: 84,
    status: "Active",
    driver: "R. Silva",
    depot: "Peliyagoda",
    tripAssigned: "TRP-250613-09",
    odometerKm: 67800,
    engineTemp: "85°C (Normal)",
    lastService: "22 May 2025",
  },
  {
    id: "WP NC-3308",
    type: "Reefer Truck",
    temperature: "Chilled (-2°C)",
    capacityKg: 5000,
    volumeM3: 24,
    fuelPct: 91,
    status: "Idle",
    driver: "Unassigned",
    depot: "Peliyagoda",
    tripAssigned: null,
    odometerKm: 42100,
    engineTemp: "Ambient (Off)",
    lastService: "10 Jun 2025",
  },
  {
    id: "WP GE-1145",
    type: "Ambient",
    temperature: "Ambient",
    capacityKg: 2500,
    volumeM3: 14,
    fuelPct: 23,
    status: "Workshop",
    driver: "Unassigned",
    depot: "Peliyagoda",
    tripAssigned: null,
    odometerKm: 154200,
    engineTemp: "Maintenance Mode",
    lastService: "Under Repair (Brakes)",
  },
  {
    id: "NWP RA-7762",
    type: "Ambient",
    temperature: "Ambient",
    capacityKg: 3000,
    volumeM3: 18,
    fuelPct: 67,
    status: "Idle",
    driver: "Unassigned",
    depot: "Kandy",
    tripAssigned: null,
    odometerKm: 98120,
    engineTemp: "Ambient (Off)",
    lastService: "15 May 2025",
  },
  {
    id: "SP NB-9912",
    type: "Reefer Truck",
    temperature: "Chilled (-2°C)",
    capacityKg: 4000,
    volumeM3: 20,
    fuelPct: 88,
    status: "Active",
    driver: "A. Fernando",
    depot: "Peliyagoda",
    tripAssigned: "TRP-250613-11",
    odometerKm: 53100,
    engineTemp: "87°C (Normal)",
    lastService: "28 May 2025",
  },
  {
    id: "WP KV-4419",
    type: "Ambient",
    temperature: "Ambient",
    capacityKg: 3500,
    volumeM3: 16,
    fuelPct: 45,
    status: "Idle",
    driver: "Unassigned",
    depot: "Peliyagoda",
    tripAssigned: null,
    odometerKm: 76300,
    engineTemp: "Ambient (Off)",
    lastService: "04 Jun 2025",
  },
];

export default function DispatcherFleetPage() {
  const [fleet, setFleet] = useState<FleetVehicle[]>(INITIAL_FLEET);
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Idle" | "Workshop">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(null);
  const [assigningVehicle, setAssigningVehicle] = useState<FleetVehicle | null>(null);
  const [assignDriverName, setAssignDriverName] = useState("K. Senaratne");
  const [assignTripCode, setAssignTripCode] = useState("TRP-250614-03");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [depotFilter, setDepotFilter] = useState<"All" | "Peliyagoda" | "Kandy">("All");
  const [typeFilter, setTypeFilter] = useState<"All" | "Reefer Truck" | "Ambient">("All");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered fleet list
  const filteredFleet = useMemo(() => {
    return fleet.filter((v) => {
      const matchesStatus = statusFilter === "All" || v.status === statusFilter;
      const matchesDepot = depotFilter === "All" || v.depot === depotFilter;
      const matchesType = typeFilter === "All" || v.type === typeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        v.id.toLowerCase().includes(q) ||
        v.driver.toLowerCase().includes(q) ||
        v.depot.toLowerCase().includes(q) ||
        (v.tripAssigned && v.tripAssigned.toLowerCase().includes(q));
      return matchesStatus && matchesDepot && matchesType && matchesSearch;
    });
  }, [fleet, statusFilter, depotFilter, typeFilter, searchQuery]);

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Vehicle ID",
      "Type",
      "Temperature",
      "Capacity (kg)",
      "Volume (m3)",
      "Fuel %",
      "Status",
      "Driver",
      "Depot",
      "Trip Assigned",
    ];
    const rows = filteredFleet.map((v) => [
      v.id,
      v.type,
      v.temperature,
      v.capacityKg,
      v.volumeM3,
      `${v.fuelPct}%`,
      v.status,
      v.driver,
      v.depot,
      v.tripAssigned || "Unassigned",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fleet_manifest_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Fleet manifest CSV exported successfully");
  };

  // Handle Vehicle Assignment
  const handleConfirmAssignment = () => {
    if (!assigningVehicle) return;
    setFleet((prev) =>
      prev.map((v) => {
        if (v.id === assigningVehicle.id) {
          return {
            ...v,
            status: "Active",
            driver: assignDriverName,
            tripAssigned: assignTripCode,
          };
        }
        return v;
      })
    );
    triggerToast(`Vehicle ${assigningVehicle.id} assigned to driver ${assignDriverName} on ${assignTripCode}`);
    setAssigningVehicle(null);
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
      {/* 2. MAIN FLEET CONTENT CONTAINER */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-[1550px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-5">
        {/* SUBHEADER: Title & Filter / Export Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Fleet management</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              31 vehicles · Peliyagoda and Kandy depots
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Filters Button */}
            <button
              onClick={() => setShowFilterDrawer(true)}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-slate-600" />
              <span>Filters</span>
              {(depotFilter !== "All" || typeFilter !== "All") && (
                <span className="w-2 h-2 rounded-full bg-[#F5C542]" />
              )}
            </button>

            {/* Export Button */}
            <button
              onClick={handleExportCSV}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* 4 KPI METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total fleet */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Total fleet</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">31</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Both depots</div>
            </div>
            {/* 10 graduated bars */}
            <div className="flex items-end gap-1.5 h-8 mt-3">
              {[30, 42, 38, 55, 60, 52, 68, 62, 75].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-[#D9E8F9] rounded-xs"
                />
              ))}
              <div style={{ height: "100%" }} className="flex-1 bg-[#2563EB] rounded-xs" />
            </div>
          </div>

          {/* Card 2: Available */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Available</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">24</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Ready for dispatch</div>
            </div>
            {/* 10 graduated bars */}
            <div className="flex items-end gap-1.5 h-8 mt-3">
              {[28, 38, 48, 42, 62, 52, 68, 62, 80].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-[#D1FAE5] rounded-xs"
                />
              ))}
              <div style={{ height: "100%" }} className="flex-1 bg-[#10B981] rounded-xs" />
            </div>
          </div>

          {/* Card 3: Reefer trucks */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Reefer trucks</span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Snowflake className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">12</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">8 available now</div>
            </div>
            {/* 10 graduated bars */}
            <div className="flex items-end gap-1.5 h-8 mt-3">
              {[25, 35, 45, 40, 58, 50, 65, 70, 62].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-[#EDE9FE] rounded-xs"
                />
              ))}
              <div style={{ height: "100%" }} className="flex-1 bg-[#7C3AED] rounded-xs" />
            </div>
          </div>

          {/* Card 4: In workshop */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">In workshop</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">3</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Est. 2 days avg</div>
            </div>
            {/* 10 graduated bars */}
            <div className="flex items-end gap-1.5 h-8 mt-3">
              {[22, 32, 40, 48, 44, 60, 68, 74, 70].map((h, i) => (
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

        {/* FLEET TABLE SECTION */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Table Header Controls */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(["All", "Active", "Idle", "Workshop"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-slate-100 text-slate-900 font-bold border border-slate-300/80"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Table Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 w-full sm:w-60 focus:outline-none focus:border-[#F5C542] transition-all"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  <th className="py-3 px-4">Vehicle ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Temperature</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Volume</th>
                  <th className="py-3 px-4">Fuel</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4">Depot</th>
                  <th className="py-3 px-4">Trip Assigned</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredFleet.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-xs text-slate-400">
                      No vehicles found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredFleet.map((v) => {
                    // Fuel color indicator
                    const fuelColor =
                      v.fuelPct > 60
                        ? "bg-emerald-500"
                        : v.fuelPct > 35
                        ? "bg-amber-500"
                        : "bg-red-500";

                    return (
                      <tr
                        key={v.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => setSelectedVehicle(v)}
                      >
                        {/* 1. Vehicle ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {v.id}
                        </td>

                        {/* 2. Type */}
                        <td className="py-3.5 px-4">
                          {v.type === "Reefer Truck" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
                              <Snowflake className="w-3 h-3 text-sky-500" />
                              <span>Reefer Truck</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              <span>Ambient</span>
                            </span>
                          )}
                        </td>

                        {/* 3. Temperature */}
                        <td className="py-3.5 px-4 text-slate-600">
                          {v.temperature}
                        </td>

                        {/* 4. Capacity */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                          {v.capacityKg.toLocaleString()} kg
                        </td>

                        {/* 5. Volume */}
                        <td className="py-3.5 px-4 text-slate-600">
                          {v.volumeM3} m³
                        </td>

                        {/* 6. Fuel Progress Bar */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[11px] text-slate-700 w-8">
                              {v.fuelPct}%
                            </span>
                            <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${v.fuelPct}%` }}
                                className={`h-full rounded-full ${fuelColor}`}
                              />
                            </div>
                          </div>
                        </td>

                        {/* 7. Status */}
                        <td className="py-3.5 px-4">
                          {v.status === "Active" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                              Active
                            </span>
                          )}
                          {v.status === "Idle" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              Idle
                            </span>
                          )}
                          {v.status === "Workshop" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                              Workshop
                            </span>
                          )}
                        </td>

                        {/* 8. Driver */}
                        <td className="py-3.5 px-4">
                          <span
                            className={
                              v.driver === "Unassigned"
                                ? "text-slate-400 italic"
                                : "text-slate-700 font-medium"
                            }
                          >
                            {v.driver}
                          </span>
                        </td>

                        {/* 9. Depot */}
                        <td className="py-3.5 px-4 text-slate-600">
                          {v.depot}
                        </td>

                        {/* 10. Trip Assigned */}
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {v.tripAssigned ? (
                            <span className="text-slate-800 font-medium">
                              {v.tripAssigned}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* 11. Actions */}
                        <td
                          className="py-3.5 px-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Eye details button */}
                            <button
                              onClick={() => setSelectedVehicle(v)}
                              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              title="View Diagnostics"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Assign button on Idle vehicles */}
                            {v.status === "Idle" && (
                              <button
                                onClick={() => setAssigningVehicle(v)}
                                className="bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] text-xs font-bold px-3 py-1 rounded-md shadow-sm transition-colors cursor-pointer"
                              >
                                Assign
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL 1: Vehicle Diagnostics & Telematics */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#F5C542]" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-mono">
                    {selectedVehicle.id}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {selectedVehicle.depot} Depot · {selectedVehicle.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-4 text-xs">
              {/* Telematics Cards Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-medium">Fuel Level</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Fuel className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-base text-slate-900">
                      {selectedVehicle.fuelPct}%
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-medium">Engine Temp</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Thermometer className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900">
                      {selectedVehicle.engineTemp || "88°C"}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-medium">Odometer</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Gauge className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-slate-900 font-mono">
                      {selectedVehicle.odometerKm?.toLocaleString() || "84,320"} km
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-medium">Last Inspection</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-slate-900">
                      {selectedVehicle.lastService || "Verified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assignment Overview */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Current Status:</span>
                  <span className="font-bold text-slate-900">{selectedVehicle.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Assigned Driver:</span>
                  <span className="font-bold text-slate-900">{selectedVehicle.driver}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Scheduled Trip:</span>
                  <span className="font-bold font-mono text-slate-900">
                    {selectedVehicle.tripAssigned || "No active trip assigned"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Max Payload:</span>
                  <span className="font-bold font-mono text-slate-900">
                    {selectedVehicle.capacityKg.toLocaleString()} kg · {selectedVehicle.volumeM3} m³
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedVehicle(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Assign Vehicle to Driver & Trip */}
      {assigningVehicle && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Assign Vehicle {assigningVehicle.id}
                </h3>
                <p className="text-xs text-slate-500">
                  Ready at {assigningVehicle.depot} Depot ({assigningVehicle.volumeM3} m³)
                </p>
              </div>
              <button
                onClick={() => setAssigningVehicle(null)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Assign Driver
                </label>
                <select
                  value={assignDriverName}
                  onChange={(e) => setAssignDriverName(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] bg-white"
                >
                  <option value="K. Senaratne">K. Senaratne (Peliyagoda · Available)</option>
                  <option value="A. Fernando">A. Fernando (Peliyagoda · Available)</option>
                  <option value="M. Jayawardena">M. Jayawardena (Kandy · Available)</option>
                  <option value="T. Dissanayake">T. Dissanayake (Express Courier)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Trip Assignment
                </label>
                <select
                  value={assignTripCode}
                  onChange={(e) => setAssignTripCode(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] bg-white font-mono"
                >
                  <option value="TRP-250614-03">TRP-250614-03 · Peliyagoda (Incomplete)</option>
                  <option value="TRP-250614-04">TRP-250614-04 · Kandy Regional (Draft)</option>
                  <option value="TRP-250614-05">TRP-250614-05 · Express Fresh (Draft)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setAssigningVehicle(null)}
                className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssignment}
                className="px-4 py-1.5 font-bold bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] rounded-lg shadow-sm"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Filters Drawer / Modal */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-600" />
                <span>Filter Fleet</span>
              </h3>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Depot</label>
                <select
                  value={depotFilter}
                  onChange={(e) => setDepotFilter(e.target.value as any)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] bg-white"
                >
                  <option value="All">All Depots</option>
                  <option value="Peliyagoda">Peliyagoda Central Depot</option>
                  <option value="Kandy">Kandy Regional Depot</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vehicle Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] bg-white"
                >
                  <option value="All">All Types</option>
                  <option value="Reefer Truck">Reefer Truck (Chilled)</option>
                  <option value="Ambient">Ambient Box</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <button
                onClick={() => {
                  setDepotFilter("All");
                  setTypeFilter("All");
                }}
                className="text-slate-500 hover:text-slate-700 font-medium"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="px-4 py-1.5 font-bold bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] rounded-lg shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
