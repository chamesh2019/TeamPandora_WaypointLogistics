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
  ChevronDown,
  Snowflake,
  MapPin,
  CheckCircle2,
  Info,
  Check,
  X,
  AlertCircle,
} from "lucide-react";

interface AllocationOrderItem {
  id: string;
  store: string;
  brand: "Fresh" | "Style" | "Tech";
  district: string;
  weightKg: number;
  volumeM3: number;
  temperature: "Chilled" | "Ambient";
  priority: "high" | "medium" | "low";
}

const INITIAL_QUEUE: AllocationOrderItem[] = [
  {
    id: "ORD-250614-2901",
    store: "Nugegoda Fresh",
    brand: "Fresh",
    district: "Colombo",
    weightKg: 820,
    volumeM3: 8.4,
    temperature: "Chilled",
    priority: "high",
  },
  {
    id: "ORD-250614-2898",
    store: "Dehiwala Fresh",
    brand: "Fresh",
    district: "Colombo",
    weightKg: 610,
    volumeM3: 6.1,
    temperature: "Chilled",
    priority: "high",
  },
  {
    id: "ORD-250614-2895",
    store: "Wellawatte Fresh",
    brand: "Fresh",
    district: "Colombo",
    weightKg: 440,
    volumeM3: 4.2,
    temperature: "Ambient",
    priority: "medium",
  },
  {
    id: "ORD-250614-2828",
    store: "Kandy Central",
    brand: "Fresh",
    district: "Kandy",
    weightKg: 910,
    volumeM3: 9.1,
    temperature: "Chilled",
    priority: "medium",
  },
  {
    id: "ORD-250614-2824",
    store: "Maradana Tech",
    brand: "Tech",
    district: "Colombo",
    weightKg: 180,
    volumeM3: 1.8,
    temperature: "Ambient",
    priority: "low",
  },
];

const AVAILABLE_VEHICLES = [
  { id: "VEH001", name: "VEH001 · Isuzu Forward Reefer 5T", isReefer: true, maxWeight: 5000, maxVol: 22, depot: "Peliyagoda Hub" },
  { id: "VEH002", name: "VEH002 · Hino 300 Ambient Box 3.5T", isReefer: false, maxWeight: 3500, maxVol: 16, depot: "Peliyagoda Hub" },
  { id: "VEH003", name: "VEH003 · Toyota HiAce Van 1.2T", isReefer: false, maxWeight: 1200, maxVol: 7.5, depot: "Kandy Regional Hub" },
];

const AVAILABLE_DRIVERS = [
  { id: "d1", name: "Nimal Fernando (Commercial Heavy)" },
  { id: "d2", name: "Chamara Silva (Commercial Light)" },
  { id: "d3", name: "Ruwan Dias (Van Specialist)" },
];

export default function AllocationPage() {
  const [tempFilter, setTempFilter] = useState<"All" | "Chilled" | "Ambient">("All");
  const [selectedOrders, setSelectedOrders] = useState<string[]>(["ORD-250614-2901"]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [tripNumber, setTripNumber] = useState<1 | 2>(1);
  const [isAutoAllocating, setIsAutoAllocating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredQueue = useMemo(() => {
    return INITIAL_QUEUE.filter((item) => {
      if (tempFilter === "All") return true;
      return item.temperature === tempFilter;
    });
  }, [tempFilter]);

  const toggleOrderSelection = (id: string) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter((oId) => oId !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const handleAutoAllocate = () => {
    setIsAutoAllocating(true);
    setTimeout(() => {
      setSelectedOrders(["ORD-250614-2901", "ORD-250614-2898", "ORD-250614-2895"]);
      setSelectedVehicle("VEH001");
      setSelectedDriver("d1");
      setIsAutoAllocating(false);
      triggerToast("AI Allocation Engine grouped 3 compatible Colombo Fresh orders for VEH001");
    }, 1000);
  };

  const handleConfirmAssignment = () => {
    if (!selectedVehicle || !selectedDriver || selectedOrders.length === 0) {
      triggerToast("Please select orders, vehicle, and driver to finalize assignment");
      return;
    }
    triggerToast(`Trip TRP-${tripNumber} successfully allocated with ${selectedOrders.length} orders`);
  };

  // Validation checks simulation
  const vehicleObj = AVAILABLE_VEHICLES.find((v) => v.id === selectedVehicle);
  const selectedItems = INITIAL_QUEUE.filter((q) => selectedOrders.includes(q.id));
  const hasChilled = selectedItems.some((i) => i.temperature === "Chilled");
  const isReeferValid = !hasChilled || (vehicleObj && vehicleObj.isReefer);

  return (
    <div className="flex-1 flex flex-col">
      

      {/* ========================================================= */}
      {/* 2. MAIN ALLOCATION CONTENT */}
      {/* ========================================================= */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* HEADER SECTION */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-black tracking-tight text-[#0F1020]">
              Order allocation
            </h1>
            <p className="text-xs text-[#7B7B9D] font-medium mt-0.5">
              Assign orders to vehicles and drivers
            </p>
          </div>

          <div>
            {/* Auto-allocate button */}
            <button
              type="button"
              onClick={handleAutoAllocate}
              disabled={isAutoAllocating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-white border border-black/[0.08] shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:bg-slate-50 text-xs font-bold text-[#0F1020] transition-all cursor-pointer disabled:opacity-60"
            >
              <Sparkles className={`w-3.5 h-3.5 text-[#0F1020] ${isAutoAllocating ? "animate-spin" : ""}`} />
              <span>{isAutoAllocating ? "Optimizing..." : "Auto-allocate"}</span>
            </button>
          </div>
        </section>

        {/* TWO COLUMN GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT COLUMN (8 COLS): ORDER QUEUE */}
          <div className="lg:col-span-8 bg-white rounded-[16px] border border-black/[0.06] shadow-[0_2px_12px_rgba(15,16,32,0.05)] p-5 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="pb-3 border-b border-black/[0.05]">
                <h2 className="text-sm font-bold text-[#0F1020]">
                  Order queue
                </h2>
                <p className="text-xs text-[#7B7B9D] mt-0.5">
                  {filteredQueue.length} unallocated orders
                </p>
              </div>

              {/* Filter Row */}
              <div className="flex items-center gap-2 py-3">
                <span className="text-xs text-[#7B7B9D] font-medium mr-1">Filter:</span>
                <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-lg">
                  {(["All", "Chilled", "Ambient"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setTempFilter(mode)}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        tempFilter === mode
                          ? "bg-white text-indigo-700 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-2 mt-1">
                {filteredQueue.map((item) => {
                  const isSelected = selectedOrders.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleOrderSelection(item.id)}
                      className={`p-4 rounded-[12px] border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-[#FFFDF5] border-amber-300 shadow-[0_1px_6px_rgba(245,197,66,0.12)]"
                          : "bg-white hover:bg-slate-50/80 border-slate-100 shadow-xs"
                      }`}
                    >
                      {/* Left: ID and Temp Badge */}
                      <div className="w-36 flex-shrink-0">
                        <div className="font-mono text-xs font-bold text-[#0F1020]">
                          {item.id}
                        </div>
                        <div className="mt-1">
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
                })}
              </div>
            </div>

            {/* Bottom summary info */}
            <div className="pt-4 border-t border-black/[0.04] flex items-center justify-between text-xs text-[#7B7B9D] mt-3">
              <span>Selected orders: <strong className="text-[#0F1020]">{selectedOrders.length}</strong></span>
              <span>Total weight: <strong className="text-[#0F1020]">{selectedItems.reduce((acc, curr) => acc + curr.weightKg, 0)} kg</strong></span>
              <span>Total volume: <strong className="text-[#0F1020]">{selectedItems.reduce((acc, curr) => acc + curr.volumeM3, 0).toFixed(1)} m³</strong></span>
            </div>
          </div>

          {/* RIGHT COLUMN (4 COLS): 3 STEPPED WORKFLOW CARDS */}
          <div className="lg:col-span-4 space-y-3">
            {/* STEP 1: SELECT VEHICLE */}
            <div className="bg-white rounded-[16px] border border-black/[0.06] shadow-[0_2px_12px_rgba(15,16,32,0.05)] p-4">
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
                  <option value="" disabled>Select a vehicle...</option>
                  {AVAILABLE_VEHICLES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* STEP 2: ASSIGN DRIVER & TRIP NUMBER */}
            <div className="bg-white rounded-[16px] border border-black/[0.06] shadow-[0_2px_12px_rgba(15,16,32,0.05)] p-4">
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
                  <option value="" disabled>Select a driver...</option>
                  {AVAILABLE_DRIVERS.map((d) => (
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
            </div>

            {/* STEP 3: VALIDATION CHECKLIST */}
            <div className="bg-white rounded-[16px] border border-black/[0.06] shadow-[0_2px_12px_rgba(15,16,32,0.05)] p-4">
              <div className="flex items-center gap-2 pb-2 border-b border-black/[0.05]">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 font-bold text-[10px] flex items-center justify-center">
                  3
                </span>
                <h3 className="text-xs font-bold text-[#0F1020]">
                  Validation
                </h3>
              </div>

              <div className="mt-2.5 space-y-2.5 text-xs">
                {/* 1 */}
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-[#0F1020] text-[11px]">Brand homogeneity</div>
                    <div className="text-[10px] text-[#7B7B9D]">All orders on trip must share one brand</div>
                  </div>
                </div>

                {/* 2 */}
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-[#0F1020] text-[11px]">District homogeneity</div>
                    <div className="text-[10px] text-[#7B7B9D]">All orders on trip must be in same district</div>
                  </div>
                </div>

                {/* 3 */}
                <div className="flex items-start gap-2">
                  {selectedVehicle ? (
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

                {/* 4 */}
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-[#0F1020] text-[11px]">Van access (van_only)</div>
                    <div className="text-[10px] text-[#7B7B9D]">van_only outlets require type=van</div>
                  </div>
                </div>

                {/* 5 */}
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-[#0F1020] text-[11px]">Depot match</div>
                    <div className="text-[10px] text-[#7B7B9D]">Vehicle serves its home depot only</div>
                  </div>
                </div>

                {/* 6 */}
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-[#0F1020] text-[11px]">Weight &amp; volume capacity</div>
                    <div className="text-[10px] text-[#7B7B9D]">Trip cargo must not exceed vehicle caps</div>
                  </div>
                </div>

                {/* 7 */}
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-[#0F1020] text-[11px]">Time budget</div>
                    <div className="text-[10px] text-[#7B7B9D]">Fresh ≤ 270 min · Style/Tech ≤ 480 min</div>
                  </div>
                </div>

                {/* 8 */}
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-[#0F1020] text-[11px]">Daily trip limit (max 2)</div>
                    <div className="text-[10px] text-[#7B7B9D]">Each vehicle runs at most 2 trips per day</div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleConfirmAssignment}
                className="w-full mt-4 py-2.5 rounded-xl bg-[#F5C542] hover:bg-[#D4A200] text-[#0F1928] font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Commit Trip Assignment</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================= */}
      {/* 3. TOAST NOTIFICATION POPUP */}
      {/* ========================================================= */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#0F1928] text-white text-xs font-semibold shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-[#F5C542] flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
