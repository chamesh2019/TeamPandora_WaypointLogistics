"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Truck,
  Search,
  Filter,
  Download,
  Eye,
  Snowflake,
  Check,
  CheckCircle2,
  AlertTriangle,
  Fuel,
  SlidersHorizontal,
  RefreshCw,
  Gauge,
  Thermometer,
  Calendar,
  User,
  AlertCircle,
  Wrench,
  ExternalLink,
} from "lucide-react";
import type {
  DispatcherFleetVehicleDto,
  DispatcherFleetKpisResponseData,
} from "../../../lib/types/dispatcher-api";

export default function DispatcherFleetPage() {
  const [fleet, setFleet] = useState<DispatcherFleetVehicleDto[]>([]);
  const [kpisData, setKpisData] = useState<DispatcherFleetKpisResponseData | null>(null);
  const [drivers, setDrivers] = useState<Array<{ id: string; name: string; phone?: string }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters state
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Idle" | "Workshop">("All");
  const [depotFilter, setDepotFilter] = useState<"All" | "PELIYAGODA" | "KANDY">("All");
  const [typeFilter, setTypeFilter] = useState<"All" | "Reefer Truck" | "Ambient" | "Van">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Modals state
  const [selectedVehicle, setSelectedVehicle] = useState<DispatcherFleetVehicleDto | null>(null);
  const [assigningVehicle, setAssigningVehicle] = useState<DispatcherFleetVehicleDto | null>(null);
  const [assignDriverId, setAssignDriverId] = useState<string>("");
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  const triggerToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch live fleet roster & KPIs
  const fetchFleetData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const depotParam = depotFilter !== "All" ? `?depotId=${depotFilter}` : "";
      const [fleetRes, kpiRes] = await Promise.all([
        fetch(`/api/dispatcher/fleet${depotParam}`),
        fetch(`/api/dispatcher/fleet/kpis${depotParam}`),
      ]);

      if (fleetRes.ok) {
        const fleetJson = await fleetRes.json();
        if (fleetJson.success && fleetJson.data) {
          setFleet(fleetJson.data.vehicles || []);
          setDrivers(fleetJson.data.drivers || []);
        }
      }

      if (kpiRes.ok) {
        const kpiJson = await kpiRes.json();
        if (kpiJson.success && kpiJson.data) {
          setKpisData(kpiJson.data);
        }
      }
    } catch {
      triggerToast("Failed to load live fleet information", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [depotFilter]);

  useEffect(() => {
    fetchFleetData();
  }, [fetchFleetData]);

  // Client-side filtering
  const filteredFleet = useMemo(() => {
    return fleet.filter((v) => {
      const matchesStatus = statusFilter === "All" || v.operationalStatus === statusFilter;
      const matchesDepot = depotFilter === "All" || v.depotId === depotFilter;
      
      let matchesType = true;
      if (typeFilter === "Reefer Truck") {
        matchesType = v.temp === "reefer" && v.type === "truck";
      } else if (typeFilter === "Ambient") {
        matchesType = v.temp === "ambient";
      } else if (typeFilter === "Van") {
        matchesType = v.type === "van";
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        v.id.toLowerCase().includes(q) ||
        (v.assignedDriverName && v.assignedDriverName.toLowerCase().includes(q)) ||
        v.depotId.toLowerCase().includes(q) ||
        (v.activeTripId && v.activeTripId.toLowerCase().includes(q));

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
      "Weekly Fuel Used (L)",
      "Weekly Fuel Quota (L)",
      "Status",
      "Driver",
      "Depot",
      "Active Trip",
    ];
    const rows = filteredFleet.map((v) => [
      v.id,
      v.type === "van" ? "Van" : "Truck",
      v.temp === "reefer" ? "Reefer (Chilled)" : "Ambient",
      v.weightCapKg,
      v.volumeCapM3,
      `${v.fuelPct}%`,
      v.fuelUsedThisWeekL,
      v.weeklyFuelQuotaL,
      v.operationalStatus,
      v.assignedDriverName || "Unassigned",
      v.depotId,
      v.activeTripId || "None",
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

  // Handle Driver Assignment
  const handleOpenAssignModal = (vehicle: DispatcherFleetVehicleDto) => {
    setAssigningVehicle(vehicle);
    setAssignDriverId(vehicle.assignedDriverId || "");
  };

  const handleConfirmAssignment = async () => {
    if (!assigningVehicle) return;
    setIsSubmittingAction(true);
    try {
      const res = await fetch("/api/dispatcher/fleet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: assigningVehicle.id,
          driverId: assignDriverId || null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to update driver assignment");
      }

      triggerToast(`Driver assignment updated for vehicle ${assigningVehicle.id}`);
      setAssigningVehicle(null);
      await fetchFleetData(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error assigning driver";
      triggerToast(msg, "error");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle Maintenance Toggle (Available <-> In Workshop)
  const handleToggleWorkshop = async (
    vehicle: DispatcherFleetVehicleDto,
    newStatus: "available" | "in_workshop"
  ) => {
    setIsSubmittingAction(true);
    try {
      const res = await fetch("/api/dispatcher/fleet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          status: newStatus,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to update vehicle status");
      }

      const statusText = newStatus === "in_workshop" ? "placed into workshop" : "released from workshop";
      triggerToast(`Vehicle ${vehicle.id} ${statusText}`);
      if (selectedVehicle && selectedVehicle.id === vehicle.id) {
        setSelectedVehicle((prev) =>
          prev ? { ...prev, dbStatus: newStatus, operationalStatus: newStatus === "in_workshop" ? "Workshop" : "Idle" } : null
        );
      }
      await fetchFleetData(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating workshop status";
      triggerToast(msg, "error");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Helper to render 10 graduated bars
  const renderKpiBars = (
    history: Array<{ date: string; value: number }> | undefined,
    colorClass: string,
    activeColorClass: string
  ) => {
    if (!history || history.length === 0) {
      return (
        <div className="flex items-end gap-1.5 h-8 mt-3">
          {[30, 42, 38, 55, 60, 52, 68, 62, 75, 100].map((h, i) => (
            <div
              key={i}
              style={{ height: `${h}%` }}
              className={`flex-1 rounded-xs ${i === 9 ? activeColorClass : colorClass}`}
            />
          ))}
        </div>
      );
    }

    const maxVal = Math.max(...history.map((h) => h.value), 1);

    return (
      <div className="flex items-end gap-1.5 h-8 mt-3">
        {history.map((item, i) => {
          const isToday = i === history.length - 1;
          const barHeight = Math.max(15, Math.round((item.value / maxVal) * 100));
          return (
            <div
              key={item.date || i}
              title={`${item.date}: ${item.value}`}
              style={{ height: `${barHeight}%` }}
              className={`flex-1 rounded-xs transition-all cursor-pointer hover:opacity-80 ${
                isToday ? activeColorClass : colorClass
              }`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-lg shadow-xl border flex items-center gap-3 animate-fade-in ${
            toastMessage.type === "error"
              ? "bg-[#1f1418] text-rose-200 border-rose-500/40"
              : "bg-[#0F1928] text-white border-[#F5C542]/40"
          }`}
        >
          {toastMessage.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[#F5C542]" />
          )}
          <span className="text-xs font-medium">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* MAIN FLEET CONTENT CONTAINER */}
      <main className="flex-1 max-w-[1550px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-5">
        {/* SUBHEADER: Title & Filter / Export Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Fleet management</h1>
              <button
                onClick={() => fetchFleetData(true)}
                disabled={isRefreshing}
                title="Refresh fleet data"
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#F5C542]" : ""}`} />
              </button>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isLoading
                ? "Loading fleet records..."
                : `${fleet.length} vehicles registered · ${
                    depotFilter === "All"
                      ? "Peliyagoda and Kandy depots"
                      : `${depotFilter} Depot`
                  }`}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Filters Button */}
            <button
              onClick={() => setShowFilterDrawer(true)}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
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
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* 4 KPI METRIC CARDS WITH 10-DAY HISTORY CHARTS */}
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
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {isLoading ? "..." : kpisData?.metrics?.totalFleet?.current ?? fleet.length}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                {kpisData?.metrics?.totalFleet?.subtitle || "Both depots"}
              </div>
            </div>
            {renderKpiBars(
              kpisData?.metrics?.totalFleet?.history,
              "bg-[#D9E8F9]",
              "bg-[#2563EB]"
            )}
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
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {isLoading
                  ? "..."
                  : kpisData?.metrics?.available?.current ??
                    fleet.filter((v) => v.operationalStatus === "Idle").length}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                {kpisData?.metrics?.available?.subtitle || "Ready for dispatch"}
              </div>
            </div>
            {renderKpiBars(
              kpisData?.metrics?.available?.history,
              "bg-[#D1FAE5]",
              "bg-[#10B981]"
            )}
          </div>

          {/* Card 3: Reefer vehicles */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Reefer trucks</span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Snowflake className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {isLoading
                  ? "..."
                  : kpisData?.metrics?.reeferTrucks?.current ??
                    fleet.filter((v) => v.temp === "reefer").length}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                {kpisData?.metrics?.reeferTrucks?.subtitle || "Available now"}
              </div>
            </div>
            {renderKpiBars(
              kpisData?.metrics?.reeferTrucks?.history,
              "bg-[#EDE9FE]",
              "bg-[#7C3AED]"
            )}
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
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {isLoading
                  ? "..."
                  : kpisData?.metrics?.inWorkshop?.current ??
                    fleet.filter((v) => v.operationalStatus === "Workshop").length}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                {kpisData?.metrics?.inWorkshop?.subtitle || "Est. 2 days avg"}
              </div>
            </div>
            {renderKpiBars(
              kpisData?.metrics?.inWorkshop?.history,
              "bg-[#FEF3C7]",
              "bg-[#F59E0B]"
            )}
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
                  <span className="ml-1.5 text-[10px] opacity-70">
                    {st === "All"
                      ? fleet.length
                      : fleet.filter((v) => v.operationalStatus === st).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Table Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vehicles, drivers..."
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
                {isLoading ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-xs text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#F5C542]" />
                        <span>Loading live fleet records...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredFleet.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-xs text-slate-400">
                      No vehicles found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredFleet.map((v) => {
                    const fuelColor =
                      v.fuelPct > 60
                        ? "bg-emerald-500"
                        : v.fuelPct > 30
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
                          {v.type === "van" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span>Van</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              <span>Truck</span>
                            </span>
                          )}
                        </td>

                        {/* 3. Temperature */}
                        <td className="py-3.5 px-4">
                          {v.temp === "reefer" ? (
                            <span className="inline-flex items-center gap-1 text-sky-700 font-medium">
                              <Snowflake className="w-3.5 h-3.5 text-sky-500" />
                              <span>Reefer</span>
                            </span>
                          ) : (
                            <span className="text-slate-600">Ambient</span>
                          )}
                        </td>

                        {/* 4. Capacity */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                          {v.weightCapKg.toLocaleString()} kg
                        </td>

                        {/* 5. Volume */}
                        <td className="py-3.5 px-4 text-slate-600">
                          {v.volumeCapM3} m³
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
                          {v.operationalStatus === "Active" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                              Active
                            </span>
                          )}
                          {v.operationalStatus === "Idle" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              Idle
                            </span>
                          )}
                          {v.operationalStatus === "Workshop" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                              Workshop
                            </span>
                          )}
                        </td>

                        {/* 8. Driver */}
                        <td className="py-3.5 px-4">
                          <span
                            className={
                              !v.assignedDriverName
                                ? "text-slate-400 italic"
                                : "text-slate-700 font-medium"
                            }
                          >
                            {v.assignedDriverName || "Unassigned"}
                          </span>
                        </td>

                        {/* 9. Depot */}
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {v.depotId}
                        </td>

                        {/* 10. Trip Assigned */}
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {v.activeTripId ? (
                            <Link
                              href="/dispatcher/trip-planning"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium hover:underline"
                            >
                              <span>{v.activeTripId}</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
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
                              title="View Telematics & Diagnostics"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Actions for Idle vehicles */}
                            {v.operationalStatus === "Idle" && (
                              <>
                                <button
                                  onClick={() => handleOpenAssignModal(v)}
                                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                                >
                                  Driver
                                </button>
                                <button
                                  onClick={() => handleToggleWorkshop(v, "in_workshop")}
                                  disabled={isSubmittingAction}
                                  title="Send vehicle to maintenance workshop"
                                  className="p-1.5 rounded-md text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                                >
                                  <Wrench className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {/* Action for Workshop vehicles */}
                            {v.operationalStatus === "Workshop" && (
                              <button
                                onClick={() => handleToggleWorkshop(v, "available")}
                                disabled={isSubmittingAction}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs transition-colors cursor-pointer"
                              >
                                Mark Ready
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
                    {selectedVehicle.depotId} Depot · {selectedVehicle.type.toUpperCase()} ·{" "}
                    {selectedVehicle.temp === "reefer" ? "Reefer" : "Ambient"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-4 text-xs">
              {/* Telematics Cards Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-medium">Weekly Fuel Quota</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Fuel className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-sm text-slate-900">
                        {selectedVehicle.fuelRemainingL.toFixed(1)} L
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        of {selectedVehicle.weeklyFuelQuotaL} L quota
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-medium">Engine Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Thermometer className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-sm text-slate-900">
                      {selectedVehicle.engineTemp}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-medium">Odometer</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Gauge className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-sm text-slate-900 font-mono">
                      {selectedVehicle.odometerKm.toLocaleString()} km
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-medium">Inspection State</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-sm text-slate-900">
                      {selectedVehicle.lastService}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assignment Overview */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Operational Status:</span>
                  <span className="font-bold text-slate-900">{selectedVehicle.operationalStatus}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Assigned Driver:</span>
                  <span className="font-bold text-slate-900">
                    {selectedVehicle.assignedDriverName || "Unassigned"}
                    {selectedVehicle.assignedDriverPhone && (
                      <span className="text-slate-400 font-normal ml-1">
                        ({selectedVehicle.assignedDriverPhone})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Scheduled Trip:</span>
                  <span className="font-bold font-mono text-slate-900">
                    {selectedVehicle.activeTripId ? (
                      <Link
                        href="/dispatcher/trip-planning"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        {selectedVehicle.activeTripId}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    ) : (
                      "No active trip assigned"
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Payload Limits:</span>
                  <span className="font-bold font-mono text-slate-900">
                    {selectedVehicle.weightCapKg.toLocaleString()} kg · {selectedVehicle.volumeCapM3} m³
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Fuel Efficiency:</span>
                  <span className="font-bold font-mono text-slate-900">
                    {selectedVehicle.kmPerL} km/L ({selectedVehicle.fuelType})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
              {/* Quick action in modal */}
              <div>
                {selectedVehicle.operationalStatus === "Idle" && (
                  <button
                    onClick={() => handleToggleWorkshop(selectedVehicle, "in_workshop")}
                    disabled={isSubmittingAction}
                    className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
                  >
                    Send to Workshop
                  </button>
                )}
                {selectedVehicle.operationalStatus === "Workshop" && (
                  <button
                    onClick={() => handleToggleWorkshop(selectedVehicle, "available")}
                    disabled={isSubmittingAction}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                  >
                    Release from Workshop
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Assign Driver to Vehicle */}
      {assigningVehicle && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Assign Driver · {assigningVehicle.id}
                </h3>
                <p className="text-xs text-slate-500">
                  {assigningVehicle.depotId} Depot ({assigningVehicle.volumeCapM3} m³ · {assigningVehicle.weightCapKg} kg)
                </p>
              </div>
              <button
                onClick={() => setAssigningVehicle(null)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Driver
                </label>
                <select
                  value={assignDriverId}
                  onChange={(e) => setAssignDriverId(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] bg-white"
                >
                  <option value="">— Unassign Driver —</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} {d.phone ? `(${d.phone})` : ""}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Assigned driver will be set as the default operator for this vehicle.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setAssigningVehicle(null)}
                className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssignment}
                disabled={isSubmittingAction}
                className="px-4 py-1.5 font-bold bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmittingAction ? "Saving..." : "Confirm Assignment"}
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
                className="text-slate-400 hover:text-slate-600 text-xs p-1 cursor-pointer"
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
                  <option value="PELIYAGODA">Peliyagoda Central Depot</option>
                  <option value="KANDY">Kandy Regional Depot</option>
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
                  <option value="Van">Van</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <button
                onClick={() => {
                  setDepotFilter("All");
                  setTypeFilter("All");
                }}
                className="text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="px-4 py-1.5 font-bold bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] rounded-lg shadow-xs cursor-pointer"
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
