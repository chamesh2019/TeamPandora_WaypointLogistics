"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "../../../components/layout/header";
import { Button, StatCard } from "../../../components/design-system";
import PlaceOrderForm from "./place-order-form";
import { getCutoffInfo, type CutoffInfo } from "../../../lib/utils/cutoff";
import type {
  StoreOrderSummaryDto,
  StoreOverviewDto,
  OrderLifecycleStatus,
} from "../../../lib/types/store-api";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Check,
  Clock3,
  Eye,
  LayoutGrid,
  Package,
  Plus,
  RefreshCw,
  Truck,
} from "lucide-react";

const storeNavItems = [
  { name: "Overview", href: "/store", icon: LayoutGrid },
  { name: "Orders", href: "/store/orders", icon: Package },
  { name: "Incoming", href: "/store/incoming", icon: Truck },
  { name: "Receipts", href: "/store/receipts", icon: Check },
  { name: "Claims", href: "/store/claims", icon: AlertTriangle },
  { name: "Deferrals", href: "/store/deferrals", icon: Calendar },
  { name: "Reports", href: "/store/reports", icon: BarChart3 },
];

const metricBars = {
  blue: [22, 34, 28, 36, 42, 48, 54],
  green: [18, 26, 30, 36, 42, 38, 48],
  purple: [14, 18, 23, 28, 34, 30, 36],
  orange: [16, 21, 24, 30, 34, 32, 28],
};

function getStatusBadge(status: OrderLifecycleStatus) {
  switch (status) {
    case "SUBMITTED":
      return {
        label: "Pending",
        className: "bg-[#FFF7ED] text-[#B45309] border border-[#FCD9A7]",
      };
    case "CONFIRMED":
      return {
        label: "Confirmed",
        className: "bg-[#EEF4FF] text-[#2463EB] border border-[#D9E8FF]",
      };
    case "PLANNED":
      return {
        label: "Planned",
        className: "bg-[#EEF4FF] text-[#2463EB] border border-[#D9E8FF]",
      };
    case "IN_TRANSIT":
      return {
        label: "In Transit",
        className: "bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]",
      };
    case "DELIVERED":
      return {
        label: "Delivered",
        className: "bg-[#ECFDF5] text-[#047857] border border-[#C7F0DA]",
      };
    case "RECEIVED":
      return {
        label: "Received",
        className: "bg-[#ECFDF5] text-[#047857] border border-[#C7F0DA]",
      };
    case "DEFERRED":
      return {
        label: "Deferred",
        className: "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]",
      };
    case "DISPUTED":
      return {
        label: "Disputed",
        className: "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]",
      };
    case "FAILED":
      return {
        label: "Failed",
        className: "bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]",
      };
    default:
      return {
        label: status,
        className: "bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]",
      };
  }
}

function formatPlaced(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return `Today ${d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}`;
    }
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
}

async function fetchStoreOrdersData(): Promise<{
  orders: StoreOrderSummaryDto[];
  overview: StoreOverviewDto | null;
  error: string | null;
}> {
  try {
    const [ordersRes, overviewRes] = await Promise.all([
      fetch("/api/store/orders?pageSize=50"),
      fetch("/api/store/overview"),
    ]);

    const ordersJson = await ordersRes.json();
    const overviewJson = await overviewRes.json();

    const orders =
      ordersRes.ok && ordersJson.success ? ordersJson.data || [] : [];
    const error =
      !ordersRes.ok || !ordersJson.success
        ? ordersJson?.error?.message || "Failed to load orders"
        : null;
    const overview =
      overviewRes.ok && overviewJson.success ? overviewJson.data : null;

    return { orders, overview, error };
  } catch (err) {
    return {
      orders: [],
      overview: null,
      error: err instanceof Error ? err.message : "Failed to load orders",
    };
  }
}

export default function OrdersPage() {
  const [placeOrderOpen, setPlaceOrderOpen] = useState(false);
  const [orders, setOrders] = useState<StoreOrderSummaryDto[]>([]);
  const [overview, setOverview] = useState<StoreOverviewDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cutoffInfo, setCutoffInfo] = useState<CutoffInfo>(() => getCutoffInfo());

  const applyStoreData = useCallback(
    (data: {
      orders: StoreOrderSummaryDto[];
      overview: StoreOverviewDto | null;
      error: string | null;
    }) => {
      setOrders(data.orders);
      setOverview(data.overview);
      setError(data.error);
      setIsLoading(false);
    },
    []
  );

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const data = await fetchStoreOrdersData();
    applyStoreData(data);
  }, [applyStoreData]);

  useEffect(() => {
    let ignore = false;

    async function init() {
      const data = await fetchStoreOrdersData();
      if (!ignore) {
        applyStoreData(data);
      }
    }

    void init();

    const interval = setInterval(() => {
      setCutoffInfo(getCutoffInfo());
    }, 60000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [applyStoreData]);

  // Derived metrics
  const openOrdersCount =
    overview?.kpis?.activeOrdersCount ??
    orders.filter((o) =>
      ["SUBMITTED", "CONFIRMED", "PLANNED", "IN_TRANSIT"].includes(
        o.lifecycleStatus
      )
    ).length;

  const pendingCutoffCount = orders.filter(
    (o) => o.lifecycleStatus === "SUBMITTED"
  ).length;

  const nextDeliveryText =
    overview?.kpis?.nextArrival?.eta ??
    (() => {
      const upcoming = orders.find(
        (o) =>
          o.dispatchDate &&
          ["CONFIRMED", "PLANNED", "IN_TRANSIT"].includes(o.lifecycleStatus)
      );
      return upcoming?.dispatchDate ? `${upcoming.dispatchDate}` : "07:00";
    })();

  const deliveredMonthCount = orders.filter(
    (o) => o.lifecycleStatus === "DELIVERED" || o.lifecycleStatus === "RECEIVED"
  ).length;

  return (
    <>
      <Header
        navItems={storeNavItems}
        activeHref="/store/orders"
        brandName="Waypoint"
        brandSubtitle="Store Manager"
      />

      <div className="min-h-screen bg-[#E9EDF3] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-[20px] font-extrabold tracking-[-0.04em] text-[#0F1020] sm:text-[28px]">
                My orders
              </h1>
              <p className="mt-1 text-[11px] text-[#747B93]">
                Bambalapitiya Fresh · Order history
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="secondary"
                className="px-3 py-2 text-[12px] font-semibold"
                onClick={handleRefresh}
                disabled={isLoading}
                aria-label="Refresh orders"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
              <Button
                type="button"
                variant="primary"
                className="px-4 py-2.5 text-[12px] font-bold"
                onClick={() => setPlaceOrderOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Place order
              </Button>
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5 xl:[&>*]:min-w-[260px]">
            <StatCard
              icon={<Package className="h-4 w-4" />}
              label="Open orders"
              value={String(openOrdersCount)}
              note={
                pendingCutoffCount > 0
                  ? `${pendingCutoffCount} pending cutoff`
                  : "All dispatched"
              }
              tone="blue"
              bars={metricBars.blue}
            />
            <StatCard
              icon={<Clock3 className="h-4 w-4" />}
              label="Next delivery"
              value={nextDeliveryText}
              note="Scheduled run"
              tone="green"
              bars={metricBars.green}
            />
            <StatCard
              icon={<Check className="h-4 w-4" />}
              label="Delivered this month"
              value={String(deliveredMonthCount)}
              note="100% on time"
              tone="purple"
              bars={metricBars.purple}
            />
            <StatCard
              icon={<AlertTriangle className="h-4 w-4" />}
              label="Order cutoff"
              value="16:00"
              note={cutoffInfo.statNoteText}
              tone="orange"
              bars={metricBars.orange}
            />
          </section>

          {error && (
            <div className="mt-4 flex items-center justify-between rounded-[10px] border border-red-200 bg-red-50 p-3.5 text-[12px] text-red-700">
              <span>{error}</span>
              <button
                type="button"
                onClick={handleRefresh}
                className="font-bold underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="mt-6 overflow-hidden rounded-[14px] border border-black/[0.07] bg-white shadow-[0_2px_12px_rgba(15,16,32,0.07),0_0_0_1px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between border-b border-[#E7EAF0] px-5 py-3.5">
              <div>
                <div className="text-[13px] font-bold text-[#0F1020] leading-tight">
                  Order history
                </div>
                <div className="mt-0.5 text-[10px] text-[#7B7B9D]">
                  All orders for Bambalapitiya Fresh
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="bg-[#F6F7FB] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B7B9D]">
                    <th className="px-4 py-3 font-semibold">Order ID</th>
                    <th className="px-4 py-3 font-semibold">Placed</th>
                    <th className="px-4 py-3 font-semibold">Items</th>
                    <th className="px-4 py-3 font-semibold">Volume</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">ETA</th>
                    <th className="px-4 py-3 text-right font-semibold"> </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-[12px] text-[#7B7B9D]"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin text-[#7B7B9D]" />
                          <span>Loading order history...</span>
                        </div>
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-[12px] text-[#7B7B9D]"
                      >
                        <Package className="mx-auto mb-2 h-8 w-8 text-[#C2C6D6]" />
                        <p className="font-semibold text-[#0F1020]">
                          No orders found
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#747B93]">
                          No orders placed yet. Click &quot;Place order&quot; to
                          create a new order.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const badge = getStatusBadge(order.lifecycleStatus);
                      const isChilled = order.tempRequirement === "chilled";

                      return (
                        <tr
                          key={order.orderId}
                          className="border-b border-[#E7EAF0] text-[12px] text-[#0F1020] hover:bg-[#F9FAFC] transition-colors"
                        >
                          <td className="px-4 py-3 font-medium tracking-[-0.02em] text-[#0F1020]">
                            {order.orderId}
                          </td>
                          <td className="px-4 py-3 text-[#7B7B9D]">
                            {formatPlaced(order.createdAt || order.orderDate)}
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            <span className="flex items-center gap-1.5">
                              {order.orderUnits} cartons
                              {isChilled && (
                                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-600 border border-blue-200">
                                  Chilled
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#7B7B9D]">
                            {order.orderVolumeM3} m³
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-[9px] font-bold ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#7B7B9D]">
                            {order.dispatchDate
                              ? `Delivery ${order.dispatchDate}`
                              : "Pending plan"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#DDE3EF] bg-white text-[#7B7B9D] transition-colors hover:border-[#C9D5F2] hover:text-[#0F1020]"
                              aria-label={`View ${order.orderId}`}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {placeOrderOpen && (
        <PlaceOrderForm
          onClose={() => setPlaceOrderOpen(false)}
          onSuccess={() => {
            handleRefresh();
          }}
        />
      )}
    </>
  );
}
