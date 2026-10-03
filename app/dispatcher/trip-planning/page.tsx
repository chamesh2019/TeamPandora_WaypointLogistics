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
  User,
  Plus,
  RotateCw,
  Check,
  CheckCircle2,
  X,
  Package,
  Layers,
  MapPin,
  Calendar,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface AssignedOrder {
  id: string;
  storeName: string;
  itemsCount: number;
  volumeM3: number;
}

interface DraftTrip {
  id: string;
  status: "Draft" | "Incomplete" | "Finalized";
  currentVol: number;
  maxVol: number;
  depot: string;
  fullDepot: string;
  vehiclePlate: string;
  driver: string;
  orders: AssignedOrder[];
}

const INITIAL_TRIPS: DraftTrip[] = [
  {
    id: "TRP-250614-01",
    status: "Draft",
    currentVol: 21.4,
    maxVol: 24,
    depot: "Peliyagoda",
    fullDepot: "Peliyagoda depot · Fresh brand",
    vehiclePlate: "WP NC-4872",
    driver: "N. Perera",
    orders: [
      {
        id: "ORD-250614-0024",
        storeName: "Nugegoda Fresh",
        itemsCount: 18,
        volumeM3: 3.2,
      },
      {
        id: "ORD-250614-0021",
        storeName: "Dehiwala Fresh",
        itemsCount: 24,
        volumeM3: 4.4,
      },
      {
        id: "ORD-250614-0019",
        storeName: "Wellawatte Fresh",
        itemsCount: 12,
        volumeM3: 2.1,
      },
    ],
  },
  {
    id: "TRP-250614-02",
    status: "Draft",
    currentVol: 18.9,
    maxVol: 21,
    depot: "Kandy",
    fullDepot: "Kandy depot · Dry goods",
    vehiclePlate: "CP LM-2134",
    driver: "S. Bandara",
    orders: [
      {
        id: "ORD-250614-0015",
        storeName: "Kandy Central",
        itemsCount: 22,
        volumeM3: 5.1,
      },
      {
        id: "ORD-250614-0011",
        storeName: "Peradeniya Fresh",
        itemsCount: 16,
        volumeM3: 3.8,
      },
      {
        id: "ORD-250614-0008",
        storeName: "Katugastota Mart",
        itemsCount: 14,
        volumeM3: 2.9,
      },
    ],
  },
  {
    id: "TRP-250614-03",
    status: "Incomplete",
    currentVol: 8.2,
    maxVol: 18,
    depot: "Peliyagoda",
    fullDepot: "Peliyagoda depot · Fresh brand",
    vehiclePlate: "WP KL-8301",
    driver: "Unassigned",
    orders: [
      {
        id: "ORD-250614-0035",
        storeName: "Moratuwa Express",
        itemsCount: 10,
        volumeM3: 2.2,
      },
      {
        id: "ORD-250614-0033",
        storeName: "Panadura Fresh",
        itemsCount: 15,
        volumeM3: 3.1,
      },
    ],
  },
];

const UNASSIGNED_ORDERS_POOL = [
  { id: "ORD-250614-0042", storeName: "Rajagiriya Fresh", itemsCount: 14, volumeM3: 2.6 },
  { id: "ORD-250614-0045", storeName: "Battaramulla Mart", itemsCount: 20, volumeM3: 3.8 },
  { id: "ORD-250614-0048", storeName: "Malabe Super Fresh", itemsCount: 11, volumeM3: 1.9 },
  { id: "ORD-250614-0050", storeName: "Kaduwela Express", itemsCount: 9, volumeM3: 1.4 },
];

export default function DispatcherTripPlanningPage() {
  const [trips, setTrips] = useState<DraftTrip[]>(INITIAL_TRIPS);
  const [selectedTripId, setSelectedTripId] = useState<string>("TRP-250614-01");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [showAddOrdersModal, setShowAddOrdersModal] = useState(false);
  const [showAutoPlanModal, setShowAutoPlanModal] = useState(false);
  const [showPlanUnassignedModal, setShowPlanUnassignedModal] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);

  // New Trip Form state
  const [newTripDepot, setNewTripDepot] = useState("Peliyagoda");
  const [newTripVehicle, setNewTripVehicle] = useState("WP NC-4872");
  const [newTripDriver, setNewTripDriver] = useState("N. Perera");
  const [newTripMaxVol, setNewTripMaxVol] = useState(24);

  // Selected orders in Add Order modal
  const [selectedOrderPoolIds, setSelectedOrderPoolIds] = useState<string[]>([]);

  // Driver Assignment for Incomplete trip
  const [showAssignDriverModal, setShowAssignDriverModal] = useState(false);
  const [assigningDriverName, setAssigningDriverName] = useState("A. Fernando");

  const selectedTrip = trips.find((t) => t.id === selectedTripId) || trips[0];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFinalizeTrip = () => {
    setTrips((prev) =>
      prev.map((t) => (t.id === selectedTrip.id ? { ...t, status: "Finalized" } : t))
    );
    setShowFinalizeModal(false);
    triggerToast(`Trip ${selectedTrip.id} finalized successfully and locked for loading!`);
  };

  const handleCreateNewTrip = () => {
    const nextIdx = trips.length + 1;
    const newId = `TRP-250614-0${nextIdx}`;
    const newTrip: DraftTrip = {
      id: newId,
      status: newTripDriver === "Unassigned" ? "Incomplete" : "Draft",
      currentVol: 0,
      maxVol: newTripMaxVol,
      depot: newTripDepot,
      fullDepot: `${newTripDepot} depot · Fresh brand`,
      vehiclePlate: newTripVehicle,
      driver: newTripDriver,
      orders: [],
    };
    setTrips((prev) => [...prev, newTrip]);
    setSelectedTripId(newId);
    setShowNewTripModal(false);
    triggerToast(`Created new trip ${newId}`);
  };

  const handleAddOrdersToTrip = () => {
    const ordersToAdd = UNASSIGNED_ORDERS_POOL.filter((o) =>
      selectedOrderPoolIds.includes(o.id)
    );
    if (ordersToAdd.length === 0) return;

    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === selectedTrip.id) {
          const addedVol = ordersToAdd.reduce((sum, o) => sum + o.volumeM3, 0);
          return {
            ...t,
            currentVol: Number((t.currentVol + addedVol).toFixed(1)),
            orders: [...t.orders, ...ordersToAdd],
          };
        }
        return t;
      })
    );
    setSelectedOrderPoolIds([]);
    setShowAddOrdersModal(false);
    triggerToast(`Added ${ordersToAdd.length} orders to ${selectedTrip.id}`);
  };

  const handleAssignDriver = () => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === selectedTrip.id) {
          return {
            ...t,
            driver: assigningDriverName,
            status: "Draft",
          };
        }
        return t;
      })
    );
    setShowAssignDriverModal(false);
    triggerToast(`Driver ${assigningDriverName} assigned to ${selectedTrip.id}`);
  };

  const handleAutoPlanExecution = () => {
    triggerToast("Auto-plan optimizer running route & capacity constraints...");
    setTimeout(() => {
      setTrips((prev) =>
        prev.map((t) => {
          if (t.id === "TRP-250614-03" && t.driver === "Unassigned") {
            return {
              ...t,
              driver: "K. Senaratne",
              status: "Draft",
              currentVol: 15.6,
              orders: [
                ...t.orders,
                { id: "ORD-250614-0042", storeName: "Rajagiriya Fresh", itemsCount: 14, volumeM3: 2.6 },
                { id: "ORD-250614-0045", storeName: "Battaramulla Mart", itemsCount: 20, volumeM3: 3.8 },
                { id: "ORD-250614-0050", storeName: "Kaduwela Express", itemsCount: 9, volumeM3: 1.4 },
              ],
            };
          }
          return t;
        })
      );
      setShowAutoPlanModal(false);
      triggerToast("Auto-plan complete! 3 trips fully consolidated, 0 unassigned orders.");
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

      

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-[1500px] w-full mx-auto px-6 py-5 flex flex-col gap-5">
        {/* SUBHEADER: Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Trip planning</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Planning for 14 June 2025 · Cutoff 18:00
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Auto-plan Button */}
            <button
              onClick={() => setShowAutoPlanModal(true)}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-700" />
              <span>Auto-plan</span>
            </button>

            {/* + New trip Button */}
            <button
              onClick={() => setShowNewTripModal(true)}
              className="bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] text-xs font-bold px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#0F1928]" />
              <span>New trip</span>
            </button>
          </div>
        </div>

        {/* 4 KPI METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Trips drafted */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Trips drafted</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Route className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">3</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">1 incomplete</div>
            </div>
            {/* 10 graduated bars */}
            <div className="flex items-end gap-1.5 h-8 mt-3">
              {[35, 45, 40, 55, 60, 50, 68, 62, 75].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-[#D9E8F9] rounded-xs"
                />
              ))}
              <div style={{ height: "100%" }} className="flex-1 bg-[#2563EB] rounded-xs" />
            </div>
          </div>

          {/* Card 2: Orders assigned */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Orders assigned</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">73 / 148</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">75 pending</div>
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

          {/* Card 3: Vehicles selected */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Vehicles selected</span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">2 / 3</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">1 needs vehicle</div>
            </div>
            {/* 10 graduated bars */}
            <div className="flex items-end gap-1.5 h-8 mt-3">
              {[25, 35, 45, 40, 55, 50, 65, 70, 62].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-[#EDE9FE] rounded-xs"
                />
              ))}
              <div style={{ height: "100%" }} className="flex-1 bg-[#7C3AED] rounded-xs" />
            </div>
          </div>

          {/* Card 4: Time to cutoff */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Time to cutoff</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">2h 14m</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Orders close at 18:00</div>
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

        {/* TWO-COLUMN WORKFLOW SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN: Draft trips (3) (4 cols on lg) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
            {/* Card Header */}
            <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Draft trips ({trips.length})
              </h2>
              <button
                onClick={() => triggerToast("Refreshed draft trips list")}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors cursor-pointer"
                title="Refresh draft trips"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Trips List */}
            <div className="divide-y divide-slate-100">
              {trips.map((trip) => {
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
                        {trip.status === "Draft" && (
                          <span className="bg-sky-50 text-sky-600 border border-sky-200 text-[10px] px-1.5 py-0.2 rounded font-medium">
                            Draft
                          </span>
                        )}
                        {trip.status === "Incomplete" && (
                          <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] px-1.5 py-0.2 rounded font-medium">
                            Incomplete
                          </span>
                        )}
                        {trip.status === "Finalized" && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-1.5 py-0.2 rounded font-medium">
                            Finalized
                          </span>
                        )}
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
                        <span
                          className={`text-xs ${
                            trip.driver === "Unassigned"
                              ? "text-red-500 font-medium italic"
                              : "text-slate-700 font-medium"
                          }`}
                        >
                          {trip.driver}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom link: Plan unassigned orders */}
            <div className="p-3 text-center border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setShowPlanUnassignedModal(true)}
                className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center justify-center gap-1 w-full transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Plan unassigned orders</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Trip Details & Assigned Orders (8 cols on lg) */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 flex flex-col">
            {/* Header: Title, Depot, and Finalize button */}
            <div className="flex items-start justify-between pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 font-mono tracking-tight">
                    {selectedTrip.id}
                  </h2>
                  {selectedTrip.status === "Finalized" && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {selectedTrip.fullDepot}
                </p>
              </div>

              {/* Finalize Button */}
              {selectedTrip.status !== "Finalized" ? (
                <button
                  onClick={() => setShowFinalizeModal(true)}
                  className="bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] text-xs font-bold px-4 py-1.5 rounded-md shadow-sm transition-colors cursor-pointer"
                >
                  Finalize
                </button>
              ) : (
                <button
                  disabled
                  className="bg-slate-100 text-slate-400 text-xs font-semibold px-3 py-1.5 rounded-md cursor-not-allowed"
                >
                  Finalized
                </button>
              )}
            </div>

            {/* Vehicle & Driver Info Bar */}
            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-lg p-3 my-2 grid grid-cols-2 divide-x divide-slate-200">
              {/* Vehicle Column */}
              <div className="pr-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Vehicle
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {selectedTrip.vehiclePlate}
                  </span>
                </div>
              </div>

              {/* Driver Column */}
              <div className="pl-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Driver
                  </span>
                  <div className="mt-0.5">
                    <span
                      className={`text-xs font-bold ${
                        selectedTrip.driver === "Unassigned"
                          ? "text-red-500 italic"
                          : "text-slate-800"
                      }`}
                    >
                      {selectedTrip.driver}
                    </span>
                  </div>
                </div>
                {selectedTrip.driver === "Unassigned" && (
                  <button
                    onClick={() => setShowAssignDriverModal(true)}
                    className="text-[11px] bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2.5 py-1 rounded border border-red-200 transition-colors"
                  >
                    Assign
                  </button>
                )}
              </div>
            </div>

            {/* Assigned Orders Section */}
            <div className="mt-4">
              <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase mb-2.5">
                Assigned orders ({selectedTrip.orders.length})
              </h3>

              {/* Orders Table / List */}
              <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
                {selectedTrip.orders.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No orders assigned to this trip yet.
                  </div>
                ) : (
                  selectedTrip.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="py-2.5 flex items-center justify-between hover:bg-slate-50/60 px-1 rounded transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{ord.id}</span>
                        <span className="text-slate-700 font-medium">{ord.storeName}</span>
                      </div>
                      <div className="text-slate-400 text-xs font-medium">
                        {ord.itemsCount} items · {ord.volumeM3} m³
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Action: + Add orders */}
              {selectedTrip.status !== "Finalized" && (
                <button
                  onClick={() => setShowAddOrdersModal(true)}
                  className="w-full mt-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                  <span>Add orders</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL 1: Create New Trip */}
      {showNewTripModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
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
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] bg-white"
                >
                  <option value="Peliyagoda">Peliyagoda Central Hub</option>
                  <option value="Kandy">Kandy Regional Depot</option>
                  <option value="Galle">Galle Southern Depot</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vehicle Plate
                </label>
                <select
                  value={newTripVehicle}
                  onChange={(e) => setNewTripVehicle(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] bg-white font-mono"
                >
                  <option value="WP NC-4872">WP NC-4872 · Isuzu Reefer 5T (24 m³)</option>
                  <option value="CP LM-2134">CP LM-2134 · Hino 300 Ambient (21 m³)</option>
                  <option value="WP KL-8301">WP KL-8301 · Toyota HiAce (18 m³)</option>
                  <option value="SP NB-9912">SP NB-9912 · Isuzu Elf 4T (20 m³)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Driver Assignment
                </label>
                <select
                  value={newTripDriver}
                  onChange={(e) => setNewTripDriver(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] bg-white"
                >
                  <option value="N. Perera">N. Perera (Peliyagoda)</option>
                  <option value="S. Bandara">S. Bandara (Kandy)</option>
                  <option value="A. Fernando">A. Fernando (Available)</option>
                  <option value="K. Senaratne">K. Senaratne (Available)</option>
                  <option value="Unassigned">Leave Unassigned</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Max Volume Capacity (m³)
                </label>
                <input
                  type="number"
                  value={newTripMaxVol}
                  onChange={(e) => setNewTripMaxVol(Number(e.target.value))}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowNewTripModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewTrip}
                className="px-4 py-1.5 text-xs font-bold bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] rounded-lg shadow-sm"
              >
                Create Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Orders to Trip */}
      {showAddOrdersModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Add Orders to {selectedTrip.id}
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
              {UNASSIGNED_ORDERS_POOL.map((ord) => {
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
                        <div className="text-slate-600">{ord.storeName}</div>
                      </div>
                    </div>
                    <div className="text-right text-slate-500 font-medium">
                      {ord.itemsCount} items · {ord.volumeM3} m³
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                {selectedOrderPoolIds.length} orders selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddOrdersModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOrdersToTrip}
                  disabled={selectedOrderPoolIds.length === 0}
                  className="px-4 py-1.5 font-bold bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] rounded-lg shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Confirm Add
                </button>
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
                <p className="text-xs text-slate-500">Consolidate 75 pending orders across fleet</p>
              </div>
            </div>

            <div className="my-4 text-xs text-slate-600 space-y-2">
              <p>
                The solver will calculate optimal routes, vehicle capacities, temperature zone requirements,
                and driver rest schedules.
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span>Target Cutoff:</span>
                  <span className="font-bold">18:00 Today</span>
                </div>
                <div className="flex justify-between">
                  <span>Vehicles Available:</span>
                  <span className="font-bold">3 active</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Fill Rate:</span>
                  <span className="font-bold text-emerald-600">92.4%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAutoPlanModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAutoPlanExecution}
                className="px-4 py-1.5 text-xs font-bold bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] rounded-lg shadow-sm"
              >
                Execute Solver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Plan Unassigned Orders */}
      {showPlanUnassignedModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span>Plan Unassigned Orders</span>
              </h3>
              <button
                onClick={() => setShowPlanUnassignedModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="my-4 text-xs text-slate-600 space-y-2">
              <p>
                There are <strong>4 unallocated orders</strong> waiting in the order planning queue.
                You can auto-allocate them to existing draft trips or generate a 4th trip.
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                {UNASSIGNED_ORDERS_POOL.map((o) => (
                  <div key={o.id} className="flex justify-between items-center text-[11px]">
                    <span className="font-mono font-bold text-slate-800">{o.id}</span>
                    <span className="text-slate-600">{o.storeName}</span>
                    <span className="text-slate-400">{o.volumeM3} m³</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowPlanUnassignedModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowPlanUnassignedModal(false);
                  handleAutoPlanExecution();
                }}
                className="px-4 py-1.5 text-xs font-bold bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] rounded-lg shadow-sm"
              >
                Auto-distribute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Finalize Trip */}
      {showFinalizeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Finalize Trip {selectedTrip.id}?</h3>
                <p className="text-xs text-slate-500">Trip will be locked and sent to loading bay</p>
              </div>
            </div>

            <div className="my-4 text-xs text-slate-600 space-y-2">
              <p>
                Once finalized, manifest records and store delivery sequences are generated for driver{" "}
                <strong>{selectedTrip.driver}</strong> with vehicle <strong>{selectedTrip.vehiclePlate}</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowFinalizeModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalizeTrip}
                className="px-4 py-1.5 text-xs font-bold bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] rounded-lg shadow-sm"
              >
                Yes, Finalize
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Assign Driver */}
      {showAssignDriverModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Assign Driver to {selectedTrip.id}</h3>
              <button
                onClick={() => setShowAssignDriverModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-2">
              <label className="block text-xs font-bold text-slate-700">Choose Available Driver</label>
              <select
                value={assigningDriverName}
                onChange={(e) => setAssigningDriverName(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542] bg-white"
              >
                <option value="A. Fernando">A. Fernando (HGV Certified · Peliyagoda)</option>
                <option value="K. Senaratne">K. Senaratne (Cold Chain Certified · Colombo)</option>
                <option value="M. Jayawardena">M. Jayawardena (Express Courier · Western)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowAssignDriverModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignDriver}
                className="px-4 py-1.5 text-xs font-bold bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] rounded-lg shadow-sm"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
