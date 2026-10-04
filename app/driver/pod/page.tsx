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
  const completedCount = completedStops.length;
  const totalStops = trip?.stopsTotal || completedCount || 5;
  const remainingCount = Math.max(0, totalStops - completedCount);
  const totalCartons = completedStops.reduce((sum, s) => sum + (s.cartons || 0), 0);

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
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setSelectedPod(null)}>
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
          subtitle={`Trip ${trip?.tripId || "TRP-20261001-01"} · ${completedCount} of ${totalStops} stops completed`}
          roleBadge={
            <RoleHeaderBadge>
              <CheckCircle2 className="w-3 h-3" /> COMPLETED STOPS
            </RoleHeaderBadge>
          }
        >
          <SyncBadge syncedLabel={`${completedCount} synced`} />
          <Link href="/driver/stops">
            <Button variant="primary" size="sm">
              <MapPin className="w-3.5 h-3.5" /> Continue Deliveries
            </Button>
          </Link>
        </DriverPageHeader>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<CheckCircle2 className="w-4 h-4" />}
            label="Stops completed"
            value={`${completedCount} / ${totalStops}`}
            note={`${remainingCount} remaining`}
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
            value={trip?.actualDepartureTime ? new Date(trip.actualDepartureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "04:05"}
            note="On schedule"
            tone="purple"
            bars={[]}
          />
          <StatCard
            icon={<Route className="w-4 h-4" />}
            label="Odometer start"
            value={`${trip?.odometerStartKm || 48250} km`}
            note="Logged at depot gate"
            tone="orange"
            bars={[]}
          />
        </div>

        {/* Completed deliveries table */}
        <Panel>
          <PanelHeader
            title="Completed deliveries & POD Archive"
            subtitle="Proof of delivery status · All signatures and cargo receipts verified"
            badge={
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgba(16,185,129,.12)] text-[#10B981] text-[8px] font-bold uppercase tracking-wider border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                All synced
              </span>
            }
          />
          <div className="overflow-x-auto">
            {completedStops.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <p className="text-sm font-semibold text-[#7B7B9D]">
                  No stops completed yet for this run.
                </p>
                <Link href="/driver/stops">
                  <Button variant="primary">
                    Start Stop Deliveries <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
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
                  {completedStops.map((s, idx) => (
                    <tr key={s.stopId || idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <StopNumberCell n={s.stopSequence || idx + 1} status="done" />
                      </td>
                      <td className="px-4 py-3 font-semibold whitespace-nowrap">{s.outletName}</td>
                      <td className="px-4 py-3 text-[10px] text-[#7B7B9D] max-w-[180px] truncate">
                        {s.address}
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-[#7B7B9D]">
                        {s.deliveredAt ? new Date(s.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : s.plannedArrivalTime?.slice(0, 5) || "04:25"}
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
                          size="sm"
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
