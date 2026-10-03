"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  GitFork,
  Route,
  Truck,
  Radio,
  AlertTriangle,
  Users,
  BarChart3,
  Sparkles,
  Search,
  Clock,
  Bell,
  Settings,
  RotateCw,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  X,
  Check,
  ShieldAlert,
  ArrowRight,
  Info,
  Calendar,
} from "lucide-react";

interface OperationalException {
  id: string;
  refCode: string;
  tripRef: string;
  title: string;
  subtitle: string;
  severity: "High" | "Medium" | "Low";
  status: "Open" | "Escalated" | "Resolved";
  time: string;
  dotColor: "red" | "amber" | "blue";
  rootCause: string;
  suggestedAction: string;
}

const INITIAL_EXCEPTIONS: OperationalException[] = [
  {
    id: "EXC-250613-018",
    refCode: "EXC-250613-018",
    tripRef: "TRP-250613-07",
    title: "Late arrival risk",
    subtitle: "82% ML risk · Window closes 08:00",
    severity: "High",
    status: "Open",
    time: "06:44",
    dotColor: "red",
    rootCause: "Heavy congestion near Kandy Lake Round; traffic speed reduced to 8 km/h.",
    suggestedAction: "Reroute driver via Tennekumbura bypass to preserve delivery window.",
  },
  {
    id: "EXC-250613-017",
    refCode: "EXC-250613-017",
    tripRef: "WP NC-3308",
    title: "Fuel quota warning",
    subtitle: "Proposed route exceeds quota by 8%",
    severity: "Medium",
    status: "Open",
    time: "06:38",
    dotColor: "amber",
    rootCause: "Sub-optimal multi-drop sequencing requested for southern retail stores.",
    suggestedAction: "Re-sequence stops to drop coastal corridor first, saving 14 km of travel.",
  },
  {
    id: "EXC-250613-016",
    refCode: "EXC-250613-016",
    tripRef: "Peliyagoda depot",
    title: "Reefer shortfall",
    subtitle: "3 chilled orders unassigned to reefer vehicle",
    severity: "High",
    status: "Open",
    time: "06:22",
    dotColor: "red",
    rootCause: "Available chilled volume exceeded by 4.8 m³ due to sudden supermarket order spike.",
    suggestedAction: "Allocate secondary reefer vehicle WP NC-4872 for rapid consolidation trip.",
  },
  {
    id: "EXC-250613-015",
    refCode: "EXC-250613-015",
    tripRef: "TRP-250612-09",
    title: "Delivery window breach",
    subtitle: "Store closed on arrival · POD not collected",
    severity: "Medium",
    status: "Escalated",
    time: "Yesterday 09:14",
    dotColor: "amber",
    rootCause: "Store keyholder arrived 45 minutes late; driver forced to idle outside dock.",
    suggestedAction: "Escalated to Area Retail Ops Manager for penalty waiver & rescheduling.",
  },
  {
    id: "EXC-250613-014",
    refCode: "EXC-250613-014",
    tripRef: "TRP-250612-04",
    title: "Cargo damage",
    subtitle: "2 cartons damaged · Driver reported on arrival",
    severity: "Low",
    status: "Resolved",
    time: "Yesterday 08:52",
    dotColor: "blue",
    rootCause: "Cardboard deformation due to excessive pallet strapping tension at loading bay 3.",
    suggestedAction: "Replacement cartons dispatched from Central Warehouse; credit note issued.",
  },
];

export default function DispatcherExceptionsPage() {
  const [exceptions, setExceptions] = useState<OperationalException[]>(INITIAL_EXCEPTIONS);
  const [severityFilter, setSeverityFilter] = useState<"All" | "High" | "Medium" | "Low">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [selectedException, setSelectedException] = useState<OperationalException | null>(null);
  const [resolvingException, setResolvingException] = useState<OperationalException | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered exceptions
  const filteredExceptions = useMemo(() => {
    return exceptions.filter((ex) => {
      const matchesSeverity = severityFilter === "All" || ex.severity === severityFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ex.title.toLowerCase().includes(q) ||
        ex.subtitle.toLowerCase().includes(q) ||
        ex.refCode.toLowerCase().includes(q) ||
        ex.tripRef.toLowerCase().includes(q);
      return matchesSeverity && matchesSearch;
    });
  }, [exceptions, severityFilter, searchQuery]);

  // Metric counts
  const openCount = exceptions.filter((e) => e.status === "Open").length;
  const escalatedCount = exceptions.filter((e) => e.status === "Escalated").length;
  const resolvedCount = exceptions.filter((e) => e.status === "Resolved").length;

  // Handle Resolve Action
  const handleConfirmResolve = () => {
    if (!resolvingException) return;
    setExceptions((prev) =>
      prev.map((e) => {
        if (e.id === resolvingException.id) {
          return {
            ...e,
            status: "Resolved",
            dotColor: "blue",
          };
        }
        return e;
      })
    );
    triggerToast(`Exception ${resolvingException.refCode} marked as Resolved`);
    setResolvingException(null);
    setResolutionNote("");
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0F1928] text-white px-4 py-3 rounded-lg shadow-xl border border-[#F5C542]/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#F5C542]" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      

      {/* ========================================================= */}
      {/* 2. MAIN EXCEPTIONS CONTENT CONTAINER */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-[1550px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-5">
        {/* SUBHEADER: Title & Refresh Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Exceptions</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Operational alerts requiring attention
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Refresh Button */}
            <button
              onClick={() => triggerToast("Refreshed live exceptions queue")}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-600" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 4 KPI METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Open */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Open</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {openCount}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Require immediate action
              </div>
            </div>
            {/* 10 graduated bars */}
            <div className="flex items-end gap-1.5 h-8 mt-3">
              {[25, 35, 45, 40, 58, 52, 65, 70, 64].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-[#FEF3C7] rounded-xs"
                />
              ))}
              <div style={{ height: "100%" }} className="flex-1 bg-[#F59E0B] rounded-xs" />
            </div>
          </div>

          {/* Card 2: Escalated */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Escalated</span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {escalatedCount}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Under management review
              </div>
            </div>
            {/* 10 graduated bars */}
            <div className="flex items-end gap-1.5 h-8 mt-3">
              {[20, 30, 38, 48, 42, 60, 54, 68, 62].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-[#EDE9FE] rounded-xs"
                />
              ))}
              <div style={{ height: "100%" }} className="flex-1 bg-[#7C3AED] rounded-xs" />
            </div>
          </div>

          {/* Card 3: Resolved today */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Resolved today</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                {resolvedCount}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Within SLA</div>
            </div>
            {/* 10 graduated bars */}
            <div className="flex items-end gap-1.5 h-8 mt-3">
              {[28, 38, 48, 42, 60, 52, 68, 62, 80].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-[#D1FAE5] rounded-xs"
                />
              ))}
              <div style={{ height: "100%" }} className="flex-1 bg-[#10B981] rounded-xs" />
            </div>
          </div>

          {/* Card 4: Avg resolution */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Avg resolution</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                47 min
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Last 30 days</div>
            </div>
            {/* 10 graduated bars */}
            <div className="flex items-end gap-1.5 h-8 mt-3">
              {[30, 42, 38, 55, 60, 52, 68, 62, 75].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-[#D9E8F9] rounded-xs"
                />
              ))}
              <div style={{ height: "100%" }} className="flex-1 bg-[#2563EB] rounded-xs" />
            </div>
          </div>
        </div>

        {/* MAIN EXCEPTIONS LIST CARD */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Header Controls: Filters & Search */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5">
              {(["All", "High", "Medium", "Low"] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    severityFilter === sev
                      ? "bg-slate-100 text-slate-900 font-bold border border-slate-300/80"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 w-full sm:w-56 focus:outline-none focus:border-[#F5C542] transition-all"
              />
            </div>
          </div>

          {/* Exceptions Rows List */}
          <div className="divide-y divide-slate-100">
            {filteredExceptions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No exceptions found matching the criteria.
              </div>
            ) : (
              filteredExceptions.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => setSelectedException(ex)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  {/* Left Side: Dot, Icon, Title, Subtitle, Reference */}
                  <div className="flex items-start sm:items-center gap-3">
                    {/* Severity Indicator Dot */}
                    <div className="pt-2 sm:pt-0 shrink-0">
                      {ex.dotColor === "red" && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 block" />
                      )}
                      {ex.dotColor === "amber" && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 block" />
                      )}
                      {ex.dotColor === "blue" && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 block" />
                      )}
                    </div>

                    {/* Icon Box */}
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                        ex.dotColor === "red"
                          ? "bg-rose-50 text-rose-600 border-rose-100"
                          : ex.dotColor === "amber"
                          ? "bg-amber-50 text-amber-600 border-amber-100"
                          : "bg-blue-50 text-blue-600 border-blue-100"
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </div>

                    {/* Text Details */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">
                          {ex.title}
                        </span>
                        {/* Status Badge */}
                        {ex.status === "Open" && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium px-2 py-0.2 rounded-full">
                            Open
                          </span>
                        )}
                        {ex.status === "Escalated" && (
                          <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-medium px-2 py-0.2 rounded-full">
                            Escalated
                          </span>
                        )}
                        {ex.status === "Resolved" && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium px-2 py-0.2 rounded-full">
                            Resolved
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 mt-0.5">{ex.subtitle}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Ref: {ex.tripRef} · {ex.refCode}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Timestamp & Resolve Button */}
                  <div
                    className="flex items-center justify-between sm:justify-end gap-3 pl-5 sm:pl-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-xs text-slate-400 font-mono">{ex.time}</span>
                    {ex.status !== "Resolved" ? (
                      <button
                        onClick={() => setResolvingException(ex)}
                        className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold px-3 py-1 rounded-md shadow-xs transition-colors cursor-pointer"
                      >
                        Resolve
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-600 font-medium px-2 py-1">
                        ✓ Resolved
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* MODAL 1: Exception Details & Root Cause */}
      {selectedException && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedException.title}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {selectedException.refCode} · {selectedException.tripRef}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedException(null)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-3.5 text-xs text-slate-600">
              <div>
                <span className="font-bold text-slate-700 block mb-0.5">Overview Alert:</span>
                <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {selectedException.subtitle}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-0.5">Root Cause:</span>
                <p className="bg-rose-50/60 text-slate-700 p-2.5 rounded-lg border border-rose-200/60">
                  {selectedException.rootCause}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-0.5">
                  AI Recommended Action:
                </span>
                <p className="bg-emerald-50/60 text-slate-700 p-2.5 rounded-lg border border-emerald-200/60">
                  {selectedException.suggestedAction}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-mono">
                Reported at {selectedException.time}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedException(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
                {selectedException.status !== "Resolved" && (
                  <button
                    onClick={() => {
                      const target = selectedException;
                      setSelectedException(null);
                      setResolvingException(target);
                    }}
                    className="px-4 py-1.5 text-xs font-bold bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] rounded-lg shadow-sm"
                  >
                    Take Action
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Resolve Exception */}
      {resolvingException && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Resolve {resolvingException.title}</span>
              </h3>
              <button
                onClick={() => setResolvingException(null)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <p className="text-slate-600">
                Confirm resolution for <strong>{resolvingException.refCode}</strong>. Select the mitigation action applied:
              </p>

              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="mitigation"
                    defaultChecked
                    className="text-[#F5C542] focus:ring-[#F5C542]"
                  />
                  <span>Applied AI Recommended Reroute / Capacity Assignment</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="mitigation"
                    className="text-[#F5C542] focus:ring-[#F5C542]"
                  />
                  <span>Manual Overridden by Lead Dispatcher Kasun Perera</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="mitigation"
                    className="text-[#F5C542] focus:ring-[#F5C542]"
                  />
                  <span>Escalated & Handed over to Retail Store Operations</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Resolution Log Note (Optional):
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Driver confirmed alternate road segment clearance..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#F5C542]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setResolvingException(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolve}
                className="px-4 py-1.5 text-xs font-bold bg-[#F5C542] hover:bg-[#E5B532] text-[#0F1928] rounded-lg shadow-sm"
              >
                Confirm Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
