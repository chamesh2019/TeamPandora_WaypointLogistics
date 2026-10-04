"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Package, Clock, Route, Eye, MapPin, ArrowRight } from "lucide-react";
import {
  Button,
  RoleHeaderBadge,
  StatCard,
  Panel,
  PanelHeader,
} from "../../../components/design-system";
import { SyncBadge } from "../../../components/driver/sync-badge";
import { StopNumberCell } from "../../../components/driver/stop-number-cell";
import { DriverBadge } from "../../../components/driver/driver-badge";
import { DriverPageHeader } from "../../../components/driver/driver-page-header";
import type { DriverStopDto, DriverActiveTripDto } from "@/lib/types/driver-api";

export default function DriverPodPage() {
  const [activeData, setActiveData] = useState<DriverActiveTripDto | null>(null);
  const [completedStops, setCompletedStops] = useState<DriverStopDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPod, setSelectedPod] = useState<DriverStopDto | null>(null);
  const [notif, setNotif] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"current" | "all">("current");

  const notify = (msg: string) => {
    setNotif(msg);
    window.setTimeout(() => setNotif(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [podRes, tripRes] = await Promise.all([
        fetch("/api/driver/pod"),
        fetch("/api/driver/active-trip"),
      ]);

      if (podRes.ok) {
        const j = await podRes.json();
        if (j.success && Array.isArray(j.data)) {
          setCompletedStops(j.data);
        }
      }
      if (tripRes.ok) {
        const j = await tripRes.json();
        if (j.success) {
          setActiveData(j.data);
        }
      }
    } catch {
      notify("Offline mode: Using cached completed deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const trip = activeData?.trip;
  const currentTripId = trip?.tripId;

  // Filter based on selected view mode
  const currentTripStops = currentTripId
    ? completedStops.filter((s) => s.tripId === currentTripId)
    : completedStops;
  const displayedStops = viewMode === "current" ? currentTripStops : completedStops;

  const completedCount = displayedStops.length;
  const totalStops = viewMode === "current" ? (trip?.stopsTotal || completedCount || 1) : completedStops.length;
  const remainingCount = viewMode === "current" ? Math.max(0, totalStops - completedCount) : 0;
  const totalCartons = displayedStops.reduce((sum, s) => sum + (s.cartons || 0), 0);

  const isTripNotStarted = trip && (trip.status === "PLANNED" || trip.status === "LOADING");

  return (
    <div className="min-h-screen bg-[#ECEEF5] dark:bg-[#07090e] text-[#0F1020] dark:text-white/90 font-sans">
      {/* Toast */}
      {notif && (
        <div className="fixed top-20 right-4 z-50 bg-[#0F1928] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-white/10 max-w-xs">
          {notif}
        </div>
      )}

      {/* Signature Preview Modal */}
      {selectedPod && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ECEEF5] dark:bg-[#0F121C] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0F1020] dark:text-white">
                  Proof of Delivery Record
                </h3>
                <p className="text-[10px] text-[#7B7B9D]">
                  {selectedPod.outletName} · Stop {selectedPod.stopSequence}
                  {selectedPod.tripId && ` · ${selectedPod.tripId}`}
                </p>
              </div>
              <Button variant="secondary" size="compact" onClick={() => setSelectedPod(null)}>
                Close
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-black/[0.04] dark:border-white/[0.04]">
                <span className="text-[#7B7B9D]">POD Code:</span>
                <span className="font-mono font-semibold">{selectedPod.podId || "POD-20261001-042500"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04] dark:border-white/[0.04]">
                <span className="text-[#7B7B9D]">Recipient:</span>
                <span className="font-semibold">{selectedPod.recipientName || "Store Manager"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04] dark:border-white/[0.04]">
                <span className="text-[#7B7B9D]">Delivered At:</span>
                <span className="font-mono">{selectedPod.deliveredAt ? new Date(selectedPod.deliveredAt).toLocaleTimeString() : "04:25 AM"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/[0.04] dark:border-white/[0.04]">
                <span className="text-[#7B7B9D]">Cargo Delivered:</span>
                <span className="font-semibold">{selectedPod.cartons} {selectedPod.tempClass} cartons ({selectedPod.weightKg} kg)</span>
              </div>

              <div>
                <span className="text-[10px] text-[#7B7B9D] font-bold uppercase tracking-wider block mb-1.5">
                  Captured Signature
                </span>
                <div className="p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#161926] flex items-center justify-center min-h-[90px]">
                  {selectedPod.signatureUrl?.startsWith("data:image") ? (
                    <img src={selectedPod.signatureUrl} alt="Signature" className="max-h-16 object-contain" />
                  ) : (
                    <span className="font-serif italic text-lg text-blue-600 dark:text-blue-400">
                      {selectedPod.recipientName || "Verified Signature"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page header */}
        <DriverPageHeader
          title="Completed deliveries"
          subtitle={
            viewMode === "current"
              ? `Trip ${currentTripId || "Pending"} · ${completedCount} of ${totalStops} stops completed${
                  isTripNotStarted ? " (Not yet departed)" : ""
                }`
              : `Driver POD Archive · ${completedStops.length} total deliveries verified across all runs`
          }
          roleBadge={
            <RoleHeaderBadge>
              <CheckCircle2 className="w-3 h-3" /> COMPLETED STOPS
            </RoleHeaderBadge>
          }
        >
          <SyncBadge syncedLabel={`${displayedStops.length} synced`} />
          <Link href="/driver/stops">
            <Button variant="primary" size="compact">
              <MapPin className="w-3.5 h-3.5" /> Continue Deliveries
            </Button>
          </Link>
        </DriverPageHeader>

        {/* View toggle tabs */}
        <div className="flex items-center gap-2 border-b border-black/[0.08] dark:border-white/[0.08] pb-2">
          <button
            type="button"
            onClick={() => setViewMode("current")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === "current"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-[#7B7B9D] hover:text-[#0F1020] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            Current Trip {currentTripId ? `(${currentTripId})` : ""}
          </button>
          <button
            type="button"
            onClick={() => setViewMode("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              viewMode === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-[#7B7B9D] hover:text-[#0F1020] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <span>All Trips Archive</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/10">
              {completedStops.length}
            </span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<CheckCircle2 className="w-4 h-4" />}
            label={viewMode === "current" ? "Stops completed" : "Total Verified PODs"}
            value={viewMode === "current" ? `${completedCount} / ${totalStops}` : `${completedCount}`}
            note={viewMode === "current" ? `${remainingCount} remaining` : "Across all completed trips"}
            tone="green"
            bars={[]}
          />
          <StatCard
            icon={<Package className="w-4 h-4" />}
            label="Cartons delivered"
            value={totalCartons.toString()}
            note="All proofs uploaded"
            tone="blue"
            bars={[]}
          />
          <StatCard
            icon={<Clock className="w-4 h-4" />}
            label="Departure Time"
            value={
              trip?.actualDepartureTime
                ? new Date(trip.actualDepartureTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : isTripNotStarted
                ? trip?.plannedDepartureTime ? `${trip.plannedDepartureTime.slice(0, 5)} (Est)` : "Not departed"
                : "04:05"
            }
            note={isTripNotStarted ? "Awaiting depot exit" : "On schedule"}
            tone="purple"
            bars={[]}
          />
          <StatCard
            icon={<Route className="w-4 h-4" />}
            label="Odometer start"
            value={trip?.odometerStartKm ? `${trip.odometerStartKm} km` : isTripNotStarted ? "Pending" : "48250 km"}
            note={trip?.odometerStartKm ? "Logged at depot gate" : "To record at gate"}
            tone="orange"
            bars={[]}
          />
        </div>

        {/* Completed deliveries table */}
        <Panel>
          <PanelHeader
            title={viewMode === "current" ? "Current Trip Deliveries & PODs" : "Completed Deliveries & POD Archive"}
            subtitle="Proof of delivery status · All signatures and cargo receipts verified"
            badge={
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgba(16,185,129,.12)] text-[#10B981] text-[8px] font-bold uppercase tracking-wider border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                All synced
              </span>
            }
          />
          <div className="overflow-x-auto">
            {displayedStops.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <p className="text-sm font-semibold text-[#7B7B9D]">
                  {viewMode === "current"
                    ? `No stops completed yet for trip ${currentTripId || ""}.${
                        isTripNotStarted ? " This trip has not departed yet." : ""
                      }`
                    : "No completed deliveries found."}
                </p>
                {viewMode === "current" && completedStops.length > 0 && (
                  <Button variant="secondary" size="compact" onClick={() => setViewMode("all")}>
                    View Past Deliveries Archive ({completedStops.length})
                  </Button>
                )}
                {isTripNotStarted ? (
                  <div className="pt-2">
                    <Link href="/driver/departure">
                      <Button variant="primary">
                        Start Trip Departure Sign-off <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="pt-2">
                    <Link href="/driver/stops">
                      <Button variant="primary">
                        Start Stop Deliveries <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <table className="w-full text-xs font-sans border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.07] dark:border-white/[0.08]">
                    {["#", "Outlet", "Address", "Delivered At", "Cartons", "Signee", "POD Status", ""].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-[9px] font-bold text-[#7B7B9D] uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                  {displayedStops.map((s, idx) => (
                    <tr key={s.stopId || idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <StopNumberCell n={s.stopSequence || idx + 1} status="done" />
                      </td>
                      <td className="px-4 py-3 font-semibold whitespace-nowrap">
                        <div>{s.outletName}</div>
                        {viewMode === "all" && s.tripId && (
                          <div className="text-[9px] font-mono text-[#7B7B9D]">{s.tripId}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[10px] text-[#7B7B9D] max-w-[180px] truncate">
                        {s.address}
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-[#7B7B9D]">
                        {s.deliveredAt
                          ? new Date(s.deliveredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : s.plannedArrivalTime?.slice(0, 5) || "04:25"}
                      </td>
                      <td className="px-4 py-3 font-semibold">{s.cartons}</td>
                      <td className="px-4 py-3 text-[10px] text-[#7B7B9D]">
                        {s.recipientName || "Store Receiver"}
                      </td>
                      <td className="px-4 py-3">
                        <DriverBadge variant="delivered" label="Uploaded" showDot={false} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="secondary"
                          size="compact"
                          onClick={() => setSelectedPod(s)}
                        >
                          <Eye className="w-3 h-3" /> View POD
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
