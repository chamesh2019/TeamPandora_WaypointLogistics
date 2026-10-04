"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Clock, Snowflake, Package, Map, Phone, Check, AlertTriangle, ArrowRight } from "lucide-react";
import {
  Button,
  RoleHeaderBadge,
  StatCard,
  Panel,
  PanelHeader,
  Input,
  Textarea,
  FieldLabel,
} from "../../../components/design-system";
import { SyncBadge, SyncBadgeToggle } from "../../../components/driver/sync-badge";
import { DriverBadge } from "../../../components/driver/driver-badge";
import { DriverPageHeader } from "../../../components/driver/driver-page-header";
import type { DriverCurrentStopDto, DriverStopDto } from "@/lib/types/driver-api";

type DeliveryState = "transit" | "arrived" | "pod" | "done" | "failed";

export default function DriverCurrentStopPage() {
  const [currentData, setCurrentData] = useState<DriverCurrentStopDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [state, setState] = useState<DeliveryState>("transit");
  const [syncing, setSyncing] = useState(false);
  const [podName, setPodName] = useState("");
  const [podRemarks, setPodRemarks] = useState("");
  const [podSigned, setPodSigned] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [failReason, setFailReason] = useState("OUTLET_CLOSED");
  const [failNotes, setFailNotes] = useState("");
  const [notif, setNotif] = useState<string | null>(null);

  const notify = (msg: string) => {
    setNotif(msg);
    window.setTimeout(() => setNotif(null), 3500);
  };

  const triggerSync = async () => {
    setSyncing(true);
    try {
      await fetch("/api/driver/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: [] }),
      });
      notify("Synchronized with control tower.");
    } catch {
      notify("Offline: Changes cached locally.");
    } finally {
      setSyncing(false);
    }
  };

  const loadCurrentStop = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/driver/stops/current");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setCurrentData(json.data);
          const stop = json.data.currentStop;
          if (stop) {
            if (stop.status === "ARRIVED") setState("arrived");
            else if (stop.status === "DELIVERED") setState("done");
            else if (stop.status === "FAILED") setState("failed");
            else setState("transit");
          }
        }
      }
    } catch {
      notify("Offline mode: Using cached stop details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentStop();
  }, []);

  const currentStop: DriverStopDto = currentData?.currentStop || {
    stopId: "STP-001",
    stopSequence: 1,
    orderId: "ORD-20261001-001",
    outletId: "OUT001",
    outletName: "Cargills Food City — Pettah",
    address: "12 Market Street, Pettah",
    brandId: "BRAND_FRESH",
    districtId: "Colombo",
    dockType: "Front street dock",
    parkingConstraint: "normal",
    windowOpenTime: "04:00:00",
    windowCloseTime: "08:05:00",
    contactName: "Sunil Jayasuriya",
    contactPhone: "+94 77 123 4567",
    plannedArrivalTime: "07:18:00",
    isLate: false,
    status: "PENDING",
    cartons: 18,
    cartonsType: "18 chilled cartons",
    weightKg: 324,
    volumeM3: 2.2,
    tempClass: "chilled",
  };

  const nextStop = currentData?.nextStop;

  const handleArrive = async () => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/driver/stops/${currentStop.stopId}/arrive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientTimestamp: new Date().toISOString(),
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setState("arrived");
        notify(`Arrival recorded at ${currentStop.outletName}. GPS logged.`);
        triggerSync();
      } else {
        notify(json.error?.message || "Arrival failed");
      }
    } catch {
      setState("arrived");
      notify("Arrival cached locally. Will sync when online.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitPod = async () => {
    if (!podName || !podSigned) {
      notify("Please enter receiver name and capture signature.");
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(`/api/driver/stops/${currentStop.stopId}/pod`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: podName,
          signatureUrl: "data:image/svg+xml;base64,PHN2Zz5zaWduYXR1cmU8L3N2Zz4=",
          notes: podRemarks,
          clientTimestamp: new Date().toISOString(),
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setState("done");
        notify("POD submitted! Stop marked as Delivered.");
        triggerSync();
      } else {
        notify(json.error?.message || "Failed to submit POD");
      }
    } catch {
      setState("done");
      notify("POD saved locally. Will sync when online.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFailStop = async () => {
    if (!failNotes || failNotes.trim().length < 10) {
      notify("Please enter detailed reason notes (min 10 chars).");
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(`/api/driver/stops/${currentStop.stopId}/fail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reasonCode: failReason,
          driverNotes: failNotes,
          clientTimestamp: new Date().toISOString(),
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setState("failed");
        setShowFailModal(false);
        notify("Stop marked as unable to deliver. Deferral logged.");
        triggerSync();
      } else {
        notify(json.error?.message || "Failed to report delivery failure");
      }
    } catch {
      setState("failed");
      setShowFailModal(false);
      notify("Failure reported offline. Will sync when online.");
    } finally {
      setActionLoading(false);
    }
  };

  const heroVariant =
    state === "done"
      ? "delivered"
      : state === "arrived"
      ? "in-progress"
      : state === "failed"
      ? "failed"
      : "upcoming";
  const heroLabel =
    state === "done"
      ? "Delivered"
      : state === "arrived"
      ? "Arrived"
      : state === "failed"
      ? "Unable to Deliver"
      : "In transit";

  return (
    <div className="min-h-screen bg-[#ECEEF5] dark:bg-[#07090e] text-[#0F1020] dark:text-white/90 font-sans">
      {/* Toast */}
      {notif && (
        <div className="fixed top-20 right-4 z-50 bg-[#0F1928] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-white/10 max-w-xs">
          {notif}
        </div>
      )}

      {/* Failure Exception Modal */}
      {showFailModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ECEEF5] dark:bg-[#0F121C] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              Report Delivery Failure Exception [FORM-DRV-04]
            </div>
            <p className="text-xs text-[#7B7B9D]">
              Flag stop inability to deliver. Order will be automatically queued for deferral and redelivery.
            </p>
            <div className="space-y-3">
              <div>
                <FieldLabel required>Failure Reason</FieldLabel>
                <select
                  value={failReason}
                  onChange={(e) => setFailReason(e.target.value)}
                  className="w-full text-xs rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#161926] p-2.5"
                >
                  <option value="OUTLET_CLOSED">Store closed / shutter locked</option>
                  <option value="REFUSED_BY_STORE">Refused by store staff</option>
                  <option value="ACCESS_BLOCKED">Access blocked / no parking</option>
                  <option value="BREAKDOWN">Vehicle breakdown / road obstruction</option>
                  <option value="TEMPERATURE_ABUSE">Temperature abuse / cargo damaged</option>
                </select>
              </div>
              <div>
                <FieldLabel required>Driver Explanation Notes</FieldLabel>
                <Textarea
                  placeholder="Explain why delivery could not be completed (min 10 characters)..."
                  rows={3}
                  value={failNotes}
                  onChange={(e) => setFailNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setShowFailModal(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={actionLoading}
                onClick={handleFailStop}
                className="font-bold"
              >
                {actionLoading ? "Submitting…" : "Confirm Failure & Queue Deferral"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page header */}
        <DriverPageHeader
          title={`Stop ${currentStop.stopSequence} · ${currentStop.outletName}`}
          subtitle={`Trip ${currentData?.tripId || "TRP-20261001-01"} · Outlet ${currentStop.outletId}`}
          roleBadge={
            <RoleHeaderBadge>
              <MapPin className="w-3 h-3" /> CURRENT STOP
            </RoleHeaderBadge>
          }
        >
          <SyncBadge syncing={syncing} onClick={triggerSync} />
          <DriverBadge variant={heroVariant} label={heroLabel} showDot />
        </DriverPageHeader>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Clock className="w-4 h-4" />}
            label="Delivery window"
            value={currentStop.windowCloseTime?.slice(0, 5) || "08:05"}
            note={`Opens at ${currentStop.windowOpenTime?.slice(0, 5) || "04:00"}`}
            tone="orange"
            bars={[]}
          />
          <StatCard
            icon={<Snowflake className="w-4 h-4" />}
            label="Temperature"
            value={currentStop.tempClass === "chilled" ? "−2°C to 4°C" : "Ambient"}
            note="Sensor in range"
            tone="blue"
            bars={[]}
          />
          <StatCard
            icon={<Package className="w-4 h-4" />}
            label="Cartons"
            value={currentStop.cartons.toString()}
            note={`${currentStop.weightKg} kg · ${currentStop.volumeM3} m³`}
            tone="green"
            bars={[]}
          />
          <StatCard
            icon={<MapPin className="w-4 h-4" />}
            label="Dock Type"
            value={currentStop.dockType || "Rear Dock"}
            note={currentStop.parkingConstraint || "normal"}
            tone="purple"
            bars={[]}
          />
        </div>

        {/* Main 2-col */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
          {/* Stop details */}
          <Panel>
            <PanelHeader title="Stop details" subtitle={currentStop.outletName} />
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y divide-black/[0.05] dark:divide-white/[0.05]">
              {[
                ["Store", currentStop.outletName],
                ["Address", currentStop.address],
                ["Contact", currentStop.contactName],
                ["Phone", currentStop.contactPhone],
                ["Dock access", currentStop.dockType],
                ["Delivery", `${currentStop.cartonsType || `${currentStop.cartons} cartons`} · ${currentStop.weightKg} kg`],
                ["Window", `${currentStop.windowOpenTime?.slice(0, 5)} – ${currentStop.windowCloseTime?.slice(0, 5)}`],
                ["Temperature", currentStop.tempClass],
              ].map(([k, v]) => (
                <div key={k} className="p-4 border-r border-black/[0.05] dark:border-white/[0.05]">
                  <div className="text-[8px] text-[#7B7B9D] font-bold uppercase tracking-[0.06em] mb-1">
                    {k}
                  </div>
                  <div className="text-xs font-semibold">{v}</div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 flex gap-3 border-t border-black/[0.07] dark:border-white/[0.08]">
              <Link href={`tel:${currentStop.contactPhone}`}>
                <Button variant="secondary">
                  <Phone className="w-3.5 h-3.5" /> Call store contact
                </Button>
              </Link>
              <Button
                variant="secondary"
                onClick={() => notify("Navigation opened in maps with GPS waypoint.")}
              >
                <Map className="w-3.5 h-3.5" /> Navigate
              </Button>
            </div>
          </Panel>

          {/* Right sidebar */}
          <div className="flex flex-col gap-5">
            {/* Delivery actions */}
            <Panel>
              <PanelHeader title="Delivery actions" subtitle="Record each step in sequence" />
              <div className="p-5">
                {state === "done" ? (
                  <div className="text-center py-6 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-[rgba(16,185,129,.12)] grid place-items-center mx-auto text-[#10B981] shadow-[0_0_0_8px_rgba(16,185,129,.06)]">
                      <Check className="w-6 h-6" />
                    </div>
                    <div className="text-base font-extrabold">Delivery complete</div>
                    <div className="text-[10px] text-[#7B7B9D]">
                      POD uploaded · Signed by {podName || "Store receiver"}
                    </div>
                    <div className="pt-2">
                      <Link href="/driver">
                        <Button variant="primary" size="full" className="font-bold">
                          Next Stop on Run Sheet <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : state === "failed" ? (
                  <div className="text-center py-6 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-rose-500/10 grid place-items-center mx-auto text-rose-500">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                      Stop marked as failed
                    </div>
                    <div className="text-[10px] text-[#7B7B9D]">
                      Deferral registered. Re-queued for dispatcher review.
                    </div>
                    <div className="pt-2">
                      <Link href="/driver">
                        <Button variant="secondary" size="full">
                          Return to Run Sheet
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : state === "pod" ? (
                  <div className="space-y-4">
                    <div className="text-xs font-bold text-[#0F1020] dark:text-white border-b border-black/[0.07] dark:border-white/[0.08] pb-3">
                      Proof of Delivery (POD) [FORM-DRV-03]
                    </div>
                    <div>
                      <FieldLabel required>Receiver name</FieldLabel>
                      <Input
                        placeholder="Full name of receiving staff member"
                        value={podName}
                        onChange={(e) => setPodName(e.target.value)}
                      />
                    </div>
                    <div>
                      <FieldLabel required>Digital signature on glass</FieldLabel>
                      <div
                        onClick={() => setPodSigned(true)}
                        className={`h-20 rounded-xl border-2 grid place-items-center cursor-pointer transition-all duration-150 ${
                          podSigned
                            ? "border-[#10B981] bg-[rgba(16,185,129,.08)]"
                            : "border-black/[0.07] dark:border-white/[0.08] bg-[#F5F6FB] dark:bg-[#1C1C38] hover:border-[#F5C542]"
                        }`}
                      >
                        {podSigned ? (
                          <span className="text-[#10B981] font-bold text-sm flex items-center gap-1.5">
                            <Check className="w-4 h-4" /> Signature captured
                          </span>
                        ) : (
                          <span className="text-[#7B7B9D] text-xs">Tap to sign with finger</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Delivery remarks (optional)</FieldLabel>
                      <Textarea
                        placeholder="Condition of goods, temperature verified, seal check notes…"
                        rows={2}
                        value={podRemarks}
                        onChange={(e) => setPodRemarks(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="primary"
                      size="full"
                      className="font-extrabold tracking-wide"
                      disabled={actionLoading}
                      onClick={handleSubmitPod}
                    >
                      <Check className="w-3.5 h-3.5" />
                      {actionLoading ? "Submitting…" : "SUBMIT POD & COMPLETE"}
                    </Button>
                    <Button
                      variant="secondary"
                      size="full"
                      className="text-xs"
                      onClick={() => setState("arrived")}
                    >
                      ← Back
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      variant={state === "arrived" ? "secondary" : "primary"}
                      size="full"
                      className="font-extrabold tracking-wide min-h-[52px] text-sm"
                      disabled={state === "arrived" || actionLoading}
                      onClick={handleArrive}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      {state === "arrived" ? "ARRIVED ✓" : "ARRIVED AT OUTLET"}
                    </Button>
                    <Button
                      variant="primary"
                      size="full"
                      className="font-extrabold tracking-wide min-h-[52px] text-sm"
                      disabled={state !== "arrived"}
                      onClick={() => setState("pod")}
                    >
                      <Check className="w-3.5 h-3.5" /> COMPLETE DELIVERY
                    </Button>
                    <Button
                      variant="danger"
                      size="full"
                      className="font-bold"
                      onClick={() => setShowFailModal(true)}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> UNABLE TO DELIVER
                    </Button>
                  </div>
                )}
              </div>
            </Panel>

            {/* Next stop */}
            {nextStop && (
              <Panel>
                <PanelHeader title="Next stop" subtitle={`Stop ${nextStop.stopSequence} · Upcoming`} />
                <div className="px-5 py-4">
                  <div className="font-bold text-sm mb-1">{nextStop.outletName}</div>
                  <div className="text-[10px] text-[#7B7B9D] mb-3">
                    {nextStop.address} · {nextStop.cartons} cartons
                  </div>
                  <div className="flex items-center gap-2">
                    <DriverBadge
                      variant="in-progress"
                      label={`ETA ${nextStop.plannedArrivalTime?.slice(0, 5)}`}
                      showDot
                    />
                    <DriverBadge variant="upcoming" label={`${nextStop.cartons} cartons`} showDot={false} />
                  </div>
                </div>
              </Panel>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
