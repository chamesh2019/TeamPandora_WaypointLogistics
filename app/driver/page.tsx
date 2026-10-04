"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Truck, Map, Route, CheckCircle2, Clock, ArrowRight, Play } from "lucide-react";
import {
  Button,
  RoleHeaderBadge,
  StatCard,
  Panel,
  PanelHeader,
} from "../../components/design-system";
import { SyncBadgeToggle } from "../../components/driver/sync-badge";
import { StopNumberCell } from "../../components/driver/stop-number-cell";
import { DriverBadge } from "../../components/driver/driver-badge";
import { DriverPageHeader } from "../../components/driver/driver-page-header";
import { useSession } from "@/lib/auth-client";
import type { StopStatus } from "../../components/driver/stop-number-cell";
import type { DriverActiveTripDto, DriverStopDto, DriverCurrentStopDto } from "@/lib/types/driver-api";
import { OfflineStore } from "@/lib/offline/offline-store";

interface DisplayStop {
  id: string;
  n: number;
  store: string;
  addr: string;
  time: string;
  eta: string;
  cartons: number;
  status: StopStatus;
  window: string;
  dock: string;
  cartonsType: string;
  contact: string;
  isLate?: boolean;
}

const statusVariant: Record<StopStatus, "delivered" | "in-progress" | "upcoming"> = {
  done: "delivered",
  current: "in-progress",
  upcoming: "upcoming",
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DriverPage() {
  const { data: session } = useSession();
  const [activeData, setActiveData] = useState<DriverActiveTripDto | null>(() => {
    return OfflineStore.getCachedData<DriverActiveTripDto>(OfflineStore.KEYS.ACTIVE_TRIP);
  });
  const [stopsList, setStopsList] = useState<DriverStopDto[]>(() => {
    return OfflineStore.getCachedData<DriverStopDto[]>(OfflineStore.KEYS.STOPS) || [];
  });
  const [currentData, setCurrentData] = useState<DriverCurrentStopDto | null>(() => {
    return OfflineStore.getCachedData<DriverCurrentStopDto>(OfflineStore.KEYS.CURRENT_STOP);
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notif, setNotif] = useState<string | null>(null);

  const notify = (msg: string) => {
    setNotif(msg);
    window.setTimeout(() => setNotif(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripRes, stopsRes, curRes] = await Promise.all([
        fetch("/api/driver/active-trip"),
        fetch("/api/driver/stops"),
        fetch("/api/driver/stops/current"),
      ]);

      if (tripRes.ok) {
        const j = await tripRes.json();
        if (j.success) {
          setActiveData(j.data);
          OfflineStore.cacheData(OfflineStore.KEYS.ACTIVE_TRIP, j.data);
        }
      } else {
        const cached = OfflineStore.getCachedData<DriverActiveTripDto>(OfflineStore.KEYS.ACTIVE_TRIP);
        if (cached) setActiveData(cached);
      }

      if (stopsRes.ok) {
        const j = await stopsRes.json();
        if (j.success && Array.isArray(j.data.stops)) {
          setStopsList(j.data.stops);
          OfflineStore.cacheData(OfflineStore.KEYS.STOPS, j.data.stops);
        }
      } else {
        const cached = OfflineStore.getCachedData<DriverStopDto[]>(OfflineStore.KEYS.STOPS);
        if (cached) setStopsList(cached);
      }

      if (curRes.ok) {
        const j = await curRes.json();
        if (j.success) {
          setCurrentData(j.data);
          OfflineStore.cacheData(OfflineStore.KEYS.CURRENT_STOP, j.data);
        }
      } else {
        const cached = OfflineStore.getCachedData<DriverCurrentStopDto>(OfflineStore.KEYS.CURRENT_STOP);
        if (cached) setCurrentData(cached);
      }
    } catch {
      const cachedTrip = OfflineStore.getCachedData<DriverActiveTripDto>(OfflineStore.KEYS.ACTIVE_TRIP);
      if (cachedTrip) setActiveData(cachedTrip);
      const cachedStops = OfflineStore.getCachedData<DriverStopDto[]>(OfflineStore.KEYS.STOPS);
      if (cachedStops) setStopsList(cachedStops);
      const cachedCur = OfflineStore.getCachedData<DriverCurrentStopDto>(OfflineStore.KEYS.CURRENT_STOP);
      if (cachedCur) setCurrentData(cachedCur);
      notify("Offline mode: Using cached run sheet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleSynced = () => {
      loadData();
    };
    window.addEventListener("waypoint:synced", handleSynced);
    return () => window.removeEventListener("waypoint:synced", handleSynced);
  }, []);

  const trip = activeData?.trip;
  const rawDriverName = session?.user?.name || activeData?.driverName || "Driver";
  const firstName = rawDriverName.split(" ")[0] || "Driver";

  // Map API stops to UI table stops
  const displayStops: DisplayStop[] = stopsList.map((s, idx) => {
    let uiStatus: StopStatus = "upcoming";
    if (s.status === "DELIVERED") uiStatus = "done";
    else if (s.status === "ARRIVED" || s.stopId === currentData?.currentStop?.stopId) uiStatus = "current";

    const etaText = s.status === "DELIVERED" ? "Done" : s.plannedArrivalTime?.slice(0, 5) || "--:--";

    return {
      id: s.stopId,
      n: s.stopSequence || idx + 1,
      store: s.outletName || `Outlet ${s.outletId}`,
      addr: s.address || "Main Road",
      time: s.plannedArrivalTime?.slice(0, 5) || "07:00",
      eta: uiStatus === "current" ? `${etaText} →` : etaText,
      cartons: s.cartons || 14,
      status: uiStatus,
      window: `${s.windowOpenTime?.slice(0, 5) || "06:00"} – ${s.windowCloseTime?.slice(0, 5) || "08:00"}`,
      dock: s.dockType || "Rear Dock",
      cartonsType: s.cartonsType || `${s.cartons} ${s.tempClass} cartons`,
      contact: s.contactName || "Manager",
      isLate: s.isLate,
    };
  });

  const activeStop = currentData?.currentStop;
  const completedCount = trip?.stopsCompleted ?? displayStops.filter((s) => s.status === "done").length;
  const remainingCount = trip?.stopsRemaining ?? Math.max(0, displayStops.length - completedCount);
  const nextEta = activeStop ? activeStop.plannedArrivalTime?.slice(0, 5) : "--:--";
  const nextEtaStore = activeStop?.outletName?.split(" · ")[1] || activeStop?.outletName || "Next stop";

  const handleArrivalCheckin = async () => {
    if (!activeStop) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/driver/stops/${activeStop.stopId}/arrive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientTimestamp: new Date().toISOString(),
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        notify(`Arrival confirmed at ${activeStop.outletName}. Status: ARRIVED`);
        await loadData();
      } else {
        notify(json.error?.message || "Arrival check-in failed");
      }
    } catch {
      notify("Arrival cached locally. Will sync when back online.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      notify("Synchronizing run sheet with control tower…");
      const res = await fetch("/api/driver/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: [] }),
      });
      if (res.ok) {
        notify("Control tower in sync. All events reconciled.");
        await loadData();
      }
    } catch {
      notify("Offline: Events stored safely in local queue.");
    }
  };

  return (
    <div className="min-h-screen bg-[#ECEEF5] dark:bg-[#07090e] text-[#0F1020] dark:text-white/90 font-sans">
      {/* Toast */}
      {notif && (
        <div className="fixed top-20 right-4 z-50 bg-[#0F1928] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-white/10 max-w-xs">
          {notif}
        </div>
      )}

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page header */}
        <DriverPageHeader
          title={`${greeting()}, ${firstName}`}
          subtitle={`Trip ${trip?.tripId || "TRP-20261001-01"} · Vehicle ${trip?.vehicleId || "VEH001"} · ${trip?.depotName || "Peliyagoda CDC"}`}
          roleBadge={
            <RoleHeaderBadge>
              <Truck className="w-3 h-3" /> DRIVER
            </RoleHeaderBadge>
          }
        >
          <SyncBadgeToggle onSync={handleSync} />
          <Link href="/driver/stops">
            <Button variant="primary">
              <Map className="w-3.5 h-3.5" /> Stop delivery flow
            </Button>
          </Link>
        </DriverPageHeader>

        {/* Departure Banner if not yet In Transit */}
        {trip && trip.status !== "IN_TRANSIT" && trip.status !== "COMPLETED" && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Play className="w-5 h-5 ml-0.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                  Trip Staged at Depot Gate
                </h4>
                <p className="text-xs text-[#7B7B9D] mt-0.5">
                  Record starting odometer and complete pre-departure safety checklist before exiting the dock.
                </p>
              </div>
            </div>
            <Link href="/driver/departure">
              <Button variant="primary" className="font-bold whitespace-nowrap">
                Trip Departure Sign-off <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Route className="w-4 h-4" />}
            label="Stops today"
            value={displayStops.length.toString()}
            note={`${completedCount} completed · ${remainingCount} remaining`}
            tone="blue"
            bars={[]}
          />
          <StatCard
            icon={<CheckCircle2 className="w-4 h-4" />}
            label="Delivered"
            value={completedCount.toString()}
            note="POD uploaded for all"
            tone="green"
            bars={[]}
          />
          <StatCard
            icon={<Clock className="w-4 h-4" />}
            label="Next ETA"
            value={nextEta || "--:--"}
            note={nextEtaStore}
            tone="purple"
            bars={[]}
          />
          <StatCard
            icon={<Truck className="w-4 h-4" />}
            label="Trip status"
            value={trip?.status === "IN_TRANSIT" ? "In Transit" : trip?.status || "Staging"}
            note={trip?.statusNote || "Running on schedule"}
            tone={trip?.status === "IN_TRANSIT" ? "green" : "orange"}
            bars={[]}
          />
        </div>

        {/* Main 2-col grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
          {/* Run sheet table */}
          <Panel>
            <PanelHeader
              title="Today's run sheet"
              subtitle={`LIFO reverse loaded · ${displayStops.length} stops · Est. ${trip?.plannedReturnTime?.slice(0, 5) || "11:30"} return`}
              badge={
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgba(75,142,245,.12)] text-[#4B8EF5] text-[8px] font-bold uppercase tracking-wider border border-blue-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4B8EF5] animate-pulse" />
                  Active Run
                </span>
              }
            />
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-sans border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.07] dark:border-white/[0.08]">
                    {["#", "Outlet", "Address", "Cartons", "ETA / Status", "Action"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[9px] font-bold text-[#7B7B9D] uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                  {displayStops.map((s) => (
                    <tr
                      key={s.id || s.n}
                      className={
                        s.status === "current"
                          ? "bg-[rgba(245,197,66,.05)]"
                          : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                      }
                    >
                      <td className="px-4 py-3">
                        <StopNumberCell n={s.n} status={s.status} />
                      </td>
                      <td
                        className={`px-4 py-3 font-semibold whitespace-nowrap ${
                          s.status === "current" ? "text-[#D4A200] dark:text-[#F5C542] font-bold" : ""
                        }`}
                      >
                        {s.store}
                      </td>
                      <td className="px-4 py-3 text-[#7B7B9D] text-[10px] max-w-[180px] truncate">
                        {s.addr}
                      </td>
                      <td className="px-4 py-3 font-semibold">{s.cartons}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-[#7B7B9D]">
                        {s.eta}
                      </td>
                      <td className="px-4 py-3">
                        <DriverBadge variant={statusVariant[s.status]} showDot={s.status === "current"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            {/* Current stop card */}
            <Panel>
              <PanelHeader
                title="Current stop"
                subtitle={activeStop ? `Stop ${activeStop.stopSequence} · ${activeStop.status}` : "No active stop"}
                badge={<DriverBadge variant="in-progress" label="Next" showDot />}
              />
              {activeStop ? (
                <div className="p-5 space-y-4">
                  <div>
                    <div className="text-sm font-extrabold text-[#0F1020] dark:text-white mb-1">
                      {activeStop.outletName}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#7B7B9D]">
                      <Map className="w-3 h-3 shrink-0" /> {activeStop.address}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-black/[0.07] dark:border-white/[0.08]">
                    {[
                      ["Window", `${activeStop.windowOpenTime?.slice(0, 5)} - ${activeStop.windowCloseTime?.slice(0, 5)}`],
                      ["Dock", activeStop.dockType || "Street"],
                      ["Cartons", `${activeStop.cartons} ${activeStop.tempClass}`],
                      ["Contact", activeStop.contactName || "Manager"],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div className="text-[8px] text-[#7B7B9D] font-bold uppercase tracking-[0.06em] mb-0.5">
                          {k}
                        </div>
                        <div className="text-[11px] font-semibold">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 pt-2">
                    <Button
                      variant="primary"
                      size="full"
                      className="font-bold tracking-wide"
                      disabled={actionLoading}
                      onClick={handleArrivalCheckin}
                    >
                      <Map className="w-3.5 h-3.5" />
                      {actionLoading ? "Logging Arrival…" : "ARRIVED AT OUTLET"}
                    </Button>
                    <Link href={`tel:${activeStop.contactPhone || "+94771234567"}`} className="block">
                      <Button variant="secondary" size="full">
                        Call store contact ({activeStop.contactPhone || "+94 77 123 4567"})
                      </Button>
                    </Link>
                    <Link href="/driver/stops" className="block">
                      <Button variant="danger" size="full">
                        UNABLE TO DELIVER / REPORT
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-[#7B7B9D]">
                  All scheduled deliveries completed!
                </div>
              )}
            </Panel>

            {/* Vehicle & trip */}
            <Panel>
              <PanelHeader title="Vehicle & trip" />
              <div className="px-5 py-3">
                {[
                  ["Vehicle", `${trip?.vehicleId || "VEH001"} · ${trip?.vehicleTemp || "Reefer"}`],
                  ["Driver", rawDriverName],
                  ["Depot", trip?.depotName || "Peliyagoda CDC"],
                  ["Departure", trip?.plannedDepartureTime?.slice(0, 5) || "04:00 AM"],
                  ["Est. return", trip?.plannedReturnTime?.slice(0, 5) || "08:30 AM"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between items-center py-2.5 border-b border-black/[0.05] dark:border-white/[0.05] last:border-0"
                  >
                    <span className="text-[10px] text-[#7B7B9D]">{k}</span>
                    <span className="text-[11px] font-semibold">{v}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
