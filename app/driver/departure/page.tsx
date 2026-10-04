"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Truck, Gauge, CheckCircle2, ShieldCheck, ArrowRight, AlertTriangle, Clock } from "lucide-react";
import {
  Button,
  RoleHeaderBadge,
  StatCard,
  Panel,
  PanelHeader,
  Input,
  FieldLabel,
} from "../../../components/design-system";
import { DriverPageHeader } from "../../../components/driver/driver-page-header";
import { DriverBadge } from "../../../components/driver/driver-badge";
import { useSession } from "@/lib/auth-client";
import type { DriverActiveTripDto } from "@/lib/types/driver-api";
import { OfflineStore } from "@/lib/offline/offline-store";

export default function DriverDeparturePage() {
  const { data: session } = useSession();
  const [activeData, setActiveData] = useState<DriverActiveTripDto | null>(() => {
    return OfflineStore.getCachedData<DriverActiveTripDto>(OfflineStore.KEYS.ACTIVE_TRIP);
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [odometer, setOdometer] = useState<number | string>(() => {
    const cached = OfflineStore.getCachedData<DriverActiveTripDto>(OfflineStore.KEYS.ACTIVE_TRIP);
    return cached?.trip?.odometerStartKm || "";
  });
  const [checks, setChecks] = useState({
    tires: true,
    reeferTemp: true,
    cargoSecured: true,
    sealIntact: true,
  });
  const [departed, setDeparted] = useState(() => {
    const cached = OfflineStore.getCachedData<DriverActiveTripDto>(OfflineStore.KEYS.ACTIVE_TRIP);
    return cached?.trip?.status === "IN_TRANSIT";
  });
  const [error, setError] = useState<string | null>(null);
  const [notif, setNotif] = useState<string | null>(null);

  const notify = (msg: string) => {
    setNotif(msg);
    window.setTimeout(() => setNotif(null), 3500);
  };

  useEffect(() => {
    fetchActiveTrip();
  }, []);

  const fetchActiveTrip = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/driver/active-trip");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setActiveData(json.data);
          OfflineStore.cacheData(OfflineStore.KEYS.ACTIVE_TRIP, json.data);
          if (json.data.trip?.odometerStartKm) {
            setOdometer(json.data.trip.odometerStartKm);
          }
          if (json.data.trip?.status === "IN_TRANSIT") {
            setDeparted(true);
          }
        }
      } else {
        const cached = OfflineStore.getCachedData<DriverActiveTripDto>(OfflineStore.KEYS.ACTIVE_TRIP);
        if (cached) {
          setActiveData(cached);
          notify("Offline mode: Using cached run sheet");
        }
      }
    } catch {
      const cached = OfflineStore.getCachedData<DriverActiveTripDto>(OfflineStore.KEYS.ACTIVE_TRIP);
      if (cached) {
        setActiveData(cached);
        notify("Offline mode: Using cached run sheet");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeparture = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const odoNum = Number(odometer);
    if (!odoNum || odoNum <= 0) {
      setError("Please enter a valid starting odometer reading (> 0 km).");
      return;
    }

    const tripId = activeData?.trip?.tripId || "TRP-20261001-01";
    const timestamp = new Date().toISOString();

    try {
      setSubmitting(true);
      const res = await fetch("/api/driver/departure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          odometerStartKm: odoNum,
          clientTimestamp: timestamp,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setDeparted(true);
        notify("Departure confirmed! Trip status updated to In Transit.");
      } else {
        // Enqueue offline action on server error
        OfflineStore.recordOfflineDeparture({
          tripId,
          odometerStartKm: odoNum,
          clientTimestamp: timestamp,
        });
        setDeparted(true);
        notify("Departure saved locally. Will sync automatically.");
      }
    } catch {
      OfflineStore.recordOfflineDeparture({
        tripId,
        odometerStartKm: odoNum,
        clientTimestamp: timestamp,
      });
      setDeparted(true);
      notify("Offline: Departure saved locally. Will sync automatically.");
    } finally {
      setSubmitting(false);
    }
  };

  const trip = activeData?.trip;
  const driverName = session?.user?.name || activeData?.driverName || "Driver";

  return (
    <div className="min-h-screen bg-[#ECEEF5] dark:bg-[#07090e] text-[#0F1020] dark:text-white/90 font-sans">
      {/* Toast */}
      {notif && (
        <div className="fixed top-20 right-4 z-50 bg-[#0F1928] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-white/10 max-w-xs">
          {notif}
        </div>
      )}

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <DriverPageHeader
          title="Trip Departure & Odometer Sign-off"
          subtitle={`Depot Gate Checkout · ${trip ? `Trip ${trip.tripId}` : "Assigned Trip"} · ${driverName}`}
          roleBadge={
            <RoleHeaderBadge>
              <Truck className="w-3 h-3" /> DEPARTURE CHECK
            </RoleHeaderBadge>
          }
        >
          <Link href="/driver">
            <Button variant="secondary" size="compact">
              Back to Run Sheet
            </Button>
          </Link>
        </DriverPageHeader>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Truck className="w-4 h-4" />}
            label="Assigned Vehicle"
            value={trip?.vehicleId || "VEH001"}
            note={`${trip?.vehicleType || "Truck"} · ${trip?.vehicleTemp || "Reefer"}`}
            tone="blue"
            bars={[]}
          />
          <StatCard
            icon={<Clock className="w-4 h-4" />}
            label="Planned Departure"
            value={trip?.plannedDepartureTime?.slice(0, 5) || "04:00"}
            note={trip?.depotName || "Peliyagoda CDC"}
            tone="purple"
            bars={[]}
          />
          <StatCard
            icon={<Gauge className="w-4 h-4" />}
            label="Cargo Staged"
            value={`${trip?.stopsTotal || 3} Stops`}
            note={`${trip?.totalWeightKg || 1520} kg · ${trip?.totalVolumeM3 || 8.4} m³`}
            tone="green"
            bars={[]}
          />
          <StatCard
            icon={<ShieldCheck className="w-4 h-4" />}
            label="Trip Status"
            value={departed ? "In Transit" : trip?.status || "Staging"}
            note={departed ? "Gate check cleared" : "Awaiting odometer sign-off"}
            tone={departed ? "green" : "orange"}
            bars={[]}
          />
        </div>

        {/* Main Content Form */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <Panel>
            <PanelHeader
              title="Pre-Departure Verification & Departure Form"
              subtitle="[FORM-DRV-01] Record vehicle odometer and verify pre-trip security before departure."
              badge={
                departed ? (
                  <DriverBadge variant="delivered" label="Departed" />
                ) : (
                  <DriverBadge variant="in-progress" label="Pending Gate Check" />
                )
              }
            />

            <div className="p-6 space-y-6">
              {departed ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      Vehicle Departure Confirmed
                    </h3>
                    <p className="text-xs text-[#7B7B9D] mt-1">
                      Starting odometer recorded at {odometer || 48250} km. All orders are marked In Transit.
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <Link href="/driver/stops">
                      <Button variant="primary" className="font-bold">
                        Navigate to Stop 1 <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                    <Link href="/driver">
                      <Button variant="secondary">View Full Run Sheet</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleDeparture} className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  {/* Checklist */}
                  <div className="space-y-3">
                    <FieldLabel>Pre-Departure Safety & Cargo Checklist</FieldLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: "tires", label: "Tire pressure & wheel nuts verified" },
                        { key: "reeferTemp", label: "Reefer pre-cooled to target temp (-2°C / 4°C)" },
                        { key: "cargoSecured", label: "LIFO cargo bars & straps locked" },
                        { key: "sealIntact", label: "Depot security gate seal checked" },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-start gap-3 p-3.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.01] dark:bg-white/[0.01] hover:bg-black/[0.02] cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={checks[item.key as keyof typeof checks]}
                            onChange={(e) =>
                              setChecks((prev) => ({
                                ...prev,
                                [item.key]: e.target.checked,
                              }))
                            }
                            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-medium text-[#0F1020] dark:text-white/80">
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Odometer Input */}
                  <div className="space-y-2">
                    <FieldLabel>Starting Vehicle Odometer (km) *</FieldLabel>
                    <div className="relative max-w-sm">
                      <Input
                        type="number"
                        placeholder="e.g. 48250"
                        value={odometer}
                        onChange={(e) => setOdometer(e.target.value)}
                        required
                        className="pl-9 font-mono font-semibold"
                      />
                      <Gauge className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7B7B9D]" />
                    </div>
                    <p className="text-[10px] text-[#7B7B9D]">
                      Must match the physical dashboard reading before exiting the security gate.
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="default"
                      disabled={submitting}
                      className="font-bold tracking-wide w-full sm:w-auto"
                    >
                      {submitting ? "Confirming Departure…" : "Confirm Departure & Start Route"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Panel>

          {/* Sidebar */}
          <div className="space-y-6">
            <Panel>
              <PanelHeader title="Vehicle & Trip Info" />
              <div className="p-5 space-y-3 text-xs">
                {[
                  ["Trip ID", trip?.tripId || "TRP-20261001-01"],
                  ["Vehicle", `${trip?.vehicleId || "VEH001"} · ${trip?.vehicleType || "Truck"}`],
                  ["Driver", driverName],
                  ["Origin Depot", trip?.depotName || "Peliyagoda CDC"],
                  ["Target District", trip?.districtId || "Colombo"],
                  ["Scheduled Departure", trip?.plannedDepartureTime?.slice(0, 5) || "04:00 AM"],
                  ["Estimated Return", trip?.plannedReturnTime?.slice(0, 5) || "08:30 AM"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center py-1.5 border-b border-black/[0.04] dark:border-white/[0.04] last:border-0">
                    <span className="text-[#7B7B9D]">{k}</span>
                    <span className="font-semibold text-[#0F1020] dark:text-white">{v}</span>
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
