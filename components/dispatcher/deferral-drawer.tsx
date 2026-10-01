'use client';

import React from 'react';
import type { DeferredOrder, DeferralReasonCode } from '../../lib/services/allocation-solver';
import { AlertCircle, Flame, Snowflake, Truck, Clock, ShieldAlert } from 'lucide-react';

interface DeferralDrawerProps {
  deferred: DeferredOrder[];
}

export function DeferralDrawer({ deferred }: DeferralDrawerProps) {
  const getReasonBadge = (reason: DeferralReasonCode) => {
    switch (reason) {
      case 'CAPACITY_WEIGHT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-3 h-3" /> CAPACITY_WEIGHT
          </span>
        );
      case 'CAPACITY_VOLUME':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-3 h-3" /> CAPACITY_VOLUME
          </span>
        );
      case 'TIME_BUDGET_EXCEEDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Clock className="w-3 h-3" /> TIME_BUDGET_EXCEEDED
          </span>
        );
      case 'NO_REEFER_AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Snowflake className="w-3 h-3" /> NO_REEFER_AVAILABLE
          </span>
        );
      case 'NO_VAN_AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Truck className="w-3 h-3" /> NO_VAN_AVAILABLE
          </span>
        );
      case 'WORKSHOP_FLEET_SHORTAGE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <ShieldAlert className="w-3 h-3" /> WORKSHOP_FLEET_SHORTAGE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300">
            {reason}
          </span>
        );
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white">Deferred Orders Board ({deferred.length})</h3>
        </div>
        <span className="text-xs text-zinc-400 font-mono">
          Automatic Anti-Starvation Tracking Active
        </span>
      </div>

      {deferred.length === 0 ? (
        <div className="py-8 text-center text-zinc-500 text-sm">
          No deferred orders for this planning cycle. 100% orders fulfilled.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/60 text-zinc-400 font-mono uppercase text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Outlet</th>
                <th className="py-2.5 px-3">Brand & District</th>
                <th className="py-2.5 px-3">Payload</th>
                <th className="py-2.5 px-3">Reason Code</th>
                <th className="py-2.5 px-3">Anti-Starvation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {deferred.map((item) => {
                const isStarving = item.notes?.includes('yesterday') || false;
                return (
                  <tr key={item.order_id} className="hover:bg-zinc-800/30 transition">
                    <td className="py-2.5 px-3 font-mono font-medium text-white">{item.order_id}</td>
                    <td className="py-2.5 px-3 text-zinc-200">
                      {item.outlet_name || item.outlet_id || 'Outlet'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-zinc-300">{item.brand}</span>
                      <span className="text-zinc-500 ml-1">({item.district})</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-zinc-400">
                      {item.weight} kg • {item.volume} m³
                    </td>
                    <td className="py-2.5 px-3">{getReasonBadge(item.reason_code)}</td>
                    <td className="py-2.5 px-3">
                      {isStarving ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                          <Flame className="w-3 h-3 text-red-400" /> Deferred Yesterday (+1000)
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-[11px]">Normal Priority</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
