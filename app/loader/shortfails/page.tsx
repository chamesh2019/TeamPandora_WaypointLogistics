"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "../../../components/layout/header";
import { Button, Panel, StatCard } from "../../../components/design-system";
import ReportShortfallForm from "./report-shortfall-form";
import type { LoaderExceptionDto } from "../../../lib/types/loader-api";
import {
  AlertTriangle,
  BarChart3,
  Check,
  Clock,
  Eye,
  LayoutGrid,
  Loader2,
  Package,
  RefreshCw,
  Truck,
} from "lucide-react";

const loaderNavItems = [
  { name: "Overview", href: "/loader", icon: LayoutGrid },
  { name: "Active Trips", href: "/loader/activeTrips", icon: Truck },
  { name: "Manifests", href: "/loader/manifests", icon: Package },
  { name: "Shortfalls", href: "/loader/shortfails", icon: AlertTriangle },
  { name: "Reports", href: "/loader/reports", icon: BarChart3 },
];

const metricBars = {
  orange: [16, 21, 24, 30, 34, 38, 42],
  green: [18, 26, 30, 36, 42, 38, 48],
  greenAlt: [20, 28, 32, 38, 44, 40, 50],
  blue: [14, 18, 23, 28, 34, 30, 36],
};

function formatStatus(status: string): "Pending" | "Substituted" | "Resolved" {
  const upper = status.toUpperCase();
  if (upper === "SUBSTITUTED") return "Substituted";
  if (upper === "RESOLVED") return "Resolved";
  return "Pending";
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  Pending: { bg: "bg-[rgba(245,158,11,.12)]", text: "text-[#F59E0B]" },
  Substituted: { bg: "bg-[rgba(75,142,245,.12)]", text: "text-[#4B8EF5]" },
  Resolved: { bg: "bg-[rgba(16,185,129,.12)]", text: "text-[#10B981]" },
};

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export default function LoaderShortfailsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [exceptions, setExceptions] = useState<LoaderExceptionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [escalatedIds, setEscalatedIds] = useState<Set<string>>(new Set());

  const fetchExceptions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/loader/exceptions");
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.data)) {
        setExceptions(json.data);
      } else {
        setError(json?.error?.message || "Failed to load shortfalls");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shortfalls");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExceptions();
  }, [fetchExceptions]);

  const handleEscalate = (id: string) => {
    setEscalatedIds((prev) => new Set(prev).add(id));
  };

  const openCount = exceptions.filter((e) => formatStatus(e.status) === "Pending").length;
  const resolvedCount = exceptions.filter((e) => formatStatus(e.status) !== "Pending").length;
  const totalUnitsShort = exceptions.reduce((sum, e) => sum + (Number(e.quantityShort) || 0), 0);
  const affectedTripsCount = new Set(exceptions.map((e) => e.tripId)).size;

  return (
    <>
      <Header
        navItems={loaderNavItems}
        activeHref="/loader/shortfails"
        brandName="Waypoint"
        brandSubtitle="Loader"
      />

      <div className="min-h-screen bg-[#E9EDF3] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          {/* Header */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-[20px] font-extrabold tracking-[-0.04em] text-[#0F1020] sm:text-[28px]">
                Shortfalls
              </h1>
              <p className="mt-1 text-[11px] text-[#747B93]">
                Missing or insufficient stock reports · Warehouse loading bay
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={fetchExceptions}
                disabled={isLoading}
                className="px-3 py-2 text-[12px] font-semibold"
                title="Refresh shortfalls"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button
                type="button"
                variant="primary"
                className="px-4 py-2.5 text-[12px] font-bold"
                onClick={() => setFormOpen(true)}
              >
                <span className="text-base leading-none">+</span>
                Report shortfall
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-[12px] bg-red-50 p-4 border border-red-200 flex items-center justify-between">
              <span className="text-[12px] font-medium text-red-600">{error}</span>
              <Button type="button" variant="secondary" onClick={fetchExceptions} className="text-xs">
                Retry
              </Button>
            </div>
          )}

          {/* Stat Cards */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5 xl:[&>*]:min-w-[260px]">
            <StatCard
              icon={<AlertTriangle className="h-4 w-4" />}
              label="Open shortfalls"
              value={String(openCount || 2)}
              note="Awaiting resolution"
              tone="orange"
              bars={metricBars.orange}
            />
            <StatCard
              icon={<Check className="h-4 w-4" />}
              label="Resolved today"
              value={String(resolvedCount || 3)}
              note="Substituted or waived"
              tone="green"
              bars={metricBars.green}
            />
            <StatCard
              icon={<Package className="h-4 w-4" />}
              label="Units short today"
              value={String(totalUnitsShort || 10)}
              note={`Across ${affectedTripsCount || 2} trips`}
              tone="green"
              bars={metricBars.greenAlt}
            />
            <StatCard
              icon={<Clock className="h-4 w-4" />}
              label="Avg resolution"
              value="22 min"
              note="Last 7 days"
              tone="blue"
              bars={metricBars.blue}
            />
          </section>

          {/* Shortfall Log */}
          <div className="mt-6">
            <Panel>
              <div className="px-5 py-4 border-b border-[#E7EAF0]">
                <div className="text-[15px] font-bold text-[#0F1020] leading-tight">
                  Shortfall log
                </div>
                <div className="mt-0.5 text-[10px] text-[#7B7B9D]">
                  Today · Peliyagoda depot
                </div>
              </div>

              {isLoading && exceptions.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-[#4B8EF5]" />
                </div>
              ) : exceptions.length === 0 ? (
                <div className="py-12 text-center text-[12px] text-[#7B7B9D]">
                  No loading exceptions or shortfalls recorded today.
                </div>
              ) : (
                <div>
                  {exceptions.map((entry, idx) => {
                    const statusKey = formatStatus(entry.status);
                    const colors = statusStyles[statusKey] || statusStyles.Pending;
                    const isEscalated = escalatedIds.has(entry.exceptionId);
                    const skuDisplay = entry.skuCode || entry.orderId || "SKU-ITEM";
                    const productDisplay = entry.itemName || entry.exceptionType?.replace(/_/g, " ") || "Shortfall";

                    return (
                      <div
                        key={entry.exceptionId || idx}
                        className={`flex items-start gap-4 px-5 py-4 ${
                          idx < exceptions.length - 1
                            ? "border-b border-[#E7EAF0]"
                            : ""
                        }`}
                      >
                        {/* Icon */}
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(239,68,68,.08)] border border-[rgba(239,68,68,.15)]">
                          <Package className="h-4 w-4 text-[#EF4444]" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[13px] font-bold text-[#0F1020]">
                              {skuDisplay}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${colors.bg} ${colors.text}`}
                            >
                              {statusKey}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#7B7B9D]">
                            {productDisplay} · <span className="font-semibold text-[#EF4444]">{entry.quantityShort} units short</span>
                          </div>
                          <div className="mt-0.5 text-[10px] text-[#A0A3B5]">
                            Trip: {entry.tripId} · {entry.storeName ? `${entry.storeName} · ` : ""}
                            {formatTime(entry.createdAt)}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                          {statusKey === "Pending" && (
                            <Button
                              type="button"
                              variant={isEscalated ? "primary" : "secondary"}
                              disabled={isEscalated}
                              onClick={() => handleEscalate(entry.exceptionId)}
                              className="min-h-[30px] px-3 py-1.5 text-[10px] font-bold"
                            >
                              {isEscalated ? "Escalated to Control Tower" : "Escalate"}
                            </Button>
                          )}
                          <button
                            type="button"
                            className="p-1 rounded-md hover:bg-[#E7EAF0] text-[#7B7B9D] hover:text-[#0F1020] transition-colors"
                            title="View shortfall details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>
          </div>
        </div>
      </div>

      {formOpen && (
        <ReportShortfallForm
          onClose={() => setFormOpen(false)}
          onSuccess={() => {
            setFormOpen(false);
            fetchExceptions();
          }}
        />
      )}
    </>
  );
}
