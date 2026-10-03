"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Header from "../../../components/layout/header";
import { Button, Panel, StatCard } from "../../../components/design-system";
import type { LoaderTripSummary } from "../../../lib/types/loader-api";
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
  blue: [22, 34, 28, 36, 42, 48, 54],
  green: [18, 26, 30, 36, 42, 38, 48],
  purple: [14, 18, 23, 28, 34, 30, 36],
  orange: [16, 21, 24, 30, 34, 32, 28],
};

const statusColors: Record<string, { bg: string; text: string }> = {
  Loading: { bg: "bg-[rgba(245,158,11,.12)]", text: "text-[#F59E0B]" },
  Ready: { bg: "bg-[rgba(16,185,129,.12)]", text: "text-[#10B981]" },
  Complete: { bg: "bg-[rgba(16,185,129,.12)]", text: "text-[#10B981]" },
  Staging: { bg: "bg-[rgba(75,142,245,.12)]", text: "text-[#4B8EF5]" },
  Pending: { bg: "bg-[rgba(239,68,68,.12)]", text: "text-[#EF4444]" },
};

const progressColors: Record<string, string> = {
  Loading: "bg-[#F59E0B]",
  Ready: "bg-[#10B981]",
  Complete: "bg-[#10B981]",
  Staging: "bg-[#4B8EF5]",
  Pending: "bg-[#D1D5DB]",
};

export default function LoaderActiveTripsPage() {
  const [trips, setTrips] = useState<LoaderTripSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/loader/trips");
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.data)) {
        setTrips(json.data);
      } else {
        setError(json?.error?.message || "Failed to load active trips");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load active trips");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const totalTripsCount = trips.length;
  const loadingCount = trips.filter((t) => t.status === "Loading").length;
  const pendingCount = trips.filter((t) => t.status === "Pending" || t.status === "Staging").length;
  const readyCount = trips.filter((t) => t.status === "Ready" || t.status === "Complete" || t.progress >= 100).length;

  const totalCartons = trips.reduce((acc, t) => acc + (t.cartons || 0), 0);
  const totalStops = trips.reduce((acc, t) => acc + (t.stops || 0), 0);
  const firstDeparture = trips.length > 0 ? trips[0].departure : "03:30";
  const firstTripId = trips.length > 0 ? trips[0].tripId : "TRP-250614-01";
  const readyTripId = trips.find((t) => t.status === "Ready" || t.status === "Complete")?.tripId || firstTripId;

  return (
    <>
      <Header
        navItems={loaderNavItems}
        activeHref="/loader/activeTrips"
        brandName="Waypoint"
        brandSubtitle="Loader"
      />

      <div className="min-h-screen bg-[#E9EDF3] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-[20px] font-extrabold tracking-[-0.04em] text-[#0F1020] sm:text-[28px]">
                Active trips
              </h1>
              <p className="mt-1 text-[11px] text-[#747B93]">
                Today&apos;s loading schedule · Peliyagoda depot
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={fetchTrips}
              disabled={isLoading}
              className="px-3 py-2 text-[12px] font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {error && (
            <div className="mb-5 rounded-[12px] bg-red-50 p-4 border border-red-200 flex items-center justify-between">
              <span className="text-[12px] font-medium text-red-600">{error}</span>
              <Button type="button" variant="secondary" onClick={fetchTrips} className="text-xs">
                Retry
              </Button>
            </div>
          )}

          {/* Stat Cards */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5 xl:[&>*]:min-w-[260px]">
            <StatCard
              icon={<Truck className="h-4 w-4" />}
              label="Trips today"
              value={String(totalTripsCount || 3)}
              note={`${loadingCount} loading · ${pendingCount} pending`}
              tone="blue"
              bars={metricBars.blue}
            />
            <StatCard
              icon={<Package className="h-4 w-4" />}
              label="Cartons total"
              value={String(totalCartons || 340)}
              note={`Across ${totalStops || 30} stops`}
              tone="green"
              bars={metricBars.green}
            />
            <StatCard
              icon={<Clock className="h-4 w-4" />}
              label="First departure"
              value={firstDeparture}
              note={firstTripId}
              tone="purple"
              bars={metricBars.purple}
            />
            <StatCard
              icon={<Check className="h-4 w-4" />}
              label="Ready to depart"
              value={String(readyCount || 1)}
              note={readyTripId}
              tone="green"
              bars={metricBars.orange}
            />
          </section>

          {/* Trip Queue Table */}
          <div className="mt-6">
            <Panel>
              <div className="px-5 py-4 border-b border-[#E7EAF0]">
                <div className="text-[15px] font-bold text-[#0F1020] leading-tight">
                  Trip queue
                </div>
                <div className="mt-0.5 text-[10px] text-[#7B7B9D]">
                  Loading priority order · LIFO staging sequence
                </div>
              </div>

              {isLoading && trips.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-[#4B8EF5]" />
                </div>
              ) : trips.length === 0 ? (
                <div className="py-12 text-center text-[12px] text-[#7B7B9D]">
                  No active trips found for loading today.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E7EAF0]">
                        <th className="px-5 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7B7B9D]">
                          Trip ID
                        </th>
                        <th className="px-3 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7B7B9D]">
                          Vehicle
                        </th>
                        <th className="px-3 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7B7B9D]">
                          Driver
                        </th>
                        <th className="px-3 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7B7B9D]">
                          Stops
                        </th>
                        <th className="px-3 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7B7B9D]">
                          Progress
                        </th>
                        <th className="px-3 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7B7B9D]">
                          Departure
                        </th>
                        <th className="px-3 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7B7B9D]">
                          Status
                        </th>
                        <th className="px-3 py-3 text-right text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7B7B9D]">
                          Manifest
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {trips.map((trip) => {
                        const pct = Math.min(100, Math.max(0, trip.progress || 0));
                        const colors = statusColors[trip.status] || {
                          bg: "bg-[rgba(15,16,32,.08)]",
                          text: "text-[#0F1020]",
                        };
                        const barColor = progressColors[trip.status] || "bg-[#4B8EF5]";
                        const completedStops = Math.round((pct / 100) * (trip.stops || 1));

                        return (
                          <tr
                            key={trip.tripId}
                            className="border-b border-[#E7EAF0] last:border-b-0 hover:bg-[#F5F6FB] transition-colors"
                          >
                            <td className="px-5 py-3.5 text-[11px] font-semibold text-[#0F1020]">
                              <div>{trip.tripId}</div>
                              <div className="text-[10px] text-[#7B7B9D] font-normal">{trip.route}</div>
                            </td>
                            <td className="px-3 py-3.5 text-[11px] text-[#7B7B9D]">
                              <div className="font-medium text-[#0F1020]">{trip.vehicleId}</div>
                              <div className="text-[10px]">{trip.vehicleType || "Truck"}</div>
                            </td>
                            <td className="px-3 py-3.5 text-[11px] font-bold text-[#0F1020]">
                              {trip.driver}
                            </td>
                            <td className="px-3 py-3.5 text-[11px] text-[#7B7B9D]">
                              <div>{trip.stops} stops</div>
                              <div className="text-[10px]">{trip.cartons} cartons</div>
                            </td>
                            <td className="px-3 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="h-[6px] w-20 rounded-full bg-[#E7EAF0] overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${barColor}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-semibold text-[#0F1020]">
                                  {completedStops}/{trip.stops}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3.5 text-[11px] text-[#7B7B9D]">
                              {trip.departure}
                            </td>
                            <td className="px-3 py-3.5">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${colors.bg} ${colors.text}`}
                              >
                                {trip.status}
                              </span>
                            </td>
                            <td className="px-3 py-3.5 text-right">
                              <Link
                                href={`/loader/manifests?tripId=${encodeURIComponent(trip.tripId)}`}
                                className="inline-flex p-1.5 rounded-md hover:bg-[#E7EAF0] text-[#7B7B9D] hover:text-[#0F1020] transition-colors"
                                title="View LIFO Manifest"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}
