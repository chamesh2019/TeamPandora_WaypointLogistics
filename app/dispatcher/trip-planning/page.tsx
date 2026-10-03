"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Route,
  Truck,
  Sparkles,
  Clock,
  Plus,
  RotateCw,
  Check,
  CheckCircle2,
  Package,
  ShieldCheck,
  User,
  AlertCircle,
} from "lucide-react";
import { Button } from "../../../components/design-system/button";
import { BrandTag, StatusBadge } from "../../../components/design-system/badge";
import { Panel } from "../../../components/design-system/panel";
import { getCutoffInfo } from "../../../lib/utils/cutoff";
import type {
  DispatcherTripDto,
  AllocationOrderItemDto,
  AllocationVehicleDto,
  AllocationDriverDto,
} from "../../../lib/types/dispatcher-api";

export default function DispatcherTripPlanningPage() {
  const [trips, setTrips] = useState<DispatcherTripDto[]>([]);
  const [unassignedOrders, setUnassignedOrders] = useState<AllocationOrderItemDto[]>([]);
  const [vehicles, setVehicles] = useState<AllocationVehicleDto[]>([]);
  const [drivers, setDrivers] = useState<AllocationDriverDto[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [showNewTripModal, setShowNewTripModal] = useState<boolean>(false);
  const [showAddOrdersModal, setShowAddOrdersModal] = useState<boolean>(false);
  const [showAutoPlanModal, setShowAutoPlanModal] = useState<boolean>(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState<boolean>(false);

  // New Trip Form state
  const [newTripDepot, setNewTripDepot] = useState<string>("PELIYAGODA");
  const [newTripVehicle, setNewTripVehicle] = useState<string>("");
  const [newTripDriver, setNewTripDriver] = useState<string>("");

  // Selected orders in Add Order modal
  const [selectedOrderPoolIds, setSelectedOrderPoolIds] = useState<string[]>([]);

  const cutoff = useMemo(() => getCutoffInfo(), []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadTripPlanningData = useCallback(async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const [tripsRes, allocRes] = await Promise.all([
        fetch(`/api/dispatcher/trips?date=${today}`),
        fetch("/api/dispatcher/allocation"),
      ]);

      let loadedTrips: DispatcherTripDto[] = [];
      if (tripsRes.ok) {
        const tripsJson = await tripsRes.json();
        if (tripsJson.success && tripsJson.data?.trips) {
          loadedTrips = tripsJson.data.trips;
        }
      }

      // If no trips found for today, gracefully load all active trips
      if (loadedTrips.length === 0) {
        const fallbackTripsRes = await fetch("/api/dispatcher/trips");
        if (fallbackTripsRes.ok) {
          const fallbackJson = await fallbackTripsRes.json();
          if (fallbackJson.success && fallbackJson.data?.trips) {
            loadedTrips = fallbackJson.data.trips;
          }
        }
      }

      setTrips(loadedTrips);
      if (loadedTrips.length > 0) {
        setSelectedTripId((prev) =>
          loadedTrips.some((t) => t.id === prev) ? prev : loadedTrips[0].id
        );
      } else {
        setSelectedTripId("");
      }

      if (allocRes.ok) {
        const allocJson = await allocRes.json();
        if (allocJson.success && allocJson.data) {
          setUnassignedOrders(allocJson.data.orders || []);
          setVehicles(allocJson.data.vehicles || []);
          setDrivers(allocJson.data.drivers || []);
          if (allocJson.data.vehicles?.length > 0 && !newTripVehicle) {
            setNewTripVehicle(allocJson.data.vehicles[0].id);
          }
          if (allocJson.data.drivers?.length > 0 && !newTripDriver) {
            setNewTripDriver(allocJson.data.drivers[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Error loading trip planning data:", err);
      triggerToast("Error loading trip data from server");
    } finally {
      setIsLoading(false);
    }
  }, [newTripVehicle, newTripDriver]);

  useEffect(() => {
    loadTripPlanningData();
  }, [loadTripPlanningData]);

  const selectedTrip = useMemo(() => {
    return trips.find((t) => t.id === selectedTripId) || trips[0] || null;
  }, [trips, selectedTripId]);

  // Dynamic KPI Metrics
  const totalAssignedOrders = useMemo(() => {
    return trips.reduce((sum, t) => sum + (t.orders?.length || 0), 0);
  }, [trips]);

  const totalOrders = totalAssignedOrders + unassignedOrders.length;
  const uniqueVehiclesUsed = useMemo(() => {
    return new Set(trips.map((t) => t.vehicleId)).size;
  }, [trips]);

  const handleFinalizeTrip = async () => {
    if (!selectedTrip) return;
    setIsPublishing(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const planId = selectedTrip.planId || `PLAN-${today.replace(/-/g, "")}-PELIYAGODA`;

      const res = await fetch("/api/dispatcher/plans/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: planId,
          plan_date: today,
          depot_id: selectedTrip.depot || "PELIYAGODA",
          trips: [
            {
              vehicle_id: selectedTrip.vehicleId,
              trip_number: selectedTrip.tripNumber,
              brand: selectedTrip.brand,
              district: selectedTrip.district,
              depot: selectedTrip.depot,
              total_weight_kg: selectedTrip.currentWeightKg,
              total_volume_m3: selectedTrip.currentVol,
              duration_minutes: 120,
              orders: selectedTrip.orders.map((o) => ({
                order_id: o.orderId,
                brand: selectedTrip.brand,
                district: selectedTrip.district,
                depot: selectedTrip.depot,
                temp_requirement: "chilled",
                parking_constraint: "normal",
                dock_type: "rear_dock",
                weight: o.weightKg,
                volume: o.volumeM3,
              })),
              stops: selectedTrip.orders.map((o) => ({
                order_id: o.orderId,
                outlet_id: o.outletId,
              })),
            },
          ],
          deferred: [],
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setTrips((prev) =>
          prev.map((t) => (t.id === selectedTrip.id ? { ...t, status: "Finalized" } : t))
        );
        setShowFinalizeModal(false);
        triggerToast(`Trip ${selectedTrip.id} finalized successfully and locked for loading!`);
      } else {
        triggerToast(json.error?.message || "Failed to publish plan");
      }
    } catch {
      triggerToast("Network error publishing plan");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCreateNewTrip = () => {
    if (!newTripVehicle || !newTripDriver) {
      triggerToast("Please select vehicle and driver");
      return;
    }

    const veh = vehicles.find((v) => v.id === newTripVehicle);
    const drv = drivers.find((d) => d.id === newTripDriver);
    const nextIdx = trips.length + 1;
    const newId = `TRIP-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${newTripVehicle}-T1`;

    const newTrip: DispatcherTripDto = {
      id: newId,
      tripId: newId,
      planId: `PLAN-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${newTripDepot}`,
      status: "Draft",
      tripNumber: 1,
      currentVol: 0,
      maxVol: veh ? veh.maxVolumeM3 : 24,
      currentWeightKg: 0,
      maxWeightKg: veh ? veh.maxWeightKg : 5000,
      depot: newTripDepot,
      brand: "Fresh",
      district: "Colombo",
      vehicleId: newTripVehicle,
      vehiclePlate: newTripVehicle,
      driverId: newTripDriver,
      driverName: drv ? drv.name : "Assigned Driver",
      orders: [],
    };

    setTrips((prev) => [...prev, newTrip]);
    setSelectedTripId(newId);
    setShowNewTripModal(false);
    triggerToast(`Created new draft trip ${newId}`);
  };

  const handleAddOrdersToTrip = () => {
    if (!selectedTrip) return;
    const ordersToAdd = unassignedOrders.filter((o) =>
      selectedOrderPoolIds.includes(o.id)
    );
    if (ordersToAdd.length === 0) return;

    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === selectedTrip.id) {
          const addedVol = ordersToAdd.reduce((sum, o) => sum + o.volumeM3, 0);
          const addedWeight = ordersToAdd.reduce((sum, o) => sum + o.weightKg, 0);
          const mappedOrders = ordersToAdd.map((o, idx) => ({
            id: o.id,
            orderId: o.orderId,
            storeName: o.store,
            outletId: o.id,
            itemsCount: 15,
            volumeM3: o.volumeM3,
            weightKg: o.weightKg,
            stopSequence: t.orders.length + idx + 1,
            loadSequence: 1,
          }));

          return {
            ...t,
            currentVol: Number((t.currentVol + addedVol).toFixed(1)),
            currentWeightKg: t.currentWeightKg + addedWeight,
            orders: [...t.orders, ...mappedOrders],
          };
        }
        return t;
      })
    );

    // Remove from unassigned pool
    setUnassignedOrders((prev) =>
      prev.filter((o) => !selectedOrderPoolIds.includes(o.id))
    );
    setSelectedOrderPoolIds([]);
    setShowAddOrdersModal(false);
    triggerToast(`Added ${ordersToAdd.length} orders to ${selectedTrip.id}`);
  };

  const handleAutoPlanExecution = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch("/api/dispatcher/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_date: today, depot_id: "PELIYAGODA" }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.trips?.length > 0) {
        triggerToast(`Auto-planner created ${json.trips.length} optimized trips!`);
        setShowAutoPlanModal(false);
        loadTripPlanningData();
      } else {
        triggerToast(json.error?.message || "No trips generated by solver");
      }
    } catch {
      triggerToast("Error communicating with AI Allocation solver");
    }
  };

  return (
    <div className="flex-1 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0F1928] text-white px-4 py-3 rounded-lg shadow-xl border border-[#F5C542]/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#F5C542] flex-shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-5">
        {/* SUBHEADER: Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-black tracking-tight text-[#0F1020]">
              Trip planning
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Consolidate orders into trips · Reverse loading order sequence · Plan publishing
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="compact"
              onClick={loadTripPlanningData}
              disabled={isLoading}
              title="Refresh trips"
            >
              <RotateCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? "animate-spin text-[#F5C542]" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Button
              variant="secondary"
              size="compact"
              onClick={() => setShowAutoPlanModal(true)}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-slate-700" />
              <span>Auto-plan</span>
            </Button>

            <Button
              variant="primary"
              size="compact"
              onClick={() => setShowNewTripModal(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>New trip</span>
            </Button>
          </div>
        </div>

        {/* 4 KPI METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Trips drafted */}
          <Panel className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Trips planned</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Route className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
              {isLoading ? "—" : trips.length}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              {isLoading ? "loading..." : `${trips.filter((t) => t.status === "Finalized").length} finalized`}
            </div>
          </Panel>

          {/* Card 2: Orders assigned */}
          <Panel className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Orders assigned</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
              {isLoading ? "—" : `${totalAssignedOrders} / ${totalOrders}`}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              {isLoading ? "loading..." : `${unassignedOrders.length} unassigned in queue`}
            </div>
          </Panel>

          {/* Card 3: Vehicles selected */}
          <Panel className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Vehicles deployed</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
              {isLoading ? "—" : `${uniqueVehiclesUsed} / ${vehicles.length || uniqueVehiclesUsed}`}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              {vehicles.length - uniqueVehiclesUsed > 0
                ? `${vehicles.length - uniqueVehiclesUsed} available in depot`
                : "fleet fully deployed"}
            </div>
          </Panel>

          {/* Card 4: Cutoff Countdown */}
          <Panel className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Cutoff countdown</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
              {cutoff.isAfterCutoff ? "Cutoff passed" : cutoff.formattedTimeLeft}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
              {cutoff.statNoteText || `${cutoff.cutoffHour}:00 daily cutoff deadline`}
            </div>
          </Panel>
        </div>

        {/* TWO-COLUMN WORKFLOW SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN: Draft trips list */}
          <div className="lg:col-span-4">
            <Panel className="overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  Planned trips ({trips.length})
                </h2>
                <span className="text-xs text-slate-400">
                  {trips.filter((t) => t.status === "Finalized").length} published
                </span>
              </div>

              {/* Trips List */}
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {isLoading && trips.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                    <RotateCw className="w-5 h-5 animate-spin text-[#F5C542]" />
                    <p className="text-xs font-medium">Loading planned trips...</p>
                  </div>
                ) : trips.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-500 px-4">
                    <Route className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No trips planned yet today</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Use Order Allocation or click "+ New trip" to start dispatch planning.
                    </p>
                  </div>
                ) : (
                  trips.map((trip) => {
                    const isSelected = trip.id === selectedTripId;
                    return (
                      <div
                        key={trip.id}
                        onClick={() => setSelectedTripId(trip.id)}
                        className={`p-3.5 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-[#FEF9E7] border-l-4 border-l-[#F5C542]"
                            : "bg-white hover:bg-slate-50 border-l-4 border-l-transparent"
                        }`}
                      >
                        {/* Top Row: Code, Badge, Volume, Depot */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs font-mono text-slate-900 tracking-tight">
                              {trip.id}
                            </span>
                            <StatusBadge status={trip.status as any} />
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-bold text-slate-800">
                              <span className="text-amber-600">{trip.currentVol}</span>
                              <span className="text-slate-500 font-normal"> / {trip.maxVol} m³</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {trip.depot}
                            </div>
                          </div>
                        </div>

                        {/* Bottom Row: Vehicle plate & Driver */}
                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100/80 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono text-xs text-slate-700">{trip.vehiclePlate}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs text-slate-700 font-medium">
                              {trip.driverName}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom link: Plan unassigned orders */}
              {unassignedOrders.length > 0 && (
                <div className="p-3 text-center border-t border-slate-100 bg-slate-50/50">
                  <button
                    onClick={() => setShowAddOrdersModal(true)}
                    className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center justify-center gap-1 w-full transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Plan unassigned orders ({unassignedOrders.length} pending)</span>
                  </button>
                </div>
              )}
            </Panel>
          </div>

          {/* RIGHT COLUMN: Selected Trip Details & Stops */}
          <div className="lg:col-span-8">
            <Panel className="p-5 flex flex-col">
              {selectedTrip ? (
                <>
                  {/* Header: Title, Depot, and Finalize button */}
                  <div className="flex items-start justify-between pb-3 border-b border-black/[0.05]">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900 font-mono tracking-tight">
                          {selectedTrip.id}
                        </h2>
                        {selectedTrip.status === "Finalized" && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" /> Published &amp; Locked
                          </span>
                        )}
                        <BrandTag brand={selectedTrip.brand} />
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Depot: {selectedTrip.depot} · District: {selectedTrip.district} · Trip {selectedTrip.tripNumber} of 2
                      </p>
                    </div>

                    {/* Finalize Button */}
                    {selectedTrip.status !== "Finalized" ? (
                      <Button
                        variant="primary"
                        size="compact"
                        onClick={() => setShowFinalizeModal(true)}
                        disabled={isPublishing}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                        <span>Publish &amp; Lock Trip</span>
                      </Button>
                    ) : (
                      <Button variant="secondary" size="compact" disabled>
                        <span>Published</span>
                      </Button>
                    )}
                  </div>

                  {/* Vehicle & Driver Info Bar */}
                  <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-lg p-3 my-3 grid grid-cols-2 divide-x divide-slate-200">
                    {/* Vehicle Column */}
                    <div className="pr-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                        Vehicle Assignment
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Truck className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {selectedTrip.vehiclePlate}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({selectedTrip.currentWeightKg} kg / {selectedTrip.maxWeightKg} kg · {selectedTrip.currentVol} / {selectedTrip.maxVol} m³)
                        </span>
                      </div>
                    </div>

                    {/* Driver Column */}
                    <div className="pl-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                          Assigned Driver
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-xs font-bold text-slate-800">
                            {selectedTrip.driverName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Orders List with Reverse Load Sequencing */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                        Assigned orders &amp; delivery sequence ({selectedTrip.orders.length})
                      </h3>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Stops arranged in delivery sequence (Last loaded = First unloaded)
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 border-t border-b border-slate-100 max-h-[400px] overflow-y-auto">
                      {selectedTrip.orders.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">
                          No orders assigned to this trip yet.
                        </div>
                      ) : (
                        selectedTrip.orders.map((ord, idx) => (
                          <div
                            key={ord.id}
                            className="py-3 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded transition-colors text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-slate-900">{ord.id}</span>
                                  <span className="text-slate-800 font-semibold">{ord.storeName}</span>
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  Stop sequence #{idx + 1} · Load sequence #{ord.loadSequence || selectedTrip.orders.length - idx}
                                </div>
                              </div>
                            </div>
                            <div className="text-slate-500 text-xs font-medium text-right">
                              <div>{ord.weightKg} kg · {ord.volumeM3} m³</div>
                              <div className="text-[10px] text-slate-400">{ord.itemsCount} units</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Bottom Action: + Add orders */}
                    {selectedTrip.status !== "Finalized" && unassignedOrders.length > 0 && (
                      <Button
                        variant="secondary"
                        size="full"
                        onClick={() => setShowAddOrdersModal(true)}
                        className="mt-3"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        <span>Add orders from unallocated queue</span>
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-24 text-center text-slate-400 text-xs">
                  <Route className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">Select a trip from the list</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Or create a new trip to inspect route sequence and cargo distribution.
                  </p>
                </div>
              )}
            </Panel>
          </div>
        </div>
      </main>

      {/* MODAL 1: Create New Trip */}
      {showNewTripModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Route className="w-4 h-4 text-[#F5C542]" />
                <span>Create New Draft Trip</span>
              </h3>
              <button
                onClick={() => setShowNewTripModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 my-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Depot / Origin Hub
                </label>
                <select
                  value={newTripDepot}
                  onChange={(e) => setNewTripDepot(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] bg-white cursor-pointer"
                >
                  <option value="PELIYAGODA">Peliyagoda Central Hub</option>
                  <option value="KANDY">Kandy Regional Depot</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vehicle Assignment
                </label>
                <select
                  value={newTripVehicle}
                  onChange={(e) => setNewTripVehicle(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] bg-white cursor-pointer"
                >
                  <option value="" disabled>Select vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Driver Assignment
                </label>
                <select
                  value={newTripDriver}
                  onChange={(e) => setNewTripDriver(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] bg-white cursor-pointer"
                >
                  <option value="" disabled>Select driver...</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.username})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="secondary"
                size="compact"
                onClick={() => setShowNewTripModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="compact"
                onClick={handleCreateNewTrip}
              >
                Create Trip
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Orders to Trip */}
      {showAddOrdersModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Add Orders to {selectedTrip?.id}
                </h3>
                <p className="text-xs text-slate-500">
                  Select unallocated orders from the pending pool
                </p>
              </div>
              <button
                onClick={() => setShowAddOrdersModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="my-3 divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {unassignedOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No unallocated orders currently available in queue.
                </div>
              ) : (
                unassignedOrders.map((ord) => {
                  const isChecked = selectedOrderPoolIds.includes(ord.id);
                  return (
                    <label
                      key={ord.id}
                      className="p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedOrderPoolIds((prev) => prev.filter((id) => id !== ord.id));
                            } else {
                              setSelectedOrderPoolIds((prev) => [...prev, ord.id]);
                            }
                          }}
                          className="rounded border-slate-300 text-[#F5C542] focus:ring-[#F5C542]"
                        />
                        <div>
                          <div className="font-mono font-bold text-slate-900">{ord.id}</div>
                          <div className="text-slate-600">{ord.store}</div>
                        </div>
                      </div>
                      <div className="text-right text-slate-500 font-medium">
                        {ord.weightKg} kg · {ord.volumeM3} m³
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                {selectedOrderPoolIds.length} orders selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="compact"
                  onClick={() => setShowAddOrdersModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="compact"
                  onClick={handleAddOrdersToTrip}
                  disabled={selectedOrderPoolIds.length === 0}
                >
                  Confirm Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Auto-Plan Confirmation */}
      {showAutoPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-full bg-amber-50 text-[#F5C542] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Run Automated Trip Planner</h3>
                <p className="text-xs text-slate-500">
                  Consolidate {unassignedOrders.length} pending orders across fleet
                </p>
              </div>
            </div>

            <div className="my-4 text-xs text-slate-600 space-y-2">
              <p>
                The AI allocation solver optimizes routes, vehicle capacities, temperature zone requirements,
                and driver duty budgets.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="secondary"
                size="compact"
                onClick={() => setShowAutoPlanModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="compact"
                onClick={handleAutoPlanExecution}
              >
                Execute Solver
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Finalize Trip */}
      {showFinalizeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Publish Trip {selectedTrip?.id}?</h3>
                <p className="text-xs text-slate-500">Trip will be locked and sent to loading bay</p>
              </div>
            </div>

            <div className="my-4 text-xs text-slate-600 space-y-2">
              <p>
                Once published, loading manifests and stop delivery sequences are locked for driver{" "}
                <strong>{selectedTrip?.driverName}</strong> with vehicle <strong>{selectedTrip?.vehiclePlate}</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="secondary"
                size="compact"
                onClick={() => setShowFinalizeModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="compact"
                onClick={handleFinalizeTrip}
                disabled={isPublishing}
              >
                {isPublishing ? "Publishing..." : "Yes, Publish"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
