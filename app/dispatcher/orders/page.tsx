"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Download,
  Plus,
  Lock,
  Eye,
  X,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Button, BrandTag, StatusBadge, FilterTabs } from "@/components/design-system";
import type { TabItem } from "@/components/design-system";
import { getCutoffInfo } from "@/lib/utils/cutoff";
import type {
  DispatcherOrderDto,
  DispatcherOrdersSummaryDto,
  DispatcherOrderStatus,
} from "@/lib/types/dispatcher-api";

const STATUS_TABS: TabItem[] = [
  { id: "All", label: "All" },
  { id: "Pending", label: "Pending" },
  { id: "Planned", label: "Planned" },
  { id: "Dispatched", label: "Dispatched" },
  { id: "Delivered", label: "Delivered" },
];

export default function DispatcherOrdersPage() {
  const [orders, setOrders] = useState<DispatcherOrderDto[]>([]);
  const [summary, setSummary] = useState<DispatcherOrdersSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [tableSearch, setTableSearch] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const q = urlParams.get("search") || urlParams.get("q");
      if (q) {
        setTableSearch(q);
      }
    }
  }, []);

  const [selectedOrder, setSelectedOrder] = useState<DispatcherOrderDto | null>(null);
  const [cutoffLocked, setCutoffLocked] = useState<boolean>(false);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New order form state
  const [newOrderStore, setNewOrderStore] = useState("Colombo Central Fresh");
  const [newOrderBrand, setNewOrderBrand] = useState<"Fresh" | "Style" | "Tech">("Fresh");
  const [newOrderDistrict, setNewOrderDistrict] = useState("Colombo");
  const [newOrderItems, setNewOrderItems] = useState(25);
  const [newOrderVolume, setNewOrderVolume] = useState("3.5 m³");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "All") {
        params.set("status", statusFilter);
      }
      if (tableSearch.trim()) {
        params.set("search", tableSearch.trim());
      }

      const res = await fetch(`/api/dispatcher/orders?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load orders (HTTP ${res.status})`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setOrders(json.data.orders || []);
        if (json.data.summary) {
          setSummary(json.data.summary);
        }
      } else {
        throw new Error(json.error?.message || "Failed to load orders");
      }
    } catch (err) {
      console.error("Error loading dispatcher orders:", err);
      setError(err instanceof Error ? err.message : "Error loading orders");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, tableSearch]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleExportCSV = () => {
    const headers = [
      "Order ID",
      "Store",
      "Brand",
      "District",
      "Items",
      "Weight",
      "Volume",
      "Trip",
      "Placed",
      "Status",
    ];
    const rows = filteredOrders.map((o) => [
      o.id,
      `"${o.store}"`,
      o.brand,
      o.district,
      o.items,
      `"${o.weight}"`,
      `"${o.volume}"`,
      o.trip,
      `"${o.placed}"`,
      o.status,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `waypoint-orders-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Orders exported successfully as CSV");
  };

  const handleLockCutoff = () => {
    setCutoffLocked(!cutoffLocked);
    triggerToast(
      cutoffLocked
        ? "Order cutoff window unlocked for modifications"
        : "Order cutoff locked. Confirmed orders locked for dispatch"
    );
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `ORD-250613-${Math.floor(2850 + Math.random() * 50)}`;
    const newObj: DispatcherOrderDto = {
      id: newId,
      orderId: newId,
      outletId: "OUT001",
      store: newOrderStore,
      brand: newOrderBrand,
      district: newOrderDistrict,
      items: Number(newOrderItems),
      weight: "500 kg",
      weightKg: 500,
      volume: newOrderVolume,
      volumeM3: parseFloat(newOrderVolume) || 3.5,
      trip: "—",
      tripId: null,
      placed:
        "13 Jun " +
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      createdAt: new Date().toISOString(),
      deliveryDate: new Date().toISOString().slice(0, 10),
      isAfterCutoff: false,
      priorityScore: 0,
      status: "Pending",
      lifecycleStatus: "SUBMITTED",
      tempRequirement: newOrderBrand === "Fresh" ? "chilled" : "ambient",
    };
    setOrders([newObj, ...orders]);
    setIsNewOrderOpen(false);
    triggerToast(`Order ${newId} created successfully`);
  };

  // Filtered orders fallback in client if search or filter changes locally
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus =
        statusFilter === "All" ||
        o.status.toLowerCase() === statusFilter.toLowerCase();
      const q = tableSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.store.toLowerCase().includes(q) ||
        o.district.toLowerCase().includes(q) ||
        o.trip.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, tableSearch]);

  const cutoff = summary?.cutoffInfo ?? getCutoffInfo();
  const preCutoffCount =
    summary?.preCutoffCount ?? orders.filter((o) => !o.isAfterCutoff).length;
  const postCutoffCount =
    summary?.postCutoffCount ?? orders.filter((o) => o.isAfterCutoff).length;
  const confirmedCount =
    summary?.confirmedCount ??
    orders.filter((o) =>
      ["Confirmed", "Planned", "Dispatched", "Delivered"].includes(o.status)
    ).length;

  return (
    <div className="flex-1 flex flex-col">
      {/* ========================================================= */}
      {/* MAIN ORDERS CONTENT */}
      {/* ========================================================= */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* PAGE HEADER */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-black tracking-tight text-[#0F1020]">
              Orders
            </h1>
            <p className="text-xs text-[#7B7B9D] font-medium mt-0.5">
              {filteredOrders.length} orders · 13 June 2025
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Refresh button */}
            <Button
              variant="secondary"
              size="compact"
              onClick={loadOrders}
              disabled={isLoading}
              title="Refresh order queue"
              className="flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            {/* Export CSV button */}
            <Button
              variant="secondary"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#0F1020]" />
              <span>Export CSV</span>
            </Button>

            {/* + New order button */}
            <Button
              variant="primary"
              onClick={() => setIsNewOrderOpen(true)}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New order</span>
            </Button>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. ORDER CUTOFF SUMMARY BANNER (CREAM/YELLOW) */}
        {/* ========================================================= */}
        <section className="bg-[#FEF9EE] border border-[#F5E6BE] rounded-[16px] p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-[0_2px_10px_rgba(245,197,66,0.06)]">
          {/* Left: Clock Icon & Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#FDEBB8] text-[#9A7000] flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-[#9A7000]" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-[#0F1020]">
                Order cutoff: 16:00 today - {cutoff.formattedTimeLeft}
              </h2>
              <p className="text-[11px] text-[#7B7B9D] mt-0.5">
                After cutoff: confirmed orders move to planning queue · late orders roll to tomorrow's run
              </p>
            </div>
          </div>

          {/* Center: 3 Metric Counters */}
          <div className="flex items-center gap-6 sm:gap-10 border-t lg:border-t-0 lg:border-l border-amber-200/60 pt-3 lg:pt-0 lg:pl-8">
            {/* Metric 1 */}
            <div>
              <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#7B7B9D]">
                PRE-CUTOFF ORDERS
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#10B981] leading-tight mt-0.5">
                {preCutoffCount}
              </div>
              <div className="text-[9px] text-[#7B7B9D] mt-0.5">eligible for today</div>
            </div>

            {/* Metric 2 */}
            <div>
              <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#7B7B9D]">
                POST-CUTOFF ORDERS
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#F59E0B] leading-tight mt-0.5">
                {postCutoffCount}
              </div>
              <div className="text-[9px] text-[#7B7B9D] mt-0.5">roll to tomorrow</div>
            </div>

            {/* Metric 3 */}
            <div>
              <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#7B7B9D]">
                CONFIRMED TOTAL
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#4B8EF5] leading-tight mt-0.5">
                {confirmedCount}
              </div>
              <div className="text-[9px] text-[#7B7B9D] mt-0.5">planned or dispatched</div>
            </div>
          </div>

          {/* Right: Lock cutoff button */}
          <div className="flex items-center">
            <Button
              variant={cutoffLocked ? "danger" : "primary"}
              onClick={handleLockCutoff}
              className="flex items-center gap-1.5 shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{cutoffLocked ? "Cutoff Locked" : "Lock cutoff"}</span>
            </Button>
          </div>
        </section>

        {/* Error banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <Button variant="ghost" size="compact" onClick={loadOrders} className="text-rose-700 hover:bg-rose-100">
              Try again
            </Button>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. ORDERS MAIN DATA TABLE CARD */}
        {/* ========================================================= */}
        <section className="bg-white rounded-[16px] border border-black/[0.06] shadow-[0_2px_12px_rgba(15,16,32,0.05)] p-5">
          {/* Filter Tabs & Search Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.05]">
            {/* Filter Pills using FilterTabs */}
            <FilterTabs
              tabs={STATUS_TABS}
              activeTab={statusFilter}
              onSelect={(tabId) => setStatusFilter(tabId)}
            />

            {/* Table Search */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/[0.08] bg-slate-50/60 focus-within:bg-white focus-within:border-[#F5C542] transition-colors w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search orders..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-xs text-[#0F1020] placeholder-slate-400"
              />
              {tableSearch && (
                <button
                  type="button"
                  onClick={() => setTableSearch("")}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/[0.05] text-[10px] font-bold text-[#7B7B9D] tracking-wider uppercase">
                  <th className="py-3 px-3 font-bold">ORDER ID</th>
                  <th className="py-3 px-3 font-bold">STORE</th>
                  <th className="py-3 px-3 font-bold text-center">BRAND</th>
                  <th className="py-3 px-3 font-bold">DISTRICT</th>
                  <th className="py-3 px-3 font-bold">ITEMS</th>
                  <th className="py-3 px-3 font-bold">VOLUME</th>
                  <th className="py-3 px-3 font-bold">TRIP</th>
                  <th className="py-3 px-3 font-bold">PLACED</th>
                  <th className="py-3 px-3 font-bold text-center">STATUS</th>
                  <th className="py-3 px-3 font-bold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {isLoading && orders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-xs text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#F5C542]" />
                        <span>Loading orders...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-xs text-slate-400">
                      No orders found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedOrder(item)}
                      className="hover:bg-slate-50/80 transition-colors text-xs cursor-pointer group"
                    >
                      {/* Order ID */}
                      <td className="py-3.5 px-3 font-mono font-semibold text-[#0F1020] text-xs whitespace-nowrap">
                        {item.id}
                      </td>

                      {/* Store */}
                      <td className="py-3.5 px-3 font-bold text-[#0F1020] text-xs whitespace-nowrap group-hover:text-blue-600 transition-colors">
                        {item.store}
                      </td>

                      {/* Brand Tag Component */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <BrandTag brand={item.brand} />
                      </td>

                      {/* District */}
                      <td className="py-3.5 px-3 text-[#7B7B9D] text-xs whitespace-nowrap">
                        {item.district}
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-3 font-bold text-[#0F1020] text-xs whitespace-nowrap">
                        {item.items}
                      </td>

                      {/* Volume */}
                      <td className="py-3.5 px-3 text-[#7B7B9D] text-xs whitespace-nowrap">
                        {item.volume}
                      </td>

                      {/* Trip */}
                      <td className="py-3.5 px-3 font-mono text-xs whitespace-nowrap text-[#7B7B9D]">
                        {item.trip}
                      </td>

                      {/* Placed */}
                      <td className="py-3.5 px-3 text-[#7B7B9D] text-xs whitespace-nowrap">
                        {item.placed}
                      </td>

                      {/* Status Badge Component */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Action Eye Icon */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          aria-label="View order details"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(item);
                          }}
                          className="w-7 h-7 rounded-full inline-flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ========================================================= */}
      {/* 5. ORDER DETAILS MODAL */}
      {/* ========================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[18px] max-w-md w-full p-6 shadow-2xl border border-black/10 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.08]">
              <div>
                <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                  {selectedOrder.id}
                </span>
                <h3 className="text-base font-bold text-[#0F1020] mt-1">
                  {selectedOrder.store}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3.5 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-[#7B7B9D]">Retail Brand</span>
                <BrandTag brand={selectedOrder.brand} />
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-[#7B7B9D]">District / Depot</span>
                <span className="font-semibold text-[#0F1020]">{selectedOrder.district}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-[#7B7B9D]">Cartons / Items</span>
                <span className="font-bold text-[#0F1020]">{selectedOrder.items} units</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-[#7B7B9D]">Weight & Volume</span>
                <span className="font-semibold text-[#0F1020]">
                  {selectedOrder.weight} · {selectedOrder.volume}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-[#7B7B9D]">Assigned Trip</span>
                <span className="font-mono font-bold text-[#0F1020]">{selectedOrder.trip}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04]">
                <span className="text-[#7B7B9D]">Order Placed At</span>
                <span className="font-semibold text-[#0F1020]">{selectedOrder.placed}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#7B7B9D]">Current Status</span>
                <StatusBadge status={selectedOrder.status} />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-black/[0.08]">
              <Button
                variant="primary"
                onClick={() => {
                  triggerToast(`Order ${selectedOrder.id} status updated`);
                  setSelectedOrder(null);
                }}
                className="w-full"
              >
                Update Dispatch Assignment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. CREATE NEW ORDER MODAL */}
      {/* ========================================================= */}
      {isNewOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[18px] max-w-md w-full p-6 shadow-2xl border border-black/10 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.08]">
              <div>
                <h3 className="text-base font-bold text-[#0F1020]">Create New Store Order</h3>
                <p className="text-xs text-[#7B7B9D] mt-0.5">Pre-cutoff entry for retail distribution</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewOrderOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0F1020] mb-1">Store Outlet</label>
                <input
                  type="text"
                  value={newOrderStore}
                  onChange={(e) => setNewOrderStore(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-black/10 bg-slate-50 focus:bg-white focus:border-[#F5C542] outline-none text-xs text-[#0F1020]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0F1020] mb-1">Brand</label>
                  <select
                    value={newOrderBrand}
                    onChange={(e) => setNewOrderBrand(e.target.value as "Fresh" | "Style" | "Tech")}
                    className="w-full px-3 py-2 rounded-lg border border-black/10 bg-slate-50 focus:bg-white focus:border-[#F5C542] outline-none text-xs text-[#0F1020]"
                  >
                    <option value="Fresh">Fresh</option>
                    <option value="Style">Style</option>
                    <option value="Tech">Tech</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0F1020] mb-1">District</label>
                  <select
                    value={newOrderDistrict}
                    onChange={(e) => setNewOrderDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-black/10 bg-slate-50 focus:bg-white focus:border-[#F5C542] outline-none text-xs text-[#0F1020]"
                  >
                    <option value="Colombo">Colombo</option>
                    <option value="Kandy">Kandy</option>
                    <option value="NWP">NWP (Kurunegala)</option>
                    <option value="Galle">Galle</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0F1020] mb-1">Cartons / Items</label>
                  <input
                    type="number"
                    value={newOrderItems}
                    onChange={(e) => setNewOrderItems(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-black/10 bg-slate-50 focus:bg-white focus:border-[#F5C542] outline-none text-xs text-[#0F1020]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0F1020] mb-1">Volume</label>
                  <input
                    type="text"
                    value={newOrderVolume}
                    onChange={(e) => setNewOrderVolume(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-black/10 bg-slate-50 focus:bg-white focus:border-[#F5C542] outline-none text-xs text-[#0F1020]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.08]">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsNewOrderOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  Create Order
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. TOAST NOTIFICATION POPUP */}
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
