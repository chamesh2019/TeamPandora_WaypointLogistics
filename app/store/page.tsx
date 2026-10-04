"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Header from "../../components/layout/header";
import { Button, Panel, StatCard } from "../../components/design-system";
import { useSession } from "../../lib/auth-client";
import PlaceOrderForm from "./orders/place-order-form";
import type {
  StoreOverviewDto,
  PendingReceiptDto,
} from "../../lib/types/store-api";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  LayoutGrid,
  Package,
  Phone,
  RefreshCw,
  ShoppingCart,
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

function formatDelivered(dateStr?: string | null): string {
  if (!dateStr) return "Delivered recently";
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
    return `Delivered ${d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    })} · ${d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}`;
  } catch {
    return dateStr;
  }
}

async function fetchStoreOverviewData(): Promise<{
  overview: StoreOverviewDto | null;
  receipts: PendingReceiptDto[];
  error: string | null;
}> {
  try {
    const [overviewRes, receiptsRes] = await Promise.all([
      fetch("/api/store/overview"),
      fetch("/api/store/receipts"),
    ]);

    const overviewJson = await overviewRes.json();
    const receiptsJson = await receiptsRes.json();

    const overview =
      overviewRes.ok && overviewJson.success ? overviewJson.data : null;
    const receipts =
      receiptsRes.ok && receiptsJson.success ? receiptsJson.data || [] : [];
    const error =
      !overviewRes.ok || !overviewJson.success
        ? overviewJson?.error?.message || "Failed to load store overview"
        : null;

    return { overview, receipts, error };
  } catch (err) {
    return {
      overview: null,
      receipts: [],
      error:
        err instanceof Error ? err.message : "Failed to load store overview",
    };
  }
}

export default function StorePage() {
  const [placeOrderOpen, setPlaceOrderOpen] = useState(false);
  const [overview, setOverview] = useState<StoreOverviewDto | null>(null);
  const [pendingReceipts, setPendingReceipts] = useState<PendingReceiptDto[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: session } = useSession();
  const sessionUser = session?.user as
    | { name?: string; username?: string; outletId?: string }
    | undefined;
  const userName = sessionUser?.name || sessionUser?.username || "Manager";
  const outletId = sessionUser?.outletId || pendingReceipts[0]?.outletId || "Store";

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const data = await fetchStoreOverviewData();
    setOverview(data.overview);
    setPendingReceipts(data.receipts);
    setError(data.error);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      const data = await fetchStoreOverviewData();
      if (!ignore) {
        setOverview(data.overview);
        setPendingReceipts(data.receipts);
        setError(data.error);
        setIsLoading(false);
      }
    }
    void init();
    return () => {
      ignore = true;
    };
  }, []);

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
        ? "Good afternoon"
        : "Good evening";

  const nextArrival = overview?.kpis.nextArrival;
  const activeOrders = overview?.kpis.activeOrdersCount ?? 0;
  const pendingCount = pendingReceipts.length || overview?.kpis.pendingReceiptsCount || 0;
  const activeDisputes = overview?.kpis.activeDisputesCount ?? 0;

  const nextDeliveryTime = nextArrival?.eta
    ? nextArrival.eta.slice(0, 5)
    : "--:--";
  const nextDeliveryNote = nextArrival
    ? nextArrival.isLate
      ? `Delayed · Driver: ${nextArrival.driverName || "Assigned"}`
      : `On schedule · Driver: ${nextArrival.driverName || "Assigned"}`
    : "No incoming trips today";

  const driverInitials = (nextArrival?.driverName || "DP")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <Header
        navItems={storeNavItems}
        activeHref="/store"
        brandName="Waypoint"
        brandSubtitle="Store Manager"
      />

      <div className="min-h-screen bg-[#E9EDF3] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-[20px] font-extrabold tracking-[-0.04em] text-[#0F1020] sm:text-[28px]">
                {greeting}, {userName}
              </h1>
              <p className="mt-1 text-[11px] text-[#747B93]">
                {outletId} · Store operations dashboard
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                className="px-3 py-2 text-[12px] font-semibold"
                onClick={loadData}
                disabled={isLoading}
                aria-label="Refresh dashboard"
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
                <span className="text-base leading-none">+</span>
                Place order
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-5 flex items-center justify-between rounded-[10px] border border-red-200 bg-red-50 p-3.5 text-[12px] text-red-700">
              <span>{error}</span>
              <button
                type="button"
                onClick={loadData}
                className="font-bold underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          {overview?.alerts && overview.alerts.length > 0 && (
            <div className="mb-5 space-y-2">
              {overview.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between rounded-[10px] border border-amber-200 bg-[#FFFBEB] p-3 text-[12px] text-[#B45309]"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-[#F59E0B]" />
                    <span>{alert.message}</span>
                  </div>
                  <Link
                    href={alert.link || "/store/deferrals"}
                    className="font-bold underline hover:no-underline"
                  >
                    View details
                  </Link>
                </div>
              ))}
            </div>
          )}

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5 xl:[&>*]:min-w-[260px]">
            <StatCard
              icon={<Truck className="h-4 w-4" />}
              label="Next delivery"
              value={nextDeliveryTime}
              note={nextDeliveryNote}
              tone="blue"
              bars={metricBars.blue}
            />
            <StatCard
              icon={<ShoppingCart className="h-4 w-4" />}
              label="Open orders"
              value={String(activeOrders)}
              note={
                activeOrders > 0
                  ? `${activeOrders} active orders in progress`
                  : "No open orders"
              }
              tone="green"
              bars={metricBars.green}
            />
            <StatCard
              icon={<Check className="h-4 w-4" />}
              label="Pending receipts"
              value={String(pendingCount)}
              note={
                pendingCount > 0
                  ? "Awaiting confirmation sign-off"
                  : "All orders confirmed"
              }
              tone="purple"
              bars={metricBars.purple}
            />
            <StatCard
              icon={<AlertTriangle className="h-4 w-4" />}
              label="Open claims"
              value={String(activeDisputes)}
              note={
                activeDisputes > 0
                  ? `${activeDisputes} under review`
                  : "No active disputes"
              }
              tone="orange"
              bars={metricBars.orange}
            />
          </section>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1.7fr_1fr]">
            {/* Left Panel: Incoming Deliveries */}
            <Panel>
              <div className="flex items-center justify-between border-b border-[#E7EAF0] px-5 py-3.5">
                <div>
                  <div className="text-[13px] font-bold text-[#0F1020] leading-tight">
                    Incoming deliveries
                  </div>
                  <div className="mt-0.5 text-[10px] text-[#7B7B9D]">
                    Live service and visibility
                  </div>
                </div>

                {nextArrival ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/20 bg-[#10B981]/10 px-2 py-0.5 text-[9px] font-bold text-[#10B981]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                    Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#7B7B9D]/20 bg-[#7B7B9D]/10 px-2 py-0.5 text-[9px] font-bold text-[#7B7B9D]">
                    Idle
                  </span>
                )}
              </div>

              <div className="px-4 pb-4 pt-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-10 text-[12px] text-[#7B7B9D]">
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin text-[#4B8EF5]" />
                    <span>Loading incoming delivery status...</span>
                  </div>
                ) : nextArrival ? (
                  <>
                    <div className="flex items-center justify-between gap-3 border-b border-[#E7EAF0] pb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#EEF4FF] text-[#4B8EF5]">
                          <Truck className="h-5 w-5" />
                        </div>

                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B7B9D]">
                            Arriving next
                          </div>
                          <div className="mt-1 text-[18px] font-extrabold tracking-[-0.04em] text-[#0F1020]">
                            {nextArrival.orderId} · {nextArrival.vehicleType}
                          </div>
                          <div className="mt-1 text-[10px] text-[#7B7B9D]">
                            Vehicle: {nextArrival.vehicleId} · Status:{" "}
                            {nextArrival.status}
                          </div>
                        </div>
                      </div>

                      <div className="flex min-w-[150px] items-center justify-end gap-3">
                        <div className="text-right">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B7B9D]">
                            Live ETA
                          </div>
                          <div className="mt-1 text-[34px] font-extrabold tracking-[-0.06em] text-[#0F1020]">
                            {nextDeliveryTime}
                          </div>
                          <div
                            className={`text-[10px] font-semibold ${
                              nextArrival.isLate
                                ? "text-[#EF4444]"
                                : "text-[#10B981]"
                            }`}
                          >
                            {nextArrival.isLate ? "Delayed" : "On time"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5C542] text-[11px] font-bold text-[#0F1928]">
                          {driverInitials}
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7B7B9D]">
                            Driver
                          </div>
                          <div className="mt-0.5 text-[13px] font-bold text-[#0F1020]">
                            {nextArrival.driverName || "Assigned driver"}
                          </div>
                        </div>
                      </div>

                      {nextArrival.driverPhone ? (
                        <a
                          href={`tel:${nextArrival.driverPhone}`}
                          className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-[#E7EAF0] bg-white px-3 py-2 text-[12px] font-semibold text-[#0F1020] shadow-[0_1px_2px_rgba(15,16,32,0.03)] hover:bg-[#F7FAFF] transition-all"
                        >
                          <Phone className="h-3.5 w-3.5 text-[#4B8EF5]" />
                          Call driver
                        </a>
                      ) : (
                        <Button
                          type="button"
                          variant="secondary"
                          disabled
                          className="min-h-[34px] px-3 py-2 text-[12px] font-semibold"
                        >
                          <Phone className="h-3.5 w-3.5 text-[#7B7B9D]" />
                          No phone
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-[#7B7B9D]">
                    <Truck className="mb-2 h-8 w-8 text-[#CBD5E1]" />
                    <p className="font-semibold text-[#0F1020]">
                      No scheduled deliveries currently
                    </p>
                    <p className="mt-1 text-[11px] text-[#747B93]">
                      All assigned trips for this outlet have arrived or are
                      completed.
                    </p>
                  </div>
                )}

                <Link
                  href="/store/incoming"
                  className="group -mx-4 -mb-4 mt-4 flex w-[calc(100%+2rem)] items-center justify-center gap-1.5 rounded-b-xl border-t border-[#E7EAF0] bg-[#F4F7FF] px-4 py-3 text-[12px] font-semibold text-[#4B8EF5] transition-all duration-200 hover:bg-[#E5EEFF] hover:text-[#245CE3]"
                >
                  Track delivery in Incoming tab
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </Panel>

            {/* Right Panel: Pending Confirmations */}
            <Panel>
              <div className="flex items-center justify-between border-b border-[#E7EAF0] px-5 py-3.5">
                <div>
                  <div className="text-[13px] font-bold text-[#0F1020] leading-tight">
                    Pending confirmations
                  </div>
                  <div className="mt-0.5 text-[10px] text-[#7B7B9D]">
                    Delivered orders needing sign-off
                  </div>
                </div>

                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    pendingReceipts.length > 0
                      ? "bg-[#FEE2E2] text-[#EF4444]"
                      : "bg-[#E9F9F1] text-[#10B981]"
                  }`}
                >
                  {pendingReceipts.length}
                </span>
              </div>

              <div className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-10 text-[12px] text-[#7B7B9D]">
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin text-[#4B8EF5]" />
                    <span>Loading receipts...</span>
                  </div>
                ) : pendingReceipts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-[#7B7B9D]">
                    <Check className="mb-2 h-8 w-8 text-[#10B981]" />
                    <p className="font-semibold text-[#0F1020]">
                      All caught up!
                    </p>
                    <p className="mt-1 text-[11px] text-[#747B93]">
                      No pending receipts awaiting confirmation sign-off.
                    </p>
                  </div>
                ) : (
                  pendingReceipts.slice(0, 3).map((receipt, idx) => (
                    <div
                      key={receipt.orderId}
                      className={`flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#F9FAFC] transition-colors ${
                        idx < Math.min(pendingReceipts.length, 3) - 1
                          ? "border-b border-[#E7EAF0]"
                          : ""
                      }`}
                    >
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B7B9D]">
                          {formatDelivered(
                            receipt.deliveredAt || receipt.orderDate
                          )}
                        </div>
                        <div className="mt-1 text-[15px] font-extrabold tracking-[-0.04em] text-[#0F1020]">
                          {receipt.orderId}
                        </div>
                        <div className="mt-1 text-[10px] text-[#7B7B9D]">
                          Driver: {receipt.driverName || "Assigned Driver"}
                          {receipt.recipientName
                            ? ` · Signed: ${receipt.recipientName}`
                            : ""}
                        </div>
                      </div>

                      <Link
                        href={`/store/receipts?orderId=${encodeURIComponent(
                          receipt.orderId
                        )}`}
                        className="inline-flex min-h-[30px] items-center justify-center rounded-[8px] bg-[#0F1020] px-3 py-1.5 text-[10px] font-bold text-white shadow-[0_1px_2px_rgba(15,16,32,0.06)] hover:bg-[#252846] transition-all"
                        title="Open receipt in Receipts tab"
                      >
                        Review receipt
                      </Link>
                    </div>
                  ))
                )}

                <Link
                  href="/store/receipts"
                  className="group -mx-4 -mb-4 mt-2 flex w-[calc(100%+2rem)] items-center justify-center gap-1.5 rounded-b-xl border-t border-[#E7EAF0] bg-[#F4F7FF] px-4 py-3 text-[12px] font-semibold text-[#4B8EF5] transition-all duration-200 hover:bg-[#E5EEFF] hover:text-[#245CE3]"
                >
                  View all receipts in Receipts tab
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </Panel>
          </div>
        </div>
      </div>

      {placeOrderOpen && (
        <PlaceOrderForm onClose={() => setPlaceOrderOpen(false)} />
      )}
    </>
  );
}
