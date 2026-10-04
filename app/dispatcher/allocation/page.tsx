"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Sparkles,
  Clock,
  ChevronDown,
  ChevronUp,
  Snowflake,
  MapPin,
  CheckCircle2,
  Check,
  AlertCircle,
  AlertTriangle,
  RotateCw,
  Truck,
  X,
  ShieldCheck,
  Package,
  Layers,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "../../../components/design-system/button";
import { FilterTabs, type TabItem } from "../../../components/design-system/tabs";
import { BrandTag } from "../../../components/design-system/badge";
import { Panel } from "../../../components/design-system/panel";

interface AllocationOrderItem {
  id: string;
  orderId: string;
  outletId?: string;
  outlet_id?: string;
  store: string;
  brand: "Fresh" | "Style" | "Tech";
  district: string;
  weightKg: number;
  volumeM3: number;
  temperature: "Chilled" | "Ambient";
  priority: "high" | "medium" | "low";
  priorityScore?: number;
  parkingConstraint?: string;
  dockType?: string;
}

interface AllocationVehicle {
  id: string;
  name: string;
  type: "truck" | "van";
  temp: "reefer" | "ambient";
  isReefer: boolean;
  maxWeightKg: number;
  maxVolumeM3: number;
  depotId: string;
  status: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
}

interface AllocationDriver {
  id: string;
  name: string;
  username: string;
  phone?: string;
}

export default function AllocationPage() {
  const [queue, setQueue] = useState<AllocationOrderItem[]>([]);
  const [vehicles, setVehicles] = useState<AllocationVehicle[]>([]);
  const [drivers, setDrivers] = useState<AllocationDriver[]>([]);
  const [tempFilter, setTempFilter] = useState<"All" | "Chilled" | "Ambient">("All");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [tripNumber, setTripNumber] = useState<1 | 2>(1);
  const [isAutoAllocating, setIsAutoAllocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-allocate modal & full generation state
  const [showAutoAllocateModal, setShowAutoAllocateModal] = useState<boolean>(false);
  const [autoAllocateResults, setAutoAllocateResults] = useState<{
    trips: any[];
    deferred: any[];
    kpis?: any;
    kpi?: any;
    plan_date: string;
    depot_id?: string;
  } | null>(null);
  const [isCommittingAll, setIsCommittingAll] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<number>(1);
  const [expandedTripIndex, setExpandedTripIndex] = useState<number | null>(null);
  const [tripDriverMap, setTripDriverMap] = useState<Record<string, string>>({});

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchAllocationData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/dispatcher/allocation");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const fetchedOrders: AllocationOrderItem[] = json.data.orders || [];
          const fetchedVehicles: AllocationVehicle[] = json.data.vehicles || [];
          const fetchedDrivers: AllocationDriver[] = json.data.drivers || [];

          setQueue(fetchedOrders);
          setVehicles(fetchedVehicles);
          setDrivers(fetchedDrivers);

          setSelectedOrders((prev) => {
            const stillValid = prev.filter((id) => fetchedOrders.some((o) => o.id === id));
            if (stillValid.length > 0) return stillValid;
            return fetchedOrders.length > 0 ? [fetchedOrders[0].id] : [];
          });

          setSelectedVehicle((prev) => {
            if (prev && fetchedVehicles.some((v) => v.id === prev)) return prev;
            return fetchedVehicles.length > 0 ? fetchedVehicles[0].id : "";
          });

          setSelectedDriver((prev) => {
            if (prev && fetchedDrivers.some((d) => d.id === prev)) return prev;
            return fetchedDrivers.length > 0 ? fetchedDrivers[0].id : "";
          });
        }
      } else {
        triggerToast("Failed to load allocation queue from server");
      }
    } catch {
      triggerToast("Error connecting to server for allocation data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllocationData();
  }, [fetchAllocationData]);

  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      if (tempFilter === "All") return true;
      return item.temperature === tempFilter;
    });
  }, [queue, tempFilter]);

  const toggleOrderSelection = (id: string) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter((oId) => oId !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  // Group generated trips per vehicle to visualize the 2-trip max limit
  const vehicleTripGrouping = useMemo(() => {
    if (!autoAllocateResults?.trips) return new Map<string, any[]>();
    const map = new Map<string, any[]>();
    for (const t of autoAllocateResults.trips) {
      if (!map.has(t.vehicle_id)) {
        map.set(t.vehicle_id, []);
      }
      map.get(t.vehicle_id)!.push(t);
    }
    return map;
  }, [autoAllocateResults]);

  const handleAutoAllocate = async () => {
    setShowAutoAllocateModal(true);
    setIsAutoAllocating(true);
    setAutoAllocateResults(null);
    setGenerationStep(1);

    try {
      const today = new Date().toISOString().split("T")[0];

      // Simulated step progression for smooth user feedback
      const t1 = setTimeout(() => setGenerationStep(2), 250);
      const t2 = setTimeout(() => setGenerationStep(3), 500);
      const t3 = setTimeout(() => setGenerationStep(4), 750);

      const res = await fetch("/api/dispatcher/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_date: today,
          depot_id: "PELIYAGODA",
          orders: queue,
        }),
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      const data = await res.json();
      if (res.ok && data.success) {
        setAutoAllocateResults(data);
        setGenerationStep(5);

        // Pre-populate driver assignments for each trip
        const initialDrivers: Record<string, string> = {};
        for (let idx = 0; idx < (data.trips || []).length; idx++) {
          const trip = data.trips[idx];
          const tripKey = `${trip.vehicle_id}-${trip.trip_number || idx + 1}`;
          const matchingVeh = vehicles.find((v) => v.id === trip.vehicle_id);
          initialDrivers[tripKey] =
            matchingVeh?.assignedDriverId ||
            (drivers.length > 0 ? drivers[idx % drivers.length].id : "");
        }
        setTripDriverMap(initialDrivers);

        const totalOrdersPlanned =
          data.kpis?.planned_orders ??
          (data.trips || []).reduce(
            (s: number, t: any) => s + (t.orders?.length || t.stops?.length || 0),
            0
          );

        triggerToast(
          `AI Solver optimized: Generated ${data.trips?.length || 0} trips for ${totalOrdersPlanned} orders`
        );
      } else {
        triggerToast(data.error?.message || "No eligible orders could be allocated by the solver");
      }
    } catch {
      triggerToast("AI Solver request failed");
    } finally {
      setIsAutoAllocating(false);
    }
  };

  const handleCommitAllAllocations = async () => {
    if (!autoAllocateResults || (autoAllocateResults.trips || []).length === 0) return;
    setIsCommittingAll(true);
    try {
      const today = autoAllocateResults.plan_date || new Date().toISOString().split("T")[0];
      const planId = `PLAN-${today.replace(/-/g, "")}-PELIYAGODA`;

      const tripsToPublish = autoAllocateResults.trips.map((t, idx) => {
        const tripKey = `${t.vehicle_id}-${t.trip_number || idx + 1}`;
        const assignedDriverId =
          tripDriverMap[tripKey] || t.driver_id || (drivers[0]?.id || "");
        return {
          ...t,
          driver_id: assignedDriverId,
          driverId: assignedDriverId,
        };
      });

      const res = await fetch("/api/dispatcher/plans/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: planId,
          plan_date: today,
          depot_id: "PELIYAGODA",
          trips: tripsToPublish,
          deferred: autoAllocateResults.deferred || [],
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        const totalAllocated = tripsToPublish.reduce(
          (sum: number, t: any) => sum + (t.orders?.length || t.stops?.length || 0),
          0
        );
        triggerToast(
          `Successfully published plan! Generated and committed ${tripsToPublish.length} trips with ${totalAllocated} orders.`
        );

        // Remove allocated orders from current active queue
        const allocatedOrderIds = new Set<string>();
        for (const t of tripsToPublish) {
          for (const o of t.orders || t.stops || []) {
            allocatedOrderIds.add(o.order_id || o.id);
          }
        }
        setQueue((prev) => prev.filter((o) => !allocatedOrderIds.has(o.id)));
        setSelectedOrders([]);

        // Close modal
        setShowAutoAllocateModal(false);
        setAutoAllocateResults(null);

        // Refresh data from server
        fetchAllocationData();
      } else {
        triggerToast(json.error?.message || "Failed to commit allocations");
      }
    } catch {
      triggerToast("Network error while committing allocations");
    } finally {
      setIsCommittingAll(false);
    }
  };

  const handleLoadTripToEditor = (trip: any) => {
    if (!trip) return;
    const assignedIds = (trip.orders || []).map((o: any) => o.order_id || o.id);
    setSelectedOrders(assignedIds);
    if (trip.vehicle_id) setSelectedVehicle(trip.vehicle_id);
    if (trip.trip_number === 1 || trip.trip_number === 2) {
      setTripNumber(trip.trip_number);
    }
    const tripKey = `${trip.vehicle_id}-${trip.trip_number || 1}`;
    if (tripDriverMap[tripKey]) {
      setSelectedDriver(tripDriverMap[tripKey]);
    }
    setShowAutoAllocateModal(false);
    triggerToast(
      `Loaded Trip ${trip.trip_number || 1} (${assignedIds.length} orders for ${trip.vehicle_id}) into manual panel`
    );
  };

  const handleConfirmAssignment = async () => {
    if (!selectedVehicle || !selectedDriver || selectedOrders.length === 0) {
      triggerToast("Please select orders, vehicle, and driver to finalize assignment");
      return;
    }

    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch("/api/dispatcher/allocation/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planDate: today,
          depotId: "PELIYAGODA",
          vehicleId: selectedVehicle,
          driverId: selectedDriver,
          tripNumber,
          orderIds: selectedOrders,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        triggerToast(
          `Trip ${json.data.tripId || `TRP-${tripNumber}`} committed with ${selectedOrders.length} orders!`
        );
        // Remove allocated orders from active queue
        setQueue((prev) => prev.filter((o) => !selectedOrders.includes(o.id)));
        setSelectedOrders([]);
      } else {
        triggerToast(json.error?.message || "Failed to commit trip assignment");
      }
    } catch {
      triggerToast("Network error while committing trip assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation checks simulation
  const vehicleObj = vehicles.find((v) => v.id === selectedVehicle);
  const selectedItems = queue.filter((q) => selectedOrders.includes(q.id));
  const hasChilled = selectedItems.some((i) => i.temperature === "Chilled");
  const isReeferValid = !hasChilled || (vehicleObj && vehicleObj.isReefer);
  const totalWeight = selectedItems.reduce((acc, curr) => acc + curr.weightKg, 0);
  const totalVolume = Number(selectedItems.reduce((acc, curr) => acc + curr.volumeM3, 0).toFixed(1));
  const isWeightValid = !vehicleObj || totalWeight <= vehicleObj.maxWeightKg;
  const isVolumeValid = !vehicleObj || totalVolume <= vehicleObj.maxVolumeM3;
  const brandsSet = new Set(selectedItems.map((i) => i.brand));
  const isBrandHomogeneous = brandsSet.size <= 1;
  const districtsSet = new Set(selectedItems.map((i) => i.district));
  const isDistrictHomogeneous = districtsSet.size <= 1;
  const requiresVan = selectedItems.some((i) => i.parkingConstraint === "van_only");
  const isVanValid = !requiresVan || (vehicleObj && vehicleObj.type === "van");

  const tempTabs: TabItem[] = [
    { id: "All", label: "All" },
    { id: "Chilled", label: "Chilled" },
    { id: "Ambient", label: "Ambient" },
  ];

  return (
    <div className="flex-1 flex flex-col font-sans">
      {/* 2. MAIN ALLOCATION CONTENT */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* HEADER SECTION */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-black tracking-tight text-[#0F1020]">
              Order allocation
            </h1>
            <p className="text-xs text-[#7B7B9D] font-medium mt-0.5">
              Assign orders to vehicles and drivers · Constraint-checked dispatch planning
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="compact"
              onClick={fetchAllocationData}
              disabled={isLoading}
              title="Refresh queue"
            >
              <RotateCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? "animate-spin text-[#F5C542]" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Button
              variant="secondary"
              size="compact"
              onClick={handleAutoAllocate}
              disabled={isAutoAllocating || queue.length === 0}
            >
              <Sparkles className={`w-3.5 h-3.5 mr-1 text-[#0F1020] ${isAutoAllocating ? "animate-spin" : ""}`} />
              <span>{isAutoAllocating ? "Optimizing..." : "Auto-allocate"}</span>
            </Button>
          </div>
        </section>

        {/* TWO COLUMN GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT COLUMN (8 COLS): ORDER QUEUE */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <Panel className="p-5 flex flex-col justify-between h-full">
              <div>
                {/* Header */}
                <div className="pb-3 border-b border-black/[0.05] flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-[#0F1020]">
                      Order queue
                    </h2>
                    <p className="text-xs text-[#7B7B9D] mt-0.5">
                      {isLoading ? "Loading orders..." : `${filteredQueue.length} unallocated orders available for dispatch`}
                    </p>
                  </div>
                  <div className="text-xs text-[#7B7B9D]">
                    Selected: <strong className="text-[#0F1020] font-bold">{selectedOrders.length}</strong>
                  </div>
                </div>

                {/* Filter Row */}
                <div className="flex items-center gap-2 py-3">
                  <span className="text-xs text-[#7B7B9D] font-medium mr-1">Filter:</span>
                  <FilterTabs
                    tabs={tempTabs}
                    activeTab={tempFilter}
                    onSelect={(id) => setTempFilter(id as "All" | "Chilled" | "Ambient")}
                  />
                </div>

                {/* Orders List */}
                <div className="space-y-2 mt-1 max-h-[600px] overflow-y-auto pr-1">
                  {isLoading && queue.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                      <RotateCw className="w-5 h-5 animate-spin text-[#F5C542]" />
                      <p className="text-xs font-medium">Loading unallocated orders...</p>
                    </div>
                  ) : filteredQueue.length === 0 ? (
                    <div className="py-16 text-center text-xs text-[#7B7B9D]">
                      No unallocated orders found matching the filter.
                    </div>
                  ) : (
                    filteredQueue.map((item) => {
                      const isSelected = selectedOrders.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleOrderSelection(item.id)}
                          className={`p-4 rounded-[12px] border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-[#FFFDF5] border-amber-300 shadow-[0_1px_6px_rgba(245,197,66,0.18)]"
                              : "bg-white hover:bg-slate-50/80 border-slate-100 shadow-xs"
                          }`}
                        >
                          {/* Left: ID and Temp Badge */}
                          <div className="w-36 flex-shrink-0">
                            <div className="font-mono text-xs font-bold text-[#0F1020]">
                              {item.id}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5">
                              {item.temperature === "Chilled" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 text-[#4B8EF5] border border-sky-200/60 text-[9px] font-bold">
                                  <Snowflake className="w-2.5 h-2.5 text-[#4B8EF5]" />
                                  <span>Chilled</span>
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-[#10B981] border border-emerald-200/60 text-[9px] font-bold">
                                  Ambient
                                </span>
                              )}
                              <BrandTag brand={item.brand} />
                            </div>
                          </div>

                          {/* Center: Store name and metrics */}
                          <div className="flex-1 px-4">
                            <div className="font-bold text-xs text-[#0F1020] flex items-center gap-2">
                              <span>{item.store}</span>
                              {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-[#7B7B9D] mt-0.5">
                              <MapPin className="w-3 h-3 text-[#7B7B9D] flex-shrink-0" />
                              <span>
                                {item.district} · {item.weightKg} kg · {item.volumeM3} m³
                              </span>
                            </div>
                          </div>

                          {/* Right: Priority Badge */}
                          <div className="flex-shrink-0">
                            {item.priority === "high" ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60 text-[9px] font-bold lowercase tracking-wider">
                                high
                              </span>
                            ) : item.priority === "medium" ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-[#F59E0B] border border-amber-200/60 text-[9px] font-bold lowercase tracking-wider">
                                medium
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#10B981] border border-emerald-200/60 text-[9px] font-bold lowercase tracking-wider">
                                low
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Bottom summary info */}
              <div className="pt-4 border-t border-black/[0.04] flex items-center justify-between text-xs text-[#7B7B9D] mt-4">
                <span>Selected orders: <strong className="text-[#0F1020] font-bold">{selectedOrders.length}</strong></span>
                <span>Total weight: <strong className="text-[#0F1020] font-bold">{totalWeight} kg</strong></span>
                <span>Total volume: <strong className="text-[#0F1020] font-bold">{totalVolume} m³</strong></span>
              </div>
            </Panel>
          </div>

          {/* RIGHT COLUMN (4 COLS): 3 STEPPED WORKFLOW CARDS */}
          <div className="lg:col-span-4 space-y-3">
            {/* STEP 1: SELECT VEHICLE */}
            <Panel className="p-4">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#F5C542] text-[#0F1928] font-bold text-[10px] flex items-center justify-center">
                  1
                </span>
                <h3 className="text-xs font-bold text-[#0F1020]">
                  Select vehicle
                </h3>
              </div>

              <div className="mt-3 relative">
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] bg-white text-xs text-[#0F1020] outline-none appearance-none focus:border-[#F5C542] cursor-pointer"
                >
                  {isLoading && vehicles.length === 0 ? (
                    <option value="" disabled>Loading vehicles...</option>
                  ) : vehicles.length === 0 ? (
                    <option value="" disabled>No available vehicles</option>
                  ) : (
                    <option value="" disabled>Select a vehicle...</option>
                  )}
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </Panel>

            {/* STEP 2: ASSIGN DRIVER & TRIP NUMBER */}
            <Panel className="p-4">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 font-bold text-[10px] flex items-center justify-center">
                  2
                </span>
                <h3 className="text-xs font-bold text-[#0F1020]">
                  Assign driver &amp; trip number
                </h3>
              </div>

              <div className="mt-3 relative">
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] bg-white text-xs text-[#0F1020] outline-none appearance-none focus:border-[#F5C542] cursor-pointer"
                >
                  {isLoading && drivers.length === 0 ? (
                    <option value="" disabled>Loading drivers...</option>
                  ) : drivers.length === 0 ? (
                    <option value="" disabled>No available drivers</option>
                  ) : (
                    <option value="" disabled>Select a driver...</option>
                  )}
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>

              {/* Trip number toggle */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-[#7B7B9D]">
                  Trip number (max 2 per vehicle/day):
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTripNumber(1)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                      tripNumber === 1
                        ? "bg-[#FEF9EE] border border-[#F5C542] text-[#9A7000]"
                        : "border border-black/[0.08] text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    1
                  </button>
                  <button
                    type="button"
                    onClick={() => setTripNumber(2)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                      tripNumber === 2
                        ? "bg-[#FEF9EE] border border-[#F5C542] text-[#9A7000]"
                        : "border border-black/[0.08] text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    2
                  </button>
                </div>
              </div>
            </Panel>

            {/* STEP 3: VALIDATION CHECKLIST */}
            <Panel className="p-4">
              <div className="flex items-center gap-2 pb-2 border-b border-black/[0.05]">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 font-bold text-[10px] flex items-center justify-center">
                  3
                </span>
                <h3 className="text-xs font-bold text-[#0F1020]">
                  Validation
                </h3>
              </div>

              <div className="mt-2.5 space-y-2.5 text-xs">
                {/* 1: Brand Homogeneity */}
                <div className="flex items-start gap-2">
                  {selectedOrders.length > 0 ? (
                    isBrandHomogeneous ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                    )
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-[#0F1020] text-[11px]">Brand homogeneity</div>
                    <div className="text-[10px] text-[#7B7B9D]">All orders on trip must share one brand</div>
                  </div>
                </div>

                {/* 2: District Homogeneity */}
                <div className="flex items-start gap-2">
                  {selectedOrders.length > 0 ? (
                    isDistrictHomogeneous ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                    )
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-[#0F1020] text-[11px]">District homogeneity</div>
                    <div className="text-[10px] text-[#7B7B9D]">All orders on trip must be in same district</div>
                  </div>
                </div>

                {/* 3: Refrigeration */}
                <div className="flex items-start gap-2">
                  {selectedVehicle && selectedOrders.length > 0 ? (
                    isReeferValid ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                    )
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-[#0F1020] text-[11px]">Refrigeration</div>
                    <div className="text-[10px] text-[#7B7B9D]">Chilled orders need reefer vehicle</div>
                  </div>
                </div>

                {/* 4: Van Access */}
                <div className="flex items-start gap-2">
                  {selectedVehicle && selectedOrders.length > 0 ? (
                    isVanValid ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                    )
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-[#0F1020] text-[11px]">Van access (van_only)</div>
                    <div className="text-[10px] text-[#7B7B9D]">van_only outlets require type=van</div>
                  </div>
                </div>

                {/* 5: Weight & Volume Capacity */}
                <div className="flex items-start gap-2">
                  {selectedVehicle && selectedOrders.length > 0 ? (
                    isWeightValid && isVolumeValid ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                    )
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-[#0F1020] text-[11px]">Weight &amp; volume capacity</div>
                    <div className="text-[10px] text-[#7B7B9D]">
                      {totalWeight} kg / {vehicleObj ? `${vehicleObj.maxWeightKg} kg` : "—"} · {totalVolume} m³ / {vehicleObj ? `${vehicleObj.maxVolumeM3} m³` : "—"}
                    </div>
                  </div>
                </div>

                {/* 6: Time Budget */}
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-[#0F1020] text-[11px]">Time budget</div>
                    <div className="text-[10px] text-[#7B7B9D]">Fresh ≤ 270 min · Style/Tech ≤ 480 min</div>
                  </div>
                </div>

                {/* 7: Daily Trip Limit */}
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-[#0F1020] text-[11px]">Daily trip limit (max 2)</div>
                    <div className="text-[10px] text-[#7B7B9D]">Selected: Trip {tripNumber} of 2</div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                variant="primary"
                size="full"
                className="mt-4"
                onClick={handleConfirmAssignment}
                disabled={
                  isSubmitting ||
                  selectedOrders.length === 0 ||
                  !selectedVehicle ||
                  !selectedDriver ||
                  !isBrandHomogeneous ||
                  !isDistrictHomogeneous ||
                  !isReeferValid ||
                  !isWeightValid ||
                  !isVolumeValid ||
                  !isVanValid
                }
              >
                <span>{isSubmitting ? "Committing..." : "Commit Trip Assignment"}</span>
              </Button>
            </Panel>
          </div>
        </section>
      </main>

      {/* 3. TOAST NOTIFICATION POPUP */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#0F1928] text-white text-xs font-semibold shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-[#F5C542] flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 4. AUTO-ALLOCATION MODAL POPUP */}
      {showAutoAllocateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0F1020] text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F5C542]/20 border border-[#F5C542]/40 flex items-center justify-center text-[#F5C542]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white tracking-tight">
                      Auto-allocation engine
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#F5C542] text-[#0F1020] text-[10px] font-black uppercase tracking-wider">
                      Max 2 trips/truck
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Generates complete trip allocations for all orders respecting vehicle &amp; capacity limits
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isCommittingAll) {
                    setShowAutoAllocateModal(false);
                  }
                }}
                disabled={isCommittingAll}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* STATE A: GENERATING / OPTIMIZING IN PROGRESS */}
              {isAutoAllocating && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-[#F5C542] animate-spin" />
                    <Sparkles className="w-8 h-8 text-[#F5C542] absolute inset-0 m-auto" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[#0F1020]">
                      Generating optimal allocations...
                    </h3>
                    <p className="text-xs text-[#7B7B9D] max-w-md">
                      Solving route clusters and bin-packing all unallocated orders across available fleet
                    </p>
                  </div>

                  {/* Step Checklist */}
                  <div className="w-full max-w-md bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5 text-left text-xs">
                    <div className="flex items-center gap-2.5 text-slate-700">
                      {generationStep >= 1 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <RotateCw className="w-4 h-4 animate-spin text-amber-500 flex-shrink-0" />
                      )}
                      <span>Analyzing unallocated queue ({queue.length} orders)</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-slate-700">
                      {generationStep >= 2 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                      <span className="font-semibold text-[#0F1020]">
                        Enforcing truck trip policy: max 2 trips per vehicle/day
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-slate-700">
                      {generationStep >= 3 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                      <span>Validating brand &amp; district homogeneity per trip</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-slate-700">
                      {generationStep >= 4 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                      <span>Checking vehicle weight, volume &amp; refrigeration limits</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE B: GENERATED ALLOCATIONS SUMMARY & REVIEW */}
              {!isAutoAllocating && autoAllocateResults && (
                <div className="space-y-6">
                  {/* KPI Summary Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                      <div className="text-[10px] uppercase font-bold text-[#7B7B9D] tracking-wider">
                        Total Orders
                      </div>
                      <div className="text-xl font-black text-[#0F1020] mt-0.5">
                        {autoAllocateResults.kpis?.total_orders ?? queue.length}
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200/70 rounded-xl p-3 text-center">
                      <div className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                        Allocated
                      </div>
                      <div className="text-xl font-black text-emerald-700 mt-0.5">
                        {autoAllocateResults.kpis?.planned_orders ??
                          (autoAllocateResults.trips || []).reduce(
                            (s: number, t: any) => s + (t.orders?.length || 0),
                            0
                          )}
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200/70 rounded-xl p-3 text-center">
                      <div className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                        Trips Generated
                      </div>
                      <div className="text-xl font-black text-amber-700 mt-0.5">
                        {autoAllocateResults.trips?.length || 0}
                      </div>
                    </div>

                    <div className="bg-sky-50 border border-sky-200/70 rounded-xl p-3 text-center">
                      <div className="text-[10px] uppercase font-bold text-sky-700 tracking-wider">
                        Vehicles Used
                      </div>
                      <div className="text-xl font-black text-sky-700 mt-0.5">
                        {autoAllocateResults.kpis?.active_vehicles_count ?? vehicleTripGrouping.size}
                      </div>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-200/70 rounded-xl p-3 text-center">
                      <div className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">
                        Fulfillment
                      </div>
                      <div className="text-xl font-black text-indigo-700 mt-0.5">
                        {autoAllocateResults.kpis?.fulfillment_rate_pct ?? 100}%
                      </div>
                    </div>

                    <div className="bg-rose-50 border border-rose-200/70 rounded-xl p-3 text-center">
                      <div className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">
                        Deferred
                      </div>
                      <div className="text-xl font-black text-rose-700 mt-0.5">
                        {autoAllocateResults.deferred?.length || 0}
                      </div>
                    </div>
                  </div>

                  {/* 2-TRIP VEHICLE POLICY STATUS BANNER */}
                  <div className="bg-[#FFFDF5] border border-amber-300/80 rounded-xl p-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-200/60">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-amber-700 flex-shrink-0" />
                        <h4 className="text-xs font-bold text-[#0F1020]">
                          Truck daily trip limit policy (Strict max: 2 trips per vehicle)
                        </h4>
                      </div>
                      <span className="text-[11px] text-amber-800 font-medium">
                        {vehicleTripGrouping.size} active vehicles scheduled
                      </span>
                    </div>

                    {/* Breakdown per vehicle */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {Array.from(vehicleTripGrouping.entries()).map(([vId, vTrips]) => {
                        const veh = vehicles.find((v) => v.id === vId);
                        const isMaxed = vTrips.length >= 2;
                        return (
                          <div
                            key={vId}
                            className="p-2.5 rounded-lg bg-white border border-amber-200/70 flex flex-col justify-between text-xs"
                          >
                            <div className="flex items-center justify-between font-bold text-[#0F1020]">
                              <span>{veh?.name || vId}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                  isMaxed
                                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {vTrips.length} / 2 trips {isMaxed ? "(Max)" : ""}
                              </span>
                            </div>

                            <div className="mt-1.5 space-y-1">
                              {vTrips.map((tr: any) => (
                                <div
                                  key={`${tr.vehicle_id}-${tr.trip_number}`}
                                  className="flex items-center justify-between text-[11px] text-[#7B7B9D] bg-slate-50 px-2 py-1 rounded"
                                >
                                  <span className="font-semibold text-[#0F1020]">
                                    Trip {tr.trip_number} of 2
                                  </span>
                                  <span>
                                    {tr.brand} · {tr.district} ({tr.orders?.length || 0} orders)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* GENERATED TRIPS LIST */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[#0F1020] flex items-center gap-2">
                        <Layers className="w-4 h-4 text-slate-500" />
                        <span>Generated trips ready to commit ({autoAllocateResults.trips?.length || 0})</span>
                      </h4>
                      <span className="text-xs text-[#7B7B9D]">
                        Click any trip to inspect individual orders or assign drivers
                      </span>
                    </div>

                    <div className="space-y-3">
                      {(autoAllocateResults.trips || []).map((trip: any, idx: number) => {
                        const tripKey = `${trip.vehicle_id}-${trip.trip_number || idx + 1}`;
                        const isExpanded = expandedTripIndex === idx;
                        const tripOrders = trip.orders || trip.stops || [];
                        const assignedDriverId = tripDriverMap[tripKey] || "";

                        return (
                          <div
                            key={tripKey}
                            className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
                          >
                            {/* Trip Summary Card Header */}
                            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                              <div className="flex items-start sm:items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center flex-shrink-0">
                                  <span className="text-[9px] font-bold text-slate-500 uppercase">Trip</span>
                                  <span className="text-sm font-black text-[#0F1020]">
                                    {trip.trip_number || idx + 1}
                                  </span>
                                </div>

                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-[#0F1020]">
                                      {trip.vehicle_id}
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold capitalize">
                                      {trip.vehicle_type || "truck"} · {trip.vehicle_temp || "ambient"}
                                    </span>
                                    <BrandTag brand={trip.brand} />
                                    <span className="inline-flex items-center gap-1 text-[11px] text-[#7B7B9D] font-medium">
                                      <MapPin className="w-3 h-3" />
                                      {trip.district}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                                      Trip {trip.trip_number || idx + 1} of 2
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#7B7B9D] mt-1.5">
                                    <span className="flex items-center gap-1">
                                      <Package className="w-3.5 h-3.5" />
                                      <strong className="text-[#0F1020]">{tripOrders.length}</strong> orders
                                    </span>
                                    <span>·</span>
                                    <span>
                                      Weight: <strong className="text-[#0F1020]">{trip.total_weight_kg} kg</strong> ({trip.weight_utilization_pct}%)
                                    </span>
                                    <span>·</span>
                                    <span>
                                      Volume: <strong className="text-[#0F1020]">{trip.total_volume_m3} m³</strong> ({trip.volume_utilization_pct}%)
                                    </span>
                                    <span>·</span>
                                    <span>
                                      Distance: <strong className="text-[#0F1020]">{trip.estimated_distance_km || 0} km</strong>
                                    </span>
                                    <span>·</span>
                                    <span className="text-amber-800 font-semibold">
                                      ⛽ Fuel: <strong className="text-[#0F1020]">{trip.estimated_fuel_liters || 0} L</strong>
                                      {trip.fuel_remaining_after_trip_l !== undefined ? ` (${trip.fuel_remaining_after_trip_l}L rem)` : ""}
                                    </span>
                                    <span>·</span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-[#7B7B9D]" />
                                      {trip.duration_minutes} min
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Driver selector & Actions */}
                              <div className="flex items-center gap-2 self-end md:self-center">
                                <div className="flex items-center gap-1.5">
                                  <UserCheck className="w-3.5 h-3.5 text-[#7B7B9D]" />
                                  <select
                                    value={assignedDriverId}
                                    onChange={(e) =>
                                      setTripDriverMap((prev) => ({
                                        ...prev,
                                        [tripKey]: e.target.value,
                                      }))
                                    }
                                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-[#0F1020] outline-none focus:border-[#F5C542] cursor-pointer"
                                  >
                                    <option value="" disabled>Assign driver...</option>
                                    {drivers.map((d) => (
                                      <option key={d.id} value={d.id}>
                                        {d.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleLoadTripToEditor(trip)}
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center gap-1 transition-colors"
                                  title="Load this trip into the manual editor on the right"
                                >
                                  <span>Edit</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedTripIndex(isExpanded ? null : idx)
                                  }
                                  className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors"
                                  title={isExpanded ? "Collapse orders" : "Expand orders"}
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Expandable Orders List for this Trip */}
                            {isExpanded && (
                              <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-100 text-xs">
                                <div className="text-[11px] font-bold text-[#7B7B9D] uppercase tracking-wider mb-2">
                                  Assigned Orders ({tripOrders.length})
                                </div>
                                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                  {tripOrders.map((o: any, oIdx: number) => (
                                    <div
                                      key={o.order_id || o.id || oIdx}
                                      className="bg-white p-2.5 rounded-lg border border-slate-200/70 flex items-center justify-between text-xs"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center">
                                          {oIdx + 1}
                                        </span>
                                        <span className="font-mono font-bold text-[#0F1020]">
                                          {o.order_id || o.id}
                                        </span>
                                        <span className="text-slate-600">
                                          {o.outlet_name || o.store || o.outlet_id}
                                        </span>
                                      </div>
                                      <div className="text-[#7B7B9D] flex items-center gap-2 text-[11px]">
                                        <span>{o.weight || o.weightKg} kg</span>
                                        <span>·</span>
                                        <span>{o.volume || o.volumeM3} m³</span>
                                        <span>·</span>
                                        <span className="capitalize">{o.dock_type || "rear dock"}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* DEFERRED ORDERS (IF ANY) */}
                  {autoAllocateResults.deferred && autoAllocateResults.deferred.length > 0 && (
                    <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-4 text-xs space-y-2">
                      <div className="flex items-center gap-2 text-rose-800 font-bold">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>
                          {autoAllocateResults.deferred.length} orders deferred by AI solver
                        </span>
                      </div>
                      <p className="text-rose-700 text-[11px]">
                        These orders could not be scheduled due to fleet capacity, cold chain, or the strict daily limit of 2 trips per truck.
                      </p>
                      <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto">
                        {autoAllocateResults.deferred.map((def: any) => (
                          <div
                            key={def.order_id}
                            className="bg-white p-2 rounded-lg border border-rose-200 flex items-center justify-between text-[11px]"
                          >
                            <span className="font-mono font-bold text-[#0F1020]">{def.order_id}</span>
                            <span className="text-slate-600">{def.outlet_name || def.district}</span>
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                              {def.reason_code}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!isCommittingAll) setShowAutoAllocateModal(false);
                }}
                disabled={isCommittingAll}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {!isAutoAllocating && autoAllocateResults && (
                  <Button
                    variant="primary"
                    size="compact"
                    onClick={handleCommitAllAllocations}
                    disabled={isCommittingAll || (autoAllocateResults.trips || []).length === 0}
                    className="shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4 mr-1.5" />
                    <span>
                      {isCommittingAll
                        ? "Committing All Trips..."
                        : `Commit & Apply All ${autoAllocateResults.trips?.length || 0} Trips`}
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
