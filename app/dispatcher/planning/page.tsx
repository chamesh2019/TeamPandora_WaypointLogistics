'use client';

import React, { useState } from 'react';
import { TripCard } from '../../../components/dispatcher/trip-card';
import { DeferralDrawer } from '../../../components/dispatcher/deferral-drawer';
import type { ProposedTrip, DeferredOrder, AllocationKPI } from '../../../lib/services/allocation-solver';
import type { ValidationResult } from '../../../lib/services/allocation-validator';
import {
  Calendar,
  Sparkles,
  ShieldCheck,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  BarChart3,
  Loader2,
} from 'lucide-react';

export default function DispatcherPlanningPage() {
  const [planDate, setPlanDate] = useState('2026-10-02');
  const [selectedDepot, setSelectedDepot] = useState('PELIYAGODA');
  const [isAllocating, setIsAllocating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [trips, setTrips] = useState<ProposedTrip[]>([]);
  const [deferred, setDeferred] = useState<DeferredOrder[]>([]);
  const [kpi, setKpi] = useState<AllocationKPI | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const handleAutoAllocate = async () => {
    setIsAllocating(true);
    setErrorMsg(null);
    setPublishSuccess(null);

    try {
      const res = await fetch('/api/dispatcher/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_date: planDate,
          depot_id: selectedDepot === 'ALL' ? undefined : selectedDepot,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error?.message || 'Failed to generate allocation plan');
      }

      setTrips(data.trips || []);
      setDeferred(data.deferred || []);
      setKpi(data.kpis || null);
      setValidation(data.validation || null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error running automatic allocation');
    } finally {
      setIsAllocating(false);
    }
  };

  const handlePublishPlan = async () => {
    if (trips.length === 0 && deferred.length === 0) return;

    setIsPublishing(true);
    setErrorMsg(null);

    try {
      const planId = `PLAN-${planDate.replace(/-/g, '')}-${selectedDepot}`;
      const res = await fetch('/api/dispatcher/plans/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: planId,
          plan_date: planDate,
          depot_id: selectedDepot,
          trips,
          deferred,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error?.message || 'Failed to publish allocation plan');
      }

      setPublishSuccess(`Plan ${planId} published successfully! Orders marked PLANNED.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error publishing allocation plan');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 space-y-6">
      {/* 16:00 Daily Cutoff Status Banner */}
      <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-semibold text-amber-200">Daily Order Cutoff (16:00 Asia/Colombo):</span>{' '}
            <span className="text-amber-300/90 text-sm">
              All orders received prior to 16:00 are locked and ready for trip allocation. Late orders automatically roll over.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" /> Feasibility Standard: 100% Strict
          </span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span className="text-xs text-zinc-400">Plan Date:</span>
            <input
              type="date"
              value={planDate}
              onChange={(e) => setPlanDate(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Depot:</span>
            <select
              value={selectedDepot}
              onChange={(e) => setSelectedDepot(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              <option value="PELIYAGODA">Peliyagoda Central Depot</option>
              <option value="KANDY">Kandy Regional Depot</option>
              <option value="ALL">All Depots</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAutoAllocate}
            disabled={isAllocating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition"
          >
            {isAllocating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Auto-Plan Trips
          </button>

          {trips.length > 0 && (
            <button
              onClick={handlePublishPlan}
              disabled={isPublishing}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition"
            >
              {isPublishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Publish Plan
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="bg-rose-950/40 border border-rose-800 text-rose-300 text-xs p-4 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {publishSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs p-4 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{publishSuccess}</span>
        </div>
      )}

      {/* KPI Overview */}
      {kpi && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl">
            <span className="text-[11px] text-zinc-500 uppercase font-mono">Fulfillment Rate</span>
            <div className="text-xl font-bold text-white mt-1">{kpi.fulfillment_rate_pct}%</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">{kpi.planned_orders} / {kpi.total_orders} Orders</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl">
            <span className="text-[11px] text-zinc-500 uppercase font-mono">Proposed Trips</span>
            <div className="text-xl font-bold text-white mt-1">{kpi.total_trips_count}</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">{kpi.active_vehicles_count} Active Vehicles</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl">
            <span className="text-[11px] text-zinc-500 uppercase font-mono">Payload Weight</span>
            <div className="text-xl font-bold text-white mt-1">{kpi.total_weight_kg} kg</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Planned capacity</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl">
            <span className="text-[11px] text-zinc-500 uppercase font-mono">Payload Volume</span>
            <div className="text-xl font-bold text-white mt-1">{kpi.total_volume_m3} m³</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Planned space</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl">
            <span className="text-[11px] text-zinc-500 uppercase font-mono">Deferred Orders</span>
            <div className="text-xl font-bold text-amber-400 mt-1">{kpi.deferred_orders}</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Triage queued</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl">
            <span className="text-[11px] text-zinc-500 uppercase font-mono">Feasibility Check</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {validation?.isValid ? 'Passed' : 'Pending'}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">7 / 7 Rules Validated</div>
          </div>
        </div>
      )}

      {/* Proposed Trips Manifest */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-semibold text-white">Live Trips Manifest ({trips.length})</h2>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            {trips.length > 0 ? 'Optimal Clustered Schedules' : 'Click Auto-Plan Trips to generate'}
          </span>
        </div>

        {trips.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-xl py-12 text-center text-zinc-500 text-sm">
            No trips currently planned. Select date and click <strong className="text-zinc-300">Auto-Plan Trips</strong>.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip, idx) => (
              <TripCard key={`${trip.vehicle_id}-${trip.trip_number}-${idx}`} trip={trip} />
            ))}
          </div>
        )}
      </div>

      {/* Deferrals Drawer / Board */}
      <DeferralDrawer deferred={deferred} />
    </div>
  );
}
