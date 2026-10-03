"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "../../components/layout/header";
import { Button, Panel, StatCard } from "../../components/design-system";
import { useSession } from "../../lib/auth-client";
import ReportShortfallForm from "./shortfails/report-shortfall-form";
import type {
  LoaderOverviewDto,
  LoaderTripSummary,
  LoaderManifestDto,
} from "../../lib/types/loader-api";
import {
  AlertTriangle,
  BarChart3,
  Check,
  CheckCircle2,
  Clock,
  LayoutGrid,
  Loader2,
  Package,
  RefreshCw,
  Snowflake,
  Truck,
} from "lucide-react";

const loaderNavItems = [
  { name: "Overview", href: "/loader", icon: LayoutGrid },
  { name: "Active Trips", href: "/loader/activeTrips", icon: Truck },
  { name: "Manifests", href: "/loader/manifests", icon: Package },
  { name: "Shortfalls", href: "/loader/shortfails", icon: AlertTriangle },
  { name: "Reports", href: "/loader/reports", icon: BarChart3 },
];

const metricBars = {
  blue: [22, 34, 28, 36, 42, 48, 54],
  green: [18, 26, 30, 36, 42, 38, 48],
  purple: [14, 18, 23, 28, 34, 30, 36],
  orange: [16, 21, 24, 30, 34, 32, 28],
};

export default function LoaderPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || session?.user?.username || "Sunil Jayasinghe";

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
        ? "Good afternoon"
        : "Good evening";

  const [overview, setOverview] = useState<LoaderOverviewDto | null>(null);
  const [activeTrip, setActiveTrip] = useState<LoaderTripSummary | null>(null);
  const [manifest, setManifest] = useState<LoaderManifestDto | null>(null);
  const [checkedStops, setCheckedStops] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [overviewRes, tripsRes] = await Promise.all([
        fetch("/api/loader/overview"),
        fetch("/api/loader/trips"),
      ]);

      const overviewJson = await overviewRes.json();
      const tripsJson = await tripsRes.json();

      if (overviewRes.ok && overviewJson.success) {
        setOverview(overviewJson.data);
      }

      let primaryTrip: LoaderTripSummary | null = null;
      if (tripsRes.ok && tripsJson.success && Array.isArray(tripsJson.data) && tripsJson.data.length > 0) {
        const trips = tripsJson.data as LoaderTripSummary[];
        primaryTrip = trips.find((t) => t.status === "Loading") || trips[0];
        setActiveTrip(primaryTrip);
      }

      const targetTripId = primaryTrip?.tripId || "TRP-250613-11";
      const manifestRes = await fetch(`/api/loader/manifests/${targetTripId}`);
      const manifestJson = await manifestRes.json();

      if (manifestRes.ok && manifestJson.success && manifestJson.data) {
        const m = manifestJson.data as LoaderManifestDto;
        setManifest(m);

        if (m.status === "VERIFIED") {
          setVerifySuccess(true);
          const allStopNums = new Set(m.stops.map((s) => s.stopSequence));
          setCheckedStops(allStopNums);
        } else {
          const verifiedStops = new Set<number>();
          m.stops.forEach((s) => {
            if (s.isVerified) verifiedStops.add(s.stopSequence);
          });
          setCheckedStops(verifiedStops);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleStop = (stopNum: number) => {
    setCheckedStops((prev) => {
      const next = new Set(prev);
      if (next.has(stopNum)) {
        next.delete(stopNum);
      } else {
        next.add(stopNum);
      }
      return next;
    });
  };

  const handleCompleteLoading = async () => {
    const tripId = manifest?.tripId || activeTrip?.tripId;
    if (!tripId) return;

    setIsVerifying(true);
    try {
      const res = await fetch(`/api/loader/manifests/${tripId}/verify`, {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setVerifySuccess(true);
        if (manifest) {
          setManifest({ ...manifest, status: "VERIFIED" });
          const allStops = new Set(manifest.stops.map((s) => s.stopSequence));
          setCheckedStops(allStops);
        }
      } else {
        alert(json?.error?.message || "Failed to complete loading verification");
      }
    } catch {
      alert("Network error completing loading verification");
    } finally {
      setIsVerifying(false);
    }
  };

  const totalStops = manifest?.stops.length || 6;
  const completedCount = checkedStops.size;
  const progressPercent = totalStops > 0 ? (completedCount / totalStops) * 100 : 0;

  const isReefer =
    manifest?.vehicleTemp === "reefer" ||
    manifest?.vehicleType?.toLowerCase().includes("reefer") ||
    activeTrip?.vehicleTemp === "reefer" ||
    activeTrip?.vehicleType?.toLowerCase().includes("reefer");

  const vehicleId = manifest?.vehicleId || activeTrip?.vehicleId || "WP NC-4872";
  const depotName = (overview?.depotId || "Peliyagoda").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  const tripDisplayId = manifest?.tripId || activeTrip?.tripId || "TRP-250613-11";

  const totalWeight = manifest?.totalWeightKg || activeTrip?.totalWeightKg || 2550;
  const maxWeight = manifest?.weightCapKg || 5000;
  const totalVolume = manifest?.totalVolumeM3 || activeTrip?.totalVolumeM3 || 12.9;
  const maxVolume = manifest?.volumeCapM3 || 26;

  return (
    <>
      <Header
        navItems={loaderNavItems}
        activeHref="/loader"
        brandName="Waypoint"
        brandSubtitle="Loader"
      />

      <div className="min-h-screen bg-[#E9EDF3] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          {/* Header */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-[20px] font-extrabold tracking-[-0.04em] text-[#0F1020] sm:text-[28px]">
                {greeting}, {userName}
              </h1>
              <p className="mt-1 text-[11px] text-[#747B93]">
                {depotName} loading bay · Trip {tripDisplayId}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => loadData()}
                disabled={isLoading}
                className="px-3 py-2 text-[12px] font-semibold"
                title="Refresh dashboard"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setReportModalOpen(true)}
                className="px-4 py-2.5 text-[12px] font-bold"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Report shortfall
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-[12px] bg-red-50 p-4 border border-red-200 flex items-center justify-between">
              <span className="text-[12px] font-medium text-red-600">{error}</span>
              <Button type="button" variant="secondary" onClick={() => loadData()} className="text-xs">
                Retry
              </Button>
            </div>
          )}

          {/* Stat Cards */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5 xl:[&>*]:min-w-[260px]">
            <StatCard
              icon={<Truck className="h-4 w-4" />}
              label="Active bays"
              value={overview ? String(overview.activeBaysCount) : "4"}
              note={overview ? `${overview.loadingBaysCount} loading now` : "2 loading now"}
              tone="blue"
              bars={metricBars.blue}
            />
            <StatCard
              icon={<Package className="h-4 w-4" />}
              label="Cartons staged"
              value={overview ? String(overview.cartonsStaged) : "284"}
              note={overview ? `${overview.cartonsVerifiedPct}% verified` : "86% verified"}
              tone="green"
              bars={metricBars.green}
            />
            <StatCard
              icon={<Clock className="h-4 w-4" />}
              label="Time to departure"
              value={overview ? `${overview.departureEtaMin} min` : "38 min"}
              note="Loading on schedule"
              tone="purple"
              bars={metricBars.purple}
            />
            <StatCard
              icon={<AlertTriangle className="h-4 w-4" />}
              label="Shortfalls"
              value={
                manifest
                  ? String(manifest.stops.filter((s) => s.hasShortfall).length)
                  : String(Math.round(overview?.shortfallRatePct || 1.2))
              }
              note="Awaiting decision"
              tone="orange"
              bars={metricBars.orange}
            />
          </section>

          {/* Main Content: Manifest + Vehicle */}
          <div className="mt-6 grid gap-4 xl:grid-cols-[1.7fr_1fr]">
            {/* LIFO Loading Manifest */}
            <Panel>
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7EAF0]">
                <div>
                  <div className="text-[15px] font-bold text-[#0F1020] leading-tight">
                    LIFO loading manifest
                  </div>
                  <div className="mt-0.5 text-[10px] text-[#7B7B9D]">
                    Load final stop first · Stop 1 last by the doors
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {verifySuccess && (
                    <span className="inline-flex items-center gap-1 rounded-[6px] bg-[#E8F8EE] px-2.5 py-1 text-[10px] font-bold text-[#10B981]">
                      <Check className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-[6px] bg-[#FFF8E1] px-2.5 py-1 text-[10px] font-bold text-[#F59E0B]">
                    {manifest?.bayNumber || "Bay 01"}
                  </span>
                </div>
              </div>

              <div className="px-5 pb-2">
                {isLoading && !manifest ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-[#4B8EF5]" />
                  </div>
                ) : manifest && manifest.stops.length > 0 ? (
                  manifest.stops.map((item) => (
                    <div
                      key={item.stopId || item.stopSequence}
                      className="flex items-center gap-3 border-b border-[#E7EAF0] py-3.5 last:border-b-0"
                    >
                      <button
                        type="button"
                        onClick={() => toggleStop(item.stopSequence)}
                        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          checkedStops.has(item.stopSequence) || item.isVerified || verifySuccess
                            ? "border-[#22C55E] bg-[#22C55E]"
                            : "border-[#D1D5DB] hover:border-[#9CA3AF]"
                        }`}
                      >
                        {(checkedStops.has(item.stopSequence) || item.isVerified || verifySuccess) && (
                          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold text-[#0F1020]">
                            Stop {item.stopSequence} · {item.outletName}
                          </span>
                          {item.hasShortfall && (
                            <span className="inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                              Shortfall flagged
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#7B7B9D]">
                          {item.cartonsCount} cartons · {item.weightKg} kg
                        </div>
                      </div>
                      <div className="text-[10px] text-[#7B7B9D] text-right whitespace-nowrap">
                        {item.locationHint || (item.tempRequirement === "CHILLED" ? "Chilled · front" : "Ambient · bay center")}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-[12px] text-[#7B7B9D]">
                    No loading stops queued for this trip.
                  </div>
                )}
              </div>

              {/* Loading Progress */}
              <div className="border-t border-[#E7EAF0] px-5 py-3.5">
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="font-semibold text-[#4B8EF5]">Loading progress</span>
                  <span className="font-bold text-[#0F1020]">{completedCount} / {totalStops} stops</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#E7EAF0] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#22C55E] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </Panel>

            {/* Vehicle Details */}
            <Panel>
              <div className="px-5 py-4 border-b border-[#E7EAF0]">
                <div className="text-[15px] font-bold text-[#0F1020] leading-tight">
                  Vehicle details
                </div>
                <div className="mt-0.5 text-[10px] text-[#7B7B9D]">
                  Ready at {manifest?.bayNumber || "Bay 01"}
                </div>
              </div>

              <div className="flex flex-col items-center px-5 py-6">
                {/* Truck Icon */}
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F0F2F5] mb-3">
                  <Truck className="h-7 w-7 text-[#0F1020]" />
                </div>

                <div className="text-[18px] font-extrabold tracking-[-0.04em] text-[#0F1020] mb-2">
                  {vehicleId}
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold mb-6 ${
                    isReefer
                      ? "bg-[#E0F7F7] text-[#0D9488]"
                      : "bg-[#F3F4F6] text-[#4B5563]"
                  }`}
                >
                  {isReefer && <Snowflake className="h-3 w-3" />}
                  {isReefer ? "Reefer truck" : "Ambient truck"}
                </span>

                {/* Weight / Volume */}
                <div className="grid w-full grid-cols-2 gap-3 mb-6">
                  <div className="rounded-[10px] border border-[#E7EAF0] p-3">
                    <div className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#7B7B9D]">
                      Weight
                    </div>
                    <div className="mt-1 text-[13px] font-extrabold text-[#0F1020]">
                      {Math.round(totalWeight).toLocaleString()} / {Math.round(maxWeight).toLocaleString()} kg
                    </div>
                  </div>
                  <div className="rounded-[10px] border border-[#E7EAF0] p-3">
                    <div className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#7B7B9D]">
                      Volume
                    </div>
                    <div className="mt-1 text-[13px] font-extrabold text-[#0F1020]">
                      {Number(totalVolume).toFixed(1)} / {Math.round(maxVolume)} m³
                    </div>
                  </div>
                </div>

                {/* Complete Loading Button */}
                <Button
                  type="button"
                  variant={verifySuccess || manifest?.status === "VERIFIED" ? "secondary" : "primary"}
                  onClick={handleCompleteLoading}
                  disabled={isVerifying || verifySuccess || manifest?.status === "VERIFIED"}
                  className="w-full min-h-[44px] px-4 py-3 text-[13px] font-bold flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying load...
                    </>
                  ) : verifySuccess || manifest?.status === "VERIFIED" ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                      Manifest verified & staged
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Complete loading
                    </>
                  )}
                </Button>
              </div>
            </Panel>
          </div>
        </div>
      </div>

      {reportModalOpen && (
        <ReportShortfallForm
          onClose={() => setReportModalOpen(false)}
          onSuccess={() => {
            setReportModalOpen(false);
            loadData();
          }}
          initialTripId={manifest?.tripId || activeTrip?.tripId}
        />
      )}
    </>
  );
}
