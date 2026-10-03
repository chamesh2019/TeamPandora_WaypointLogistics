"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Package,
  Clock,
  Route,
  Eye,
} from "lucide-react";
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

interface CompletedStop {
  n: number;
  store: string;
  addr: string;
  time: string;
  cartons: number;
  sig: string;
  pod: string;
}

const stops: CompletedStop[] = [
  { n: 1, store: "Pettah Fresh",         addr: "Manning Market Rd, Pettah",      time: "04:12", cartons: 14, sig: "Ruwan S.", pod: "Uploaded" },
  { n: 2, store: "Maradana Fresh",        addr: "Baseline Rd, Maradana",          time: "04:58", cartons: 20, sig: "Amara K.", pod: "Uploaded" },
  { n: 3, store: "Bambalapitiya Fresh",   addr: "Galle Rd, Bambalapitiya",        time: "05:44", cartons: 16, sig: "Priya T.", pod: "Uploaded" },
];

export default function DriverPodPage() {
  const [notif, setNotif] = useState<string | null>(null);

  const notify = (msg: string) => {
    setNotif(msg);
    window.setTimeout(() => setNotif(null), 3500);
  };

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
            <CheckCircle2 className="w-3 h-3" /> COMPLETED STOPS
          </RoleHeaderBadge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F1020] dark:text-white">
            Completed deliveries
          </h1>
          <p className="text-xs text-[#7B7B9D] mt-1">
            Trip TRP-250613-04 · 3 of 12 stops done
          </p>
        </div>
        <SyncBadge syncedLabel="3 synced" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<CheckCircle2 className="w-4 h-4" />} label="Stops completed"  value="3 / 12" note="9 remaining"           tone="green"  bars={[]} />
        <StatCard icon={<Package className="w-4 h-4" />}      label="Cartons delivered" value="50"     note="All proofs uploaded"   tone="blue"   bars={[]} />
        <StatCard icon={<Clock className="w-4 h-4" />}        label="Elapsed time"      value="3h 01m" note="On schedule"            tone="purple" bars={[]} />
        <StatCard icon={<Route className="w-4 h-4" />}        label="Distance covered"  value="28 km"  note="74 km remaining"       tone="orange" bars={[]} />
      </div>

      {/* Completed deliveries table */}
      <Panel>
        <PanelHeader
          title="Completed deliveries"
          subtitle="Proof of delivery status · All signatures collected"
          badge={
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgba(16,185,129,.12)] text-[#10B981] text-[8px] font-bold uppercase tracking-wider border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              All synced
            </span>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-sans border-collapse">
            <thead>
              <tr className="border-b border-black/[0.07] dark:border-white/[0.08]">
                {["#", "Outlet", "Address", "Delivered", "Cartons", "Signature", "POD", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[9px] font-bold text-[#7B7B9D] uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {stops.map((s) => (
                <tr key={s.n} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <StopNumberCell n={s.n} status="done" />
                  </td>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap">{s.store}</td>
                  <td className="px-4 py-3 text-[10px] text-[#7B7B9D] max-w-[180px] truncate">{s.addr}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-[#7B7B9D]">{s.time}</td>
                  <td className="px-4 py-3 font-semibold">{s.cartons}</td>
                  <td className="px-4 py-3 text-[10px] text-[#7B7B9D]">{s.sig}</td>
                  <td className="px-4 py-3">
                    <DriverBadge variant="delivered" label={s.pod} showDot={false} />
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="compact"
                      onClick={() => notify(`Viewing POD for stop ${s.n}.`)}
                      aria-label={`View POD for stop ${s.n}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-black/[0.07] dark:border-white/[0.08] flex items-center justify-between">
          <div className="text-[10px] text-[#7B7B9D]">
            Total: <span className="font-bold text-[#0F1020] dark:text-white">50 cartons</span> · 3 signatures collected · All PODs uploaded
          </div>
          <Button variant="secondary" size="compact" onClick={() => notify("Downloading all POD receipts…")}>
            Export all PODs
          </Button>
        </div>
      </Panel>
    </div>
  );
}
