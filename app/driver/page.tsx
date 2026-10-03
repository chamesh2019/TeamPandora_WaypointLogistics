"use client";

import React, { useState } from "react";
import { Truck, Map, Route, CheckCircle2, Clock } from "lucide-react";
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
import { PageHeader } from "../../components/layout/page-header";
import type { StopStatus } from "../../components/driver/stop-number-cell";

interface Stop {
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
}

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

const stops: Stop[] = [
  { n: 1,  store: "Pettah Fresh",                     addr: "Manning Market Road, Pettah",        time: "04:12", eta: "Done",    cartons: 14, status: "done",     window: "04:00 - 05:00", dock: "Front",         cartonsType: "14 mixed",   contact: "Manager" },
  { n: 2,  store: "Maradana Fresh",                   addr: "Baseline Road, Maradana",             time: "04:58", eta: "Done",    cartons: 20, status: "done",     window: "04:30 - 05:30", dock: "Rear",          cartonsType: "20 chilled", contact: "Sunil" },
  { n: 3,  store: "Bambalapitiya Fresh",               addr: "Galle Road, Bambalapitiya",           time: "05:44", eta: "Done",    cartons: 16, status: "done",     window: "05:00 - 06:00", dock: "Side",          cartonsType: "16 ambient", contact: "Kamal" },
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
  const [notif, setNotif] = useState<string | null>(null);
  const first = tripDetails.driverName.split(" ")[0];
  const currentStop = stops.find(s => s.status === "current") || stops[0];
  
  const completedCount = stops.filter(s => s.status === "done").length;
  const remainingCount = stops.length - completedCount;
  const nextEta = currentStop ? currentStop.time : "--:--";
  const nextEtaStore = currentStop ? currentStop.store.split(" · ")[1] || currentStop.store : "--";

  const notify = (msg: string) => {
    setNotif(msg);
    window.setTimeout(() => setNotif(null), 3500);
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
        <PageHeader
          title={`${greeting()}, ${first}`}
          subtitle={`Trip ${tripDetails.tripId} · Vehicle ${tripDetails.vehicle} · ${tripDetails.depot} depot`}
          roleBadge={
            <RoleHeaderBadge>
              <Truck className="w-3 h-3" /> DRIVER
            </RoleHeaderBadge>
          }
        >
          <SyncBadgeToggle onSync={() => notify("Synchronizing with control tower…")} />
          <Button variant="secondary" onClick={() => notify("Route overview shared with control tower.")}>
            <Map className="w-3.5 h-3.5" /> View map
          </Button>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Route className="w-4 h-4" />}        label="Stops today"  value={stops.length.toString()} note={`${completedCount} completed · ${remainingCount} remaining`} tone="blue"   bars={[]} />
          <StatCard icon={<CheckCircle2 className="w-4 h-4" />}  label="Delivered"    value={completedCount.toString()} note="POD uploaded for all"        tone="green"  bars={[]} />
          <StatCard icon={<Clock className="w-4 h-4" />}         label="Next ETA"     value={nextEta}                   note={nextEtaStore}                tone="purple" bars={[]} />
          <StatCard icon={<Truck className="w-4 h-4" />}         label="Trip status"  value={tripDetails.status}        note={tripDetails.statusNote}      tone="orange" bars={[]} />
        </div>

        {/* Main 2-col grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">

          {/* Run sheet table */}
          <Panel>
            <PanelHeader
              title="Today's run sheet"
              subtitle="LIFO optimised · 12 stops · Est. 4h 12m remaining"
              badge={
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgba(75,142,245,.12)] text-[#4B8EF5] text-[8px] font-bold uppercase tracking-wider border border-blue-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4B8EF5] animate-pulse" />
                  Active
                </span>
              }
            />
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-sans border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.07] dark:border-white/[0.08]">
                    {["#", "Outlet", "Address", "Cartons", "ETA", "Status"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[9px] font-bold text-[#7B7B9D] uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                  {stops.map((s) => (
                    <tr
                      key={s.n}
                      className={s.status === "current" ? "bg-[rgba(245,197,66,.05)]" : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"}
                    >
                      <td className="px-4 py-3"><StopNumberCell n={s.n} status={s.status} /></td>
                      <td className={`px-4 py-3 font-semibold whitespace-nowrap ${s.status === "current" ? "text-[#D4A200] dark:text-[#F5C542] font-bold" : ""}`}>
                        {s.store}
                      </td>
                      <td className="px-4 py-3 text-[#7B7B9D] text-[10px] max-w-[180px] truncate">{s.addr}</td>
                      <td className="px-4 py-3 font-semibold">{s.cartons}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-[#7B7B9D]">{s.eta}</td>
                      <td className="px-4 py-3">
                        <DriverBadge variant={statusVariant[s.status]} showDot={false} />
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
                subtitle={`Stop ${currentStop.n} · Active`}
                badge={<DriverBadge variant="in-progress" label="Next" showDot />}
              />
              <div className="p-5 space-y-4">
                <div>
                  <div className="text-sm font-extrabold text-[#0F1020] dark:text-white mb-1">
                    {currentStop.store}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#7B7B9D]">
                    <Map className="w-3 h-3" /> {currentStop.addr}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-black/[0.07] dark:border-white/[0.08]">
                  {[
                    ["Window", currentStop.window],
                    ["Dock", currentStop.dock],
                    ["Cartons", currentStop.cartonsType],
                    ["Contact", currentStop.contact]
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div className="text-[8px] text-[#7B7B9D] font-bold uppercase tracking-[0.06em] mb-0.5">{k}</div>
                      <div className="text-[11px] font-semibold">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Button variant="primary" size="full" className="font-bold tracking-wide" onClick={() => notify("Arrival captured at 07:13. GPS logged.")}>
                    <Map className="w-3.5 h-3.5" /> ARRIVED AT OUTLET
                  </Button>
                  <Button variant="secondary" size="full" onClick={() => notify("Calling store contact…")}>
                    Call store contact
                  </Button>
                  <Button variant="danger" size="full" onClick={() => notify("Exception reported. Control tower notified.")}>
                    UNABLE TO DELIVER
                  </Button>
                </div>
              </div>
            </Panel>

            {/* Vehicle & trip */}
            <Panel>
              <PanelHeader title="Vehicle & trip" />
              <div className="px-5 py-3">
                {[
                  ["Vehicle", tripDetails.vehicle],
                  ["Type", tripDetails.vehicleType],
                  ["Driver", tripDetails.driverName],
                  ["Depot", tripDetails.depot],
                  ["Departure", tripDetails.departure],
                  ["Est. return", tripDetails.estReturn]
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center py-2.5 border-b border-black/[0.05] dark:border-white/[0.05] last:border-0">
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
