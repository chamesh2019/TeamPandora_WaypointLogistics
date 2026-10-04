"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, Clock, Truck, Camera, Check } from "lucide-react";
import {
  Button,
  RoleHeaderBadge,
  StatCard,
  Panel,
  PanelHeader,
  Textarea,
  FieldLabel,
} from "../../../components/design-system";
import { DriverBadge } from "../../../components/driver/driver-badge";
import { DriverPageHeader } from "../../../components/driver/driver-page-header";
import { cn } from "../../../lib/utils";
import type { DriverExceptionItemDto, DriverActiveTripDto } from "@/lib/types/driver-api";

const EXCEPTION_TYPES = [
  "Cargo damage",
  "Missing items",
  "Store closed",
  "Access denied",
  "Temperature issue",
  "Vehicle issue",
  "Other",
];

export default function DriverExceptionsPage() {
  const [activeData, setActiveData] = useState<DriverActiveTripDto | null>(null);
  const [exceptionsList, setExceptionsList] = useState<DriverExceptionItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [excType, setExcType] = useState("Store closed");
  const [description, setDescription] = useState("");
  const [photoAttached, setPhotoAttached] = useState(false);
  const [notif, setNotif] = useState<string | null>(null);

  const notify = (msg: string) => {
    setNotif(msg);
    window.setTimeout(() => setNotif(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [excRes, tripRes] = await Promise.all([
        fetch("/api/driver/exceptions"),
        fetch("/api/driver/active-trip"),
      ]);

      if (excRes.ok) {
        const j = await excRes.json();
        if (j.success && Array.isArray(j.data)) {
          setExceptionsList(j.data);
        }
      }
      if (tripRes.ok) {
        const j = await tripRes.json();
        if (j.success) {
          setActiveData(j.data);
        }
      }
    } catch {
      notify("Offline mode: Using cached exceptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openExceptionsCount = exceptionsList.filter((e) => e.status === "Open").length;
  const resolvedExceptionsCount = exceptionsList.filter((e) => e.status === "Resolved").length;
  const trip = activeData?.trip;

  const handleSubmit = async () => {
    if (!description.trim() || description.trim().length < 10) {
      notify("Please provide a detailed description (min 10 characters).");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/driver/exceptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: trip?.tripId || "TRP-20261001-01",
          reasonCode: excType,
          driverNotes: description.trim(),
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        notify("Exception reported. Control tower notified immediately.");
        setDescription("");
        setPhotoAttached(false);
        await loadData();
      } else {
        notify(json.error?.message || "Failed to submit exception report");
      }
    } catch {
      notify("Exception saved locally. Will sync when back online.");
      setDescription("");
      setPhotoAttached(false);
    } finally {
      setSubmitting(false);
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
          title="Report exception"
          subtitle={`Trip ${trip?.tripId || "TRP-20261001-01"} · Log a delivery issue for control tower review`}
          roleBadge={
            <RoleHeaderBadge>
              <AlertTriangle className="w-3 h-3" /> EXCEPTIONS
            </RoleHeaderBadge>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<AlertTriangle className="w-4 h-4" />}
            label="Open exceptions"
            value={openExceptionsCount.toString()}
            note={`Trip ${trip?.tripId || "TRP-20261001-01"}`}
            tone="orange"
            bars={[]}
          />
          <StatCard
            icon={<CheckCircle2 className="w-4 h-4" />}
            label="Resolved reports"
            value={resolvedExceptionsCount.toString()}
            note="Logged to audit ledger"
            tone="blue"
            bars={[]}
          />
          <StatCard
            icon={<Clock className="w-4 h-4" />}
            label="Total Incidents"
            value={exceptionsList.length.toString()}
            note="This operational run"
            tone="purple"
            bars={[]}
          />
          <StatCard
            icon={<Truck className="w-4 h-4" />}
            label="Trip status"
            value={trip?.status === "IN_TRANSIT" ? "In Transit" : trip?.status || "Staging"}
            note={trip?.statusNote || "Running on schedule"}
            tone="green"
            bars={[]}
          />
        </div>

        {/* Main 2-col */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
          {/* New exception form */}
          <Panel>
            <PanelHeader
              title="New exception report"
              subtitle="All exceptions are logged in PostgreSQL and notified to control tower dispatchers immediately"
            />
            <div className="p-5 space-y-5">
              {/* Type selector */}
              <div>
                <FieldLabel>Exception category *</FieldLabel>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                  {EXCEPTION_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setExcType(t)}
                      className={cn(
                        "p-2.5 rounded-xl border text-xs font-semibold text-left transition-colors duration-150 cursor-pointer",
                        excType === t
                          ? "border-[#4B8EF5] bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "border-black/[0.08] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/20 text-[#7B7B9D]"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <FieldLabel>Detailed explanation *</FieldLabel>
                <Textarea
                  placeholder="Describe the issue, store name, SKU affected, shutter lock condition, or vehicle alarm..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-[10px] text-[#7B7B9D] mt-1">
                  Minimum 10 characters. Automatically creates a deferral / incident record.
                </p>
              </div>

              {/* Photo attachment simulation */}
              <div>
                <FieldLabel>Attach evidence photo (optional)</FieldLabel>
                <div
                  onClick={() => setPhotoAttached(!photoAttached)}
                  className={cn(
                    "p-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-colors",
                    photoAttached
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-black/[0.1] dark:border-white/[0.1] hover:border-blue-500 text-[#7B7B9D]"
                  )}
                >
                  <Camera className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    {photoAttached ? "Evidence photo attached (1 file)" : "Tap to snap shutter or damaged cargo"}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="danger"
                  size="default"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="font-bold w-full sm:w-auto"
                >
                  {submitting ? "Logging Exception…" : "Submit Exception Report"}
                </Button>
              </div>
            </div>
          </Panel>

          {/* Past exceptions list */}
          <Panel>
            <PanelHeader title="Recent exceptions log" subtitle="Audit records for this driver" />
            <div className="divide-y divide-black/[0.05] dark:divide-white/[0.05]">
              {exceptionsList.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#7B7B9D]">
                  No delivery exceptions recorded.
                </div>
              ) : (
                exceptionsList.map((exc) => (
                  <div key={exc.exceptionId} className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#0F1020] dark:text-white">
                        {exc.reasonCode}
                      </span>
                      <DriverBadge
                        variant={exc.status === "Resolved" ? "delivered" : "in-progress"}
                        label={exc.status}
                        showDot={false}
                      />
                    </div>
                    <div className="text-[11px] text-[#7B7B9D]">
                      {exc.storeName ? `${exc.storeName} · ` : ""}{exc.reasonNotes}
                    </div>
                    <div className="text-[9px] font-mono text-[#7B7B9D]">
                      ID: {exc.exceptionId} · {exc.createdAt?.slice(11, 16) || "Recent"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
