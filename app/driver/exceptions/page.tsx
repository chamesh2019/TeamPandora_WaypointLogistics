"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Truck, Camera } from "lucide-react";
import {
  Button,
  RoleHeaderBadge,
  StatCard,
  Panel,
  PanelHeader,
  Select,
  Textarea,
  FieldLabel,
} from "../../../components/design-system";
import { DriverBadge } from "../../../components/driver/driver-badge";
import { DriverPageHeader } from "../../../components/driver/driver-page-header";
import { cn } from "../../../lib/utils";
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
}

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

const EXCEPTION_TYPES = [
  "Cargo damage", "Missing items", "Store closed",
  "Access denied", "Temperature issue", "Vehicle issue", "Other",
];

interface PastException {
  id: string; trip: string; stop: string; type: string;
  status: "Resolved" | "Open"; time: string;
}

const pastExceptions: PastException[] = [
  { id: "EXC-250613-01", trip: "TRP-250610-04", stop: "Stop 3 · Maradana", type: "Missing items", status: "Resolved", time: "05:14" },
  { id: "EXC-250611-02", trip: "TRP-250611-04", stop: "Stop 7 · Kandy",    type: "Store closed",  status: "Resolved", time: "08:32" },
];

export default function DriverExceptionsPage() {
  const [excType, setExcType] = useState("Store closed");
  const [description, setDescription] = useState("");
  const [photoAttached, setPhotoAttached] = useState(false);
  const [notif, setNotif] = useState<string | null>(null);

  const notify = (msg: string) => {
    setNotif(msg);
    window.setTimeout(() => setNotif(null), 3500);
  };

  const openExceptionsCount = pastExceptions.filter(e => e.status === "Open").length;
  const resolvedExceptionsCount = pastExceptions.filter(e => e.status === "Resolved").length;
  const lastException = pastExceptions[0];

  const handleSubmit = () => {
    if (!description.trim()) { notify("Please describe the exception before submitting."); return; }
    notify("Exception reported. Control tower notified.");
    setDescription(""); setPhotoAttached(false);
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
          title="Report exception"
          subtitle={`Trip ${tripDetails.tripId} · Log a delivery issue for control tower review`}
          roleBadge={
            <RoleHeaderBadge>
              <AlertTriangle className="w-3 h-3" /> EXCEPTIONS
            </RoleHeaderBadge>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="Open exceptions"     value={openExceptionsCount.toString()}      note={`Trip ${tripDetails.tripId}`}     tone="green"  bars={[]} />
          <StatCard icon={<CheckCircle2 className="w-4 h-4" />}  label="Resolved this month"  value={resolvedExceptionsCount.toString()}      note="Avg 18 min resolution"  tone="blue"   bars={[]} />
          <StatCard icon={<Clock className="w-4 h-4" />}          label="Last exception"        value={lastException ? "2 days" : "None"} note={lastException?.id || "N/A"}           tone="purple" bars={[]} />
          <StatCard icon={<Truck className="w-4 h-4" />}          label="Trip status"           value={tripDetails.status} note={tripDetails.statusNote}    tone="orange" bars={[]} />
        </div>

        {/* Main 2-col */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">

          {/* New exception form */}
          <Panel>
            <PanelHeader title="New exception report" subtitle="All exceptions are logged and notified to control tower immediately" />
            <div className="p-5 space-y-5">

              {/* Type selector */}
              <div>
                <FieldLabel>Exception type</FieldLabel>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                  {EXCEPTION_TYPES.map((t) => (
                    <button key={t} type="button" onClick={() => setExcType(t)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-[10px] font-semibold text-left transition-all border cursor-pointer",
                        excType === t
                          ? "bg-[#F5C542] text-[#0F1928] border-[#F5C542] font-bold shadow-sm"
                          : "bg-white dark:bg-[#1C1C38] text-[#7B7B9D] border-black/[0.07] dark:border-white/[0.08] hover:border-[#F5C542] hover:text-[#0F1020] dark:hover:text-white"
                      )}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stop & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Affected stop</FieldLabel>
                  <Select>
                    {stops.map(s => (
                      <option key={s.n} value={s.n}>
                        Stop {s.n} · {s.store.split(" · ")[0].split(" — ")[0]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <FieldLabel>Priority</FieldLabel>
                  <Select>
                    <option>High — Needs immediate action</option>
                    <option>Medium — Can be resolved en route</option>
                    <option>Low — For logging only</option>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div>
                <FieldLabel>Description *</FieldLabel>
                <Textarea rows={4} placeholder={`Describe the ${excType.toLowerCase()}…`} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => { setPhotoAttached(true); notify("Photo attached."); }}>
                  <Camera className="w-3.5 h-3.5" />
                  {photoAttached ? "Photo attached ✓" : "Attach photo"}
                </Button>
                <Button variant="primary" className="flex-[2] font-bold" onClick={handleSubmit}>
                  <AlertTriangle className="w-3.5 h-3.5" /> Submit exception report
                </Button>
              </div>
            </div>
          </Panel>

          {/* Past exceptions */}
          <Panel>
            <PanelHeader title="Past exceptions" subtitle="Your exception history" />
            {pastExceptions.length === 0 ? (
              <div className="px-5 py-10 text-center text-xs text-[#7B7B9D]">No past exceptions recorded.</div>
            ) : (
              <div className="divide-y divide-black/[0.05] dark:divide-white/[0.05]">
                {pastExceptions.map((e) => (
                  <div key={e.id} className="flex items-start gap-3 px-5 py-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[rgba(245,158,11,.1)] text-[#F59E0B] grid place-items-center flex-shrink-0 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold mb-0.5">{e.type}</div>
                      <div className="text-[9px] text-[#7B7B9D]">{e.stop} · {e.trip}</div>
                      <div className="text-[8px] text-[#7B7B9D] mt-0.5 font-mono">{e.id} · {e.time}</div>
                    </div>
                    <DriverBadge variant={e.status === "Resolved" ? "resolved" : "open"} label={e.status} showDot={false} />
                  </div>
                ))}
              </div>
            )}
            <div className="px-5 py-3 border-t border-black/[0.07] dark:border-white/[0.08]">
              <Button variant="ghost" size="compact" className="w-full" onClick={() => notify("Loading full exception history…")}>
                View full history
              </Button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
