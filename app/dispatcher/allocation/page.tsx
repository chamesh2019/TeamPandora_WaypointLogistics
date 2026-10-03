"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Sparkles,
  Clock,
  ChevronDown,
  Snowflake,
  MapPin,
  CheckCircle2,
  Check,
  AlertCircle,
  RotateCw,
} from "lucide-react";
import { Button } from "../../../components/design-system/button";
import { FilterTabs, type TabItem } from "../../../components/design-system/tabs";
import { BrandTag } from "../../../components/design-system/badge";
import { Panel } from "../../../components/design-system/panel";

interface AllocationOrderItem {
  id: string;
  orderId: string;
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

  const handleAutoAllocate = async () => {
    setIsAutoAllocating(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch("/api/dispatcher/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_date: today, depot_id: "PELIYAGODA" }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.trips && data.trips.length > 0) {
        const firstTrip = data.trips[0];
        const assignedIds = firstTrip.orders.map((o: { order_id: string }) => o.order_id);
        setSelectedOrders(assignedIds);
        if (firstTrip.vehicle_id) setSelectedVehicle(firstTrip.vehicle_id);
        triggerToast(
          `AI Solver optimized: Trip allocated with ${assignedIds.length} orders for ${firstTrip.vehicle_id}`
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
    </div>
  );
}
