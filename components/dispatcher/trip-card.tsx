'use client';

import React from 'react';
import type { ProposedTrip } from '../../lib/services/allocation-solver';
import { Truck, Snowflake, MapPin, Clock, Weight, Box, ShieldCheck } from 'lucide-react';

interface TripCardProps {
  trip: ProposedTrip;
}

export function TripCard({ trip }: TripCardProps) {
  const isFresh = trip.brand.toUpperCase() === 'FRESH';
  const maxBudget = isFresh ? 270 : 480;
  const timeUtilizationPct = Math.min(100, (trip.duration_minutes / maxBudget) * 100);

  const getBrandBadgeClass = (brand: string) => {
    switch (brand.toUpperCase()) {
      case 'FRESH':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'STYLE':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'TECH':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white tracking-wide">{trip.vehicle_id}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                Trip {trip.trip_number}
              </span>
            </div>
            <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
              <span>{trip.vehicle_type.toUpperCase()}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {trip.vehicle_temp === 'reefer' && <Snowflake className="w-3 h-3 text-cyan-400" />}
                {trip.vehicle_temp}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getBrandBadgeClass(trip.brand)}`}>
            {trip.brand}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full border border-zinc-700 bg-zinc-800/80 text-zinc-300 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-zinc-400" />
            {trip.district}
          </span>
        </div>
      </div>

      {/* Utilization Metrics */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {/* Weight utilization */}
        <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-zinc-400 flex items-center gap-1">
              <Weight className="w-3.5 h-3.5 text-zinc-500" /> Weight
            </span>
            <span className="font-mono text-zinc-200">{trip.weight_utilization_pct}%</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                trip.weight_utilization_pct > 95 ? 'bg-amber-400' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, trip.weight_utilization_pct)}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 font-mono">{trip.total_weight_kg} kg payload</div>
        </div>

        {/* Volume utilization */}
        <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-zinc-400 flex items-center gap-1">
              <Box className="w-3.5 h-3.5 text-zinc-500" /> Volume
            </span>
            <span className="font-mono text-zinc-200">{trip.volume_utilization_pct}%</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                trip.volume_utilization_pct > 95 ? 'bg-amber-400' : 'bg-cyan-500'
              }`}
              style={{ width: `${Math.min(100, trip.volume_utilization_pct)}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 font-mono">{trip.total_volume_m3} m³ payload</div>
        </div>
      </div>

      {/* Time Budget Gauge */}
      <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/60">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-zinc-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-500" /> Time Budget ({isFresh ? 'Fresh 03:30–08:00' : 'Daytime'})
          </span>
          <span className="font-mono text-zinc-200">
            {trip.duration_minutes} / {maxBudget} min
          </span>
        </div>
        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              trip.duration_minutes > maxBudget
                ? 'bg-rose-500'
                : timeUtilizationPct > 85
                ? 'bg-amber-400'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, timeUtilizationPct)}%` }}
          />
        </div>
      </div>

      {/* Stop Sequence List */}
      <div className="pt-1">
        <div className="text-xs font-medium text-zinc-400 mb-2 flex items-center justify-between">
          <span>Delivery Sequence ({trip.stops.length} stops)</span>
          <span className="text-[11px] text-zinc-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Reverse Packed
          </span>
        </div>
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {trip.stops.map((stop) => (
            <div
              key={stop.order_id}
              className="flex items-center justify-between bg-zinc-950/40 px-3 py-2 rounded text-xs border border-zinc-800/40"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center font-mono text-[10px] text-zinc-300">
                  {stop.sequence_number}
                </span>
                <span className="text-zinc-200 font-medium">{stop.outlet_name || stop.outlet_id || stop.order_id}</span>
              </div>
              <div className="text-zinc-400 font-mono text-[11px]">
                {stop.weight} kg • {stop.volume} m³
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
