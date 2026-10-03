"use client";

import React, { useState } from "react";
import { CheckCircle2, Package, Clock, Route, Eye } from "lucide-react";
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
import { PageHeader } from "../../../components/layout/page-header";

import type { StopStatus } from "../../../components/driver/stop-number-cell";

const tripDetails = {
  driverName: "Nimal Perera",
  tripId: "TRP-250613-04",
  vehicle: "WP NC-4872",
  vehicleType: "Reefer truck · Chilled",
  depot: "Peliyagoda",
  departure: "03:30",
  estReturn: "12:45",
  status: "On route",
  statusNote: "Running 4 min ahead",
};

const podDetails = {
  elapsedTime: "3h 01m",
  distanceCovered: "28 km",
  distanceRemaining: "74 km remaining",
};

interface Stop {
  n: number;
  store: string;
  addr: string;
  time: string;
  eta: string;
  cartons: number;
  status: StopStatus;
  window?: string;
  dock?: string;
  cartonsType?: string;
  contact?: string;
  sig?: string;
  pod?: string;
}

const stops: Stop[] = [
  { n: 1,  store: "Pettah Fresh",                     addr: "Manning Market Road, Pettah",        time: "04:12", eta: "Done",    cartons: 14, status: "done",     window: "04:00 - 05:00", dock: "Front",         cartonsType: "14 mixed",   contact: "Manager", sig: "Ruwan S.", pod: "Uploaded" },
  { n: 2,  store: "Maradana Fresh",                   addr: "Baseline Road, Maradana",             time: "04:58", eta: "Done",    cartons: 20, status: "done",     window: "04:30 - 05:30", dock: "Rear",          cartonsType: "20 chilled", contact: "Sunil", sig: "Amara K.", pod: "Uploaded" },
  { n: 3,  store: "Bambalapitiya Fresh",               addr: "Galle Road, Bambalapitiya",           time: "05:44", eta: "Done",    cartons: 16, status: "done",     window: "05:00 - 06:00", dock: "Side",          cartonsType: "16 ambient", contact: "Kamal", sig: "Priya T.", pod: "Uploaded" },
  { n: 4,  store: "Cargills Food City · Nugegoda",    addr: "142 High Level Road, Nugegoda",       time: "07:18", eta: "07:18 →", cartons: 18, status: "current",  window: "00:47:18",      dock: "Rear · Gate 2", cartonsType: "18 chilled", contact: "Suresh W." },
  { n: 5,  store: "Keells Super · Rajagiriya",        addr: "Rajagiriya Town Centre",              time: "07:46", eta: "07:46",   cartons: 12, status: "upcoming", window: "07:30 - 08:30", dock: "Loading Bay",   cartonsType: "12 mixed",   contact: "Ruwan" },
  { n: 6,  store: "Cargills Express · Bambalapitiya", addr: "Galle Road, Bambalapitiya",           time: "08:12", eta: "08:12",   cartons: 22, status: "upcoming", window: "08:00 - 09:00", dock: "Rear",          cartonsType: "22 chilled", contact: "Pathum" },
  { n: 7,  store: "Keells Super · Wellawatte",        addr: "Galle Road, Wellawatte",              time: "08:40", eta: "08:40",   cartons: 18, status: "upcoming", window: "08:30 - 09:30", dock: "Front",         cartonsType: "18 ambient", contact: "Nuwan" },
  { n: 8,  store: "Cargills Food City · Dehiwala",    addr: "Galle Road, Dehiwala",                time: "09:10", eta: "09:10",   cartons: 14, status: "upcoming", window: "09:00 - 10:00", dock: "Gate 1",        cartonsType: "14 frozen",  contact: "Silva" },
  { n: 9,  store: "Keells Super · Mount Lavinia",     addr: "Galle Road, Mount Lavinia",           time: "09:40", eta: "09:40",   cartons: 16, status: "upcoming", window: "09:30 - 10:30", dock: "Rear",          cartonsType: "16 mixed",   contact: "Manoj" },
  { n: 10, store: "Cargills Express · Ratmalana",     addr: "Old Galle Road, Ratmalana",           time: "10:05", eta: "10:05",   cartons: 10, status: "upcoming", window: "10:00 - 11:00", dock: "Side",          cartonsType: "10 ambient", contact: "Dineth" },
  { n: 11, store: "Keells Super · Moratuwa",          addr: "Main Street, Moratuwa",               time: "10:35", eta: "10:35",   cartons: 20, status: "upcoming", window: "10:30 - 11:30", dock: "Gate 2",        cartonsType: "20 chilled", contact: "Saman" },
  { n: 12, store: "Cargills Food City · Panadura",    addr: "Galle Road, Panadura",                time: "11:15", eta: "11:15",   cartons: 15, status: "upcoming", window: "11:00 - 12:00", dock: "Rear",          cartonsType: "15 frozen",  contact: "Hasitha" },
];

export default function DriverPodPage() {
  const [notif, setNotif] = useState<string | null>(null);

  const notify = (msg: string) => {
    setNotif(msg);
    window.setTimeout(() => setNotif(null), 3500);
  };

  const completedStops = stops.filter(s => s.status === "done");
  const completedCount = completedStops.length;
  const remainingCount = stops.length - completedCount;
  const totalCartons = completedStops.reduce((sum, s) => sum + s.cartons, 0);

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
        <PageHeader
          title="Completed deliveries"
          subtitle={`Trip ${tripDetails.tripId} · ${completedCount} of ${stops.length} stops done`}
          roleBadge={
            <RoleHeaderBadge>
              <CheckCircle2 className="w-3 h-3" /> COMPLETED STOPS
            </RoleHeaderBadge>
          }
        >
          <SyncBadge syncedLabel={`${completedCount} synced`} />
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<CheckCircle2 className="w-4 h-4" />} label="Stops completed"   value={`${completedCount} / ${stops.length}`} note={`${remainingCount} remaining`} tone="green"  bars={[]} />
          <StatCard icon={<Package className="w-4 h-4" />}      label="Cartons delivered"  value={totalCartons.toString()}     note="All proofs uploaded"  tone="blue"   bars={[]} />
          <StatCard icon={<Clock className="w-4 h-4" />}         label="Elapsed time"       value={podDetails.elapsedTime} note="On schedule"          tone="purple" bars={[]} />
          <StatCard icon={<Route className="w-4 h-4" />}         label="Distance covered"   value={podDetails.distanceCovered}  note={podDetails.distanceRemaining} tone="orange" bars={[]} />
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
                    <th key={h} className="px-4 py-3 text-left text-[9px] font-bold text-[#7B7B9D] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                {completedStops.map((s) => (
                  <tr key={s.n} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                    <td className="px-4 py-3"><StopNumberCell n={s.n} status="done" /></td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">{s.store}</td>
                    <td className="px-4 py-3 text-[10px] text-[#7B7B9D] max-w-[180px] truncate">{s.addr}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-[#7B7B9D]">{s.time}</td>
                    <td className="px-4 py-3 font-semibold">{s.cartons}</td>
                    <td className="px-4 py-3 text-[10px] text-[#7B7B9D]">{s.sig}</td>
                    <td className="px-4 py-3">
                      <DriverBadge variant="delivered" label={s.pod || "Uploaded"} showDot={false} />
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="compact" onClick={() => notify(`Viewing POD for stop ${s.n}.`)} aria-label={`View POD for stop ${s.n}`}>
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
              Total: <span className="font-bold text-[#0F1020] dark:text-white">{totalCartons} cartons</span> · {completedCount} signatures collected · All PODs uploaded
            </div>
            <Button variant="secondary" size="compact" onClick={() => notify("Downloading all POD receipts…")}>
              Export all PODs
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
