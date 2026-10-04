"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "../../../components/layout/header";
import { Button } from "../../../components/design-system";
import ConfirmReceiptModal from "./confirm-receipt-modal";
import type {
  PendingReceiptDto,
  StoreOverviewDto,
} from "../../../lib/types/store-api";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Check,
  Clipboard,
  Clock3,
  FileText,
  LayoutGrid,
  Package,
  RefreshCw,
  Truck,
  X,
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

function formatDelivered(dateStr: string): string {
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

async function fetchStoreReceiptsData(): Promise<{
  receipts: PendingReceiptDto[];
  overview: StoreOverviewDto | null;
  error: string | null;
}> {
  try {
    const [receiptsRes, overviewRes] = await Promise.all([
      fetch("/api/store/receipts"),
      fetch("/api/store/overview"),
    ]);

    const receiptsJson = await receiptsRes.json();
    const overviewJson = await overviewRes.json();

    const receipts =
      receiptsRes.ok && receiptsJson.success ? receiptsJson.data || [] : [];
    const error =
      !receiptsRes.ok || !receiptsJson.success
        ? receiptsJson?.error?.message || "Failed to load receipts"
        : null;
    const overview =
      overviewRes.ok && overviewJson.success ? overviewJson.data : null;

    return { receipts, overview, error };
  } catch (err) {
    return {
      receipts: [],
      overview: null,
      error: err instanceof Error ? err.message : "Failed to load receipts",
    };
  }
}

function ReceiptsContent() {
  const searchParams = useSearchParams();
  const queryOrderId = searchParams.get("orderId");

  const [receipts, setReceipts] = useState<PendingReceiptDto[]>([]);
  const [overview, setOverview] = useState<StoreOverviewDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmReceipt, setConfirmReceipt] =
    useState<PendingReceiptDto | null>(null);
  const [reviewReceipt, setReviewReceipt] =
    useState<PendingReceiptDto | null>(null);

  useEffect(() => {
    if (queryOrderId && receipts.length > 0) {
      const matched = receipts.find((r) => r.orderId === queryOrderId);
      if (matched) {
        setReviewReceipt(matched);
      }
    }
  }, [queryOrderId, receipts]);

  const applyReceiptsData = useCallback(
    (data: {
      receipts: PendingReceiptDto[];
      overview: StoreOverviewDto | null;
      error: string | null;
    }) => {
      setReceipts(data.receipts);
      setOverview(data.overview);
      setError(data.error);
      setIsLoading(false);
    },
    []
  );

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const data = await fetchStoreReceiptsData();
    applyReceiptsData(data);
  }, [applyReceiptsData]);

  useEffect(() => {
    let ignore = false;

    async function init() {
      const data = await fetchStoreReceiptsData();
      if (!ignore) {
        applyReceiptsData(data);
      }
    }

    void init();

    return () => {
      ignore = true;
    };
  }, [applyReceiptsData]);

  const pendingCount = receipts.length;
  const activeDisputesCount = overview?.kpis.activeDisputesCount ?? 0;
  const nextEta = overview?.kpis.nextArrival?.eta ?? "07:35";

  const summaryStats = [
    {
      label: "Pending sign-off",
      value: String(pendingCount),
      sub: pendingCount > 0 ? "Confirm to close" : "All signed off",
      tone: "amber" as const,
      icon: Clipboard,
      bars: [30, 26, 35, 45, 52, 59, 40],
    },
    {
      label: "Pending receipts",
      value: String(overview?.kpis.pendingReceiptsCount ?? pendingCount),
      sub: "Awaiting inspection",
      tone: "green" as const,
      icon: Check,
      bars: [24, 34, 42, 58, 55, 60, 72],
    },
    {
      label: "Active disputes",
      value: String(activeDisputesCount),
      sub: activeDisputesCount > 0 ? "Discrepancy noted" : "No active issues",
      tone: "purple" as const,
      icon: AlertTriangle,
      bars: [18, 27, 32, 41, 48, 60, 50],
    },
    {
      label: "Next arrival",
      value: nextEta,
      sub: overview?.kpis.nextArrival
        ? `Driver: ${overview.kpis.nextArrival.driverName}`
        : "Scheduled run",
      tone: "blue" as const,
      icon: Clock3,
      bars: [28, 30, 45, 52, 60, 48, 64],
    },
  ];

  return (
    <>
      <Header
        navItems={storeNavItems}
        activeHref="/store/receipts"
        brandName="Waypoint"
        brandSubtitle="Store Manager"
      />

      <div className="min-h-screen bg-[#E9EDF3] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-[20px] font-extrabold tracking-[-0.04em] text-[#0F1020] sm:text-[28px]">
                Receipts
              </h1>
              <p className="mt-1 text-[11px] text-[#747B93]">
                Deliveries awaiting your confirmation
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="px-3 py-2 text-[12px] font-semibold"
              onClick={handleRefresh}
              disabled={isLoading}
              aria-label="Refresh receipts"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5 xl:[&>*]:min-w-[240px]">
            {summaryStats.map((item) => {
              const Icon = item.icon;
              const toneMap = {
                amber: {
                  box: "bg-[#FFF7E8] text-[#F59E0B]",
                  bar: "bg-[#F8E5B2]",
                  active: "bg-[#F5C542]",
                },
                green: {
                  box: "bg-[#E9F9F1] text-[#10B981]",
                  bar: "bg-[#CEF1DE]",
                  active: "bg-[#10B981]",
                },
                purple: {
                  box: "bg-[#F2EAFF] text-[#7C3AED]",
                  bar: "bg-[#E2D4FF]",
                  active: "bg-[#7C3AED]",
                },
                blue: {
                  box: "bg-[#EEF4FF] text-[#4B8EF5]",
                  bar: "bg-[#CFE1FF]",
                  active: "bg-[#4B8EF5]",
                },
              }[item.tone];

              return (
                <div
                  key={item.label}
                  className="rounded-[16px] border border-black/[0.07] bg-white p-[26px] shadow-[0_2px_12px_rgba(15,16,32,0.07),0_0_0_1px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_28px_rgba(15,16,32,0.1)] hover:-translate-y-[2px] transition-all duration-200"
                >
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <span className="text-[12px] font-medium text-[#7B7B9D]">
                      {item.label}
                    </span>
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${toneMap.box}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mb-2 text-[36px] font-extrabold tracking-[-0.04em] text-[#0F1020] leading-none">
                    {item.value}
                  </div>
                  <div className="text-[10px] font-semibold text-[#7B7B9D]">
                    {item.sub}
                  </div>

                  <div className="mt-4 flex h-[44px] items-end gap-[3px]">
                    {item.bars.map((bar, idx) => (
                      <div
                        key={`${item.label}-${idx}`}
                        className={`flex-1 rounded-t-[3px] ${
                          idx === item.bars.length - 1
                            ? toneMap.active
                            : toneMap.bar
                        }`}
                        style={{ height: `${Math.max(12, bar)}%` }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
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
                  Pending receipts
                </div>
                <div className="mt-0.5 text-[10px] text-[#7B7B9D]">
                  Confirm carton count and condition
                </div>
              </div>

              <span className="inline-flex items-center rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[9px] font-bold text-[#EF4444]">
                {receipts.length}
              </span>
            </div>

            <div className="divide-y divide-[#E7EAF0]">
              {isLoading ? (
                <div className="py-12 text-center text-[12px] text-[#7B7B9D]">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-[#7B7B9D]" />
                    <span>Loading pending receipts...</span>
                  </div>
                </div>
              ) : receipts.length === 0 ? (
                <div className="py-12 text-center text-[12px] text-[#7B7B9D]">
                  <Check className="mx-auto mb-2 h-8 w-8 text-[#10B981]" />
                  <p className="font-semibold text-[#0F1020]">
                    No pending receipts
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#747B93]">
                    All delivered orders have been confirmed and signed off.
                  </p>
                </div>
              ) : (
                receipts.map((receipt) => (
                  <div
                    key={receipt.orderId}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#F9FAFC] transition-colors"
                  >
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B7B9D]">
                        {formatDelivered(receipt.deliveredAt || receipt.orderDate)}
                      </div>
                      <div className="mt-1 text-[15px] font-extrabold tracking-[-0.04em] text-[#0F1020]">
                        {receipt.orderId}
                      </div>
                      <div className="mt-1 text-[10px] text-[#7B7B9D]">
                        Driver: {receipt.driverName}
                        {receipt.recipientName
                          ? ` · Signed by: ${receipt.recipientName}`
                          : ""}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="min-h-[28px] px-2.5 py-1 text-[9px] font-semibold"
                        onClick={() => setReviewReceipt(receipt)}
                      >
                        Review
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        className="min-h-[30px] px-3 py-1.5 text-[10px] font-bold"
                        onClick={() => setConfirmReceipt(receipt)}
                      >
                        Confirm
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sign-off confirmation modal */}
      {confirmReceipt && (
        <ConfirmReceiptModal
          receipt={confirmReceipt}
          onClose={() => setConfirmReceipt(null)}
          onSuccess={() => {
            handleRefresh();
          }}
        />
      )}

      {/* Review details modal */}
      {reviewReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setReviewReceipt(null);
          }}
        >
          <div className="relative w-full max-w-[480px] rounded-[22px] bg-white p-7 sm:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.18)]">
            <button
              type="button"
              onClick={() => setReviewReceipt(null)}
              className="absolute right-6 top-6 text-[#7B7B9D] hover:text-[#0F1020] transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#EEF4FF]">
              <FileText className="h-5 w-5 text-[#2463EB]" />
            </div>

            <h2 className="text-[20px] font-extrabold tracking-[-0.03em] text-[#0F1020]">
              Delivery details
            </h2>
            <p className="mt-1 text-[12px] leading-[1.6] text-[#747B93]">
              Proof of delivery for{" "}
              <span className="font-bold text-[#0F1020]">
                {reviewReceipt.orderId}
              </span>
            </p>

            <div className="mt-5 space-y-3 rounded-[12px] border border-black/[0.06] bg-[#F9FAFC] p-4 text-[12px]">
              <div className="flex justify-between">
                <span className="text-[#7B7B9D]">Delivered at:</span>
                <span className="font-medium text-[#0F1020]">
                  {formatDelivered(reviewReceipt.deliveredAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7B7B9D]">Driver name:</span>
                <span className="font-medium text-[#0F1020]">
                  {reviewReceipt.driverName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7B7B9D]">Recipient:</span>
                <span className="font-medium text-[#0F1020]">
                  {reviewReceipt.recipientName || "Store staff"}
                </span>
              </div>
              {reviewReceipt.driverNotes && (
                <div className="pt-2 border-t border-black/[0.06]">
                  <span className="block text-[#7B7B9D] mb-1">
                    Driver notes:
                  </span>
                  <p className="text-[#0F1020] italic">
                    &ldquo;{reviewReceipt.driverNotes}&rdquo;
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setReviewReceipt(null)}
                className="px-4 py-2 text-xs font-semibold"
              >
                Close
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  const target = reviewReceipt;
                  setReviewReceipt(null);
                  setConfirmReceipt(target);
                }}
                className="px-4 py-2 text-xs font-bold"
              >
                Sign off
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ReceiptsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#E9EDF3]">
          <RefreshCw className="h-6 w-6 animate-spin text-[#4B8EF5]" />
        </div>
      }
    >
      <ReceiptsContent />
    </Suspense>
  );
}
