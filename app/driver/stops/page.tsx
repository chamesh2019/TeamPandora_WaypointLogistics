"use client";

import React, { useState } from "react";
import {
  MapPin,
  Clock,
  Snowflake,
  Package,
  Map,
  Phone,
  Check,
  AlertTriangle,
} from "lucide-react";
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

type DeliveryState = "transit" | "arrived" | "pod" | "done";

export default function DriverCurrentStopPage() {
  const [state, setState] = useState<DeliveryState>("transit");
  const [syncing, setSyncing] = useState(false);
  const [podName, setPodName] = useState("");
  const [podRemarks, setPodRemarks] = useState("");
  const [podSigned, setPodSigned] = useState(false);
  const [notif, setNotif] = useState<string | null>(null);

  const notify = (msg: string) => {
    setNotif(msg);
    window.setTimeout(() => setNotif(null), 3500);
  };

  const triggerSync = () => {
    setSyncing(true);
    window.setTimeout(() => setSyncing(false), 2200);
  };

  const heroVariant =
    state === "done" ? "delivered" : state === "arrived" ? "in-progress" : "upcoming";
  const heroLabel =
    state === "done" ? "Delivered" : state === "arrived" ? "Arrived" : "In transit";

  return (
    <div className="min-h-screen bg-[#ECEEF5] dark:bg-[#07090e] text-[#0F1020] dark:text-white/90 p-4 sm:p-6 lg:p-8 font-sans space-y-6">

      {/* Toast */}
      {notif && (
        <div className="fixed top-4 right-4 z-50 bg-[#0F1928] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-white/10 max-w-xs">
          {notif}
        </div>
      )}

      {/* Hero row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <RoleHeaderBadge className="mb-2">
            <MapPin className="w-3 h-3" /> CURRENT STOP
          </RoleHeaderBadge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F1020] dark:text-white">
            Stop 4 of 12 · Cargills Food City
          </h1>
          <p className="text-xs text-[#7B7B9D] mt-1">
            Trip TRP-250613-04 · Vehicle WP NC-4872
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SyncBadge syncing={syncing} onClick={triggerSync} />
          <DriverBadge variant={heroVariant} label={heroLabel} showDot />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Clock className="w-4 h-4" />}      label="Delivery window" value="00:47" note="Closes at 08:05"        tone="orange" bars={[]} />
        <StatCard icon={<Snowflake className="w-4 h-4" />}  label="Temperature"     value="−2°C"  note="Chilled · Within range" tone="blue"   bars={[]} />
        <StatCard icon={<Package className="w-4 h-4" />}    label="Cartons"         value="18"    note="324 kg · Chilled"       tone="green"  bars={[]} />
        <StatCard icon={<MapPin className="w-4 h-4" />}     label="Distance"        value="0.0 km" note="On site · GPS confirmed" tone="purple" bars={[]} />
      </div>

      {/* Main 2-col */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">

        {/* Stop details */}
        <Panel>
          <PanelHeader title="Stop details" subtitle="Cargills Food City — Nugegoda" />
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y divide-black/[0.05] dark:divide-white/[0.05]">
            {[
              ["Store",       "Cargills Food City — Nugegoda"],
              ["Address",     "142 High Level Road, Nugegoda"],
              ["Contact",     "Suresh Wickrama"],
              ["Phone",       "+94 77 234 5678"],
              ["Dock access", "Rear dock · Gate 2"],
              ["Delivery",    "18 chilled cartons · 324 kg"],
              ["Window",      "07:30 – 08:05"],
              ["Temperature", "Chilled (−2°C to +4°C)"],
            ].map(([k, v]) => (
              <div key={k} className="p-4 border-r border-black/[0.05] dark:border-white/[0.05]">
                <div className="text-[8px] text-[#7B7B9D] font-bold uppercase tracking-[0.06em] mb-1">{k}</div>
                <div className="text-xs font-semibold">{v}</div>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 flex gap-3 border-t border-black/[0.07] dark:border-white/[0.08]">
            <Button variant="secondary" onClick={() => notify("Calling Suresh Wickrama…")}>
              <Phone className="w-3.5 h-3.5" /> Call store contact
            </Button>
            <Button variant="secondary" onClick={() => notify("Navigation opened in maps.")}>
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
                /* ── Completed ── */
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[rgba(16,185,129,.12)] grid place-items-center mx-auto text-[#10B981] shadow-[0_0_0_8px_rgba(16,185,129,.06)]">
                    <Check className="w-6 h-6" />
                  </div>
                  <div className="text-base font-extrabold">Delivery complete</div>
                  <div className="text-[10px] text-[#7B7B9D]">
                    POD uploaded · {new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })} · Signed by {podName || "Store receiver"}
                  </div>
                  <SyncBadgeToggle syncedLabel="Synced to server" onSync={triggerSync} />
                </div>
              ) : state === "pod" ? (
                /* ── POD form ── */
                <div className="space-y-4">
                  <div className="text-xs font-bold text-[#0F1020] dark:text-white border-b border-black/[0.07] dark:border-white/[0.08] pb-3">
                    Proof of Delivery
                  </div>
                  <div>
                    <FieldLabel>Receiver name *</FieldLabel>
                    <Input
                      placeholder="Full name of receiving staff"
                      value={podName}
                      onChange={(e) => setPodName(e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel>Digital signature *</FieldLabel>
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
                        <span className="text-[#7B7B9D] text-xs">Tap to capture signature</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Delivery remarks (optional)</FieldLabel>
                    <Textarea
                      placeholder="Condition of goods, damaged cartons, partial delivery notes…"
                      rows={2}
                      value={podRemarks}
                      onChange={(e) => setPodRemarks(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="primary"
                    size="full"
                    className="font-extrabold tracking-wide"
                    onClick={() => {
                      if (!podName || !podSigned) {
                        notify("Please enter receiver name and capture signature.");
                        return;
                      }
                      setState("done");
                      notify("POD submitted. Delivery confirmed and synced.");
                      triggerSync();
                    }}
                  >
                    <Check className="w-3.5 h-3.5" /> SUBMIT POD & COMPLETE
                  </Button>
                  <Button variant="secondary" size="full" className="text-xs" onClick={() => setState("arrived")}>
                    ← Back
                  </Button>
                </div>
              ) : (
                /* ── Transit / Arrived ── */
                <div className="space-y-3">
                  <Button
                    variant={state === "arrived" ? "secondary" : "primary"}
                    size="full"
                    className="font-extrabold tracking-wide min-h-[52px] text-sm"
                    disabled={state === "arrived"}
                    onClick={() => {
                      if (state !== "arrived") {
                        setState("arrived");
                        notify("Arrival recorded. GPS coordinates captured.");
                        triggerSync();
                      }
                    }}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {state === "arrived" ? "ARRIVED ✓" : "ARRIVED AT OUTLET"}
                  </Button>
                  <Button
                    variant="primary"
                    size="full"
                    className="font-extrabold tracking-wide min-h-[52px] text-sm"
                    disabled={state !== "arrived"}
                    onClick={() => { if (state === "arrived") setState("pod"); }}
                  >
                    <Check className="w-3.5 h-3.5" /> COMPLETE DELIVERY
                  </Button>
                  <Button
                    variant="danger"
                    size="full"
                    className="font-bold"
                    onClick={() => notify("Exception reported. Control tower notified.")}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> UNABLE TO DELIVER
                  </Button>
                </div>
              )}
            </div>
          </Panel>

          {/* Next stop */}
          <Panel>
            <PanelHeader title="Next stop" subtitle="Stop 5 · Upcoming" />
            <div className="px-5 py-4">
              <div className="font-bold text-sm mb-1">Keells Super · Rajagiriya</div>
              <div className="text-[10px] text-[#7B7B9D] mb-3">Rajagiriya Town Centre · 12 cartons</div>
              <div className="flex items-center gap-2">
                <DriverBadge variant="in-progress" label="ETA 07:46" showDot />
                <DriverBadge variant="upcoming" label="12 cartons" showDot={false} />
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
