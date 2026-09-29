"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Truck, MapPin, AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RouteVehicle {
  id: string;
  plate: string;
  driver: string;
  brand: string;
  x: number;
  y: number;
  status: "on_schedule" | "delayed" | "idle";
  nextStop: string;
  eta: string;
}

const DEFAULT_VEHICLES: RouteVehicle[] = [
  {
    id: "v1",
    plate: "VEH001",
    driver: "Nimal Fernando",
    brand: "Waypoint Fresh",
    x: 260,
    y: 140,
    status: "on_schedule",
    nextStop: "Colombo Central OUT001",
    eta: "07:45 AM",
  },
  {
    id: "v2",
    plate: "VEH002",
    driver: "Chamara Silva",
    brand: "Waypoint Style",
    x: 420,
    y: 190,
    status: "delayed",
    nextStop: "Kandy Mall Bay OUT004",
    eta: "09:15 AM",
  },
  {
    id: "v3",
    plate: "VEH003",
    driver: "Ruwan Dias",
    brand: "Waypoint Tech",
    x: 150,
    y: 220,
    status: "on_schedule",
    nextStop: "Galle Road OUT007",
    eta: "08:30 AM",
  },
];

export function LiveRouteMap({
  vehicles = DEFAULT_VEHICLES,
  className,
}: {
  vehicles?: RouteVehicle[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-full h-[360px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#0c1824] via-[#0F1928] to-[#141b2b] border border-white/10 shadow-xl",
        className
      )}
    >
      {/* Background coordinate grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Distribution Route Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 600 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Hub to store path 1 */}
        <path
          d="M 120 80 Q 200 110 260 140 T 400 240"
          stroke="rgba(245, 197, 66, 0.4)"
          strokeWidth="2.5"
          strokeDasharray="6 4"
        />
        {/* Hub to store path 2 */}
        <path
          d="M 120 80 Q 300 130 420 190 T 520 280"
          stroke="rgba(75, 142, 245, 0.4)"
          strokeWidth="2.5"
          strokeDasharray="6 4"
        />
        {/* Hub to store path 3 */}
        <path
          d="M 120 80 Q 130 160 150 220 T 220 310"
          stroke="rgba(16, 185, 129, 0.4)"
          strokeWidth="2.5"
          strokeDasharray="6 4"
        />

        {/* Peliyagoda Central Depot Node */}
        <circle cx="120" cy="80" r="14" fill="rgba(245, 197, 66, 0.2)" stroke="#F5C542" strokeWidth="2" />
        <circle cx="120" cy="80" r="6" fill="#F5C542" />
      </svg>

      {/* Depot Marker Label */}
      <div
        className="absolute flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0F1928]/90 border border-white/20 text-white text-[10px] font-bold shadow-lg"
        style={{ left: "140px", top: "70px" }}
      >
        <span className="w-2 h-2 rounded-full bg-[#F5C542] animate-ping" />
        Peliyagoda Hub
      </div>

      {/* Floating Vehicles */}
      {vehicles.map((v) => {
        const isDelayed = v.status === "delayed";
        return (
          <div
            key={v.id}
            className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ left: `${v.x}px`, top: `${v.y}px` }}
          >
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shadow-lg transition-transform group-hover:scale-110",
                isDelayed
                  ? "bg-rose-500 text-white shadow-rose-500/40 ring-4 ring-rose-500/20"
                  : "bg-[#F5C542] text-[#0F1928] shadow-[0_0_16px_rgba(245,197,66,0.35)] ring-4 ring-[#F5C542]/20"
              )}
            >
              <Truck className="w-4 h-4" />
            </div>

            <div className="mt-1 px-2 py-0.5 rounded bg-[#0A121C]/90 border border-white/10 text-white text-[9px] font-bold whitespace-nowrap shadow-md group-hover:bg-[#0A121C] transition-colors">
              {v.plate} · {v.nextStop.split(" ")[0]}
            </div>
          </div>
        );
      })}

      {/* Map Overlay Stats Header */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>3 Live In-Transit</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-[#F5C542]" />
          <span>Fleet On-Time: 94.2%</span>
        </div>
      </div>
    </div>
  );
}
