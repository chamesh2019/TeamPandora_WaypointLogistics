"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  Camera,
} from "lucide-react";
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
import { cn } from "../../../lib/utils";

const EXCEPTION_TYPES = [
  "Cargo damage",
  "Missing items",
  "Store closed",
  "Access denied",
  "Temperature issue",
  "Vehicle issue",
  "Other",
];

interface PastException {
  id: string;
  trip: string;
  stop: string;
  type: string;
  status: "Resolved" | "Open";
  time: string;
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

  const handleSubmit = () => {
    if (!description.trim()) {
      notify("Please describe the exception before submitting.");
      return;
    }
    notify("Exception reported. Control tower notified.");
    setDescription("");
    setPhotoAttached(false);
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
            <AlertTriangle className="w-3 h-3" /> EXCEPTIONS
          </RoleHeaderBadge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F1020] dark:text-white">
            Report exception
          </h1>
          <p className="text-xs text-[#7B7B9D] mt-1">
            Trip TRP-250613-04 · Log a delivery issue for control tower review
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="Open exceptions"    value="0"      note="Trip TRP-250613-04"     tone="green"  bars={[]} />
        <StatCard icon={<CheckCircle2 className="w-4 h-4" />}  label="Resolved this month" value="2"      note="Avg 18 min resolution" tone="blue"   bars={[]} />
        <StatCard icon={<Clock className="w-4 h-4" />}          label="Last exception"      value="2 days" note="EXC-250611-02"          tone="purple" bars={[]} />
        <StatCard icon={<Truck className="w-4 h-4" />}          label="Trip status"         value="On route" note="No active issues"     tone="orange" bars={[]} />
      </div>

      {/* Main 2-col */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">

        {/* New exception form */}
        <Panel>
          <PanelHeader
            title="New exception report"
            subtitle="All exceptions are logged and notified to control tower immediately"
          />
          <div className="p-5 space-y-5">

            {/* Exception type selector */}
            <div>
              <FieldLabel>Exception type</FieldLabel>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                {EXCEPTION_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setExcType(t)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-[10px] font-semibold text-left transition-all border cursor-pointer",
                      excType === t
                        ? "bg-[#F5C542] text-[#0F1928] border-[#F5C542] font-bold shadow-sm"
                        : "bg-white dark:bg-[#1C1C38] text-[#7B7B9D] border-black/[0.07] dark:border-white/[0.08] hover:border-[#F5C542] hover:text-[#0F1020] dark:hover:text-white"
                    )}
                  >
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
                  <option>Stop 4 · Cargills Nugegoda</option>
                  <option>Stop 5 · Keells Rajagiriya</option>
                  <option>Stop 6 · Cargills Bambalapitiya</option>
                  <option>Stop 7 · Keells Wellawatte</option>
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
              <Textarea
                rows={4}
                placeholder={`Describe the ${excType.toLowerCase()}…`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Photo + Submit */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setPhotoAttached(true);
                  notify("Photo attached.");
                }}
              >
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
            <div className="px-5 py-10 text-center text-xs text-[#7B7B9D]">
              No past exceptions recorded.
            </div>
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
                  <DriverBadge
                    variant={e.status === "Resolved" ? "resolved" : "open"}
                    label={e.status}
                    showDot={false}
                  />
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
  );
}
