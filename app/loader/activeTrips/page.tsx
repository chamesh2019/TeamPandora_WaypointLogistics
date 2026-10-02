"use client";

import Header from "../../../components/layout/header";
import { Panel, StatCard } from "../../../components/design-system";
import {
  AlertTriangle,
  BarChart3,
  Check,
  Clock,
  Eye,
  LayoutGrid,
  Package,
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

const trips = [
  {
    id: "TRP-250614-01",
    vehicle: "WP NC-4872",
    driver: "N. Perera",
    stops: 12,
    progress: 9,
    departure: "03:30",
    status: "Loading" as const,
  },
  {
    id: "TRP-250614-02",
    vehicle: "CP LM-2194",
    driver: "S. Bandara",
    stops: 8,
    progress: 8,
    departure: "04:00",
    status: "Ready" as const,
  },
  {
    id: "TRP-250614-03",
    vehicle: "WP KL-8381",
    driver: "R. Silva",
    stops: 10,
    progress: 0,
    departure: "05:00",
    status: "Pending" as const,
  },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  Loading: { bg: "bg-[rgba(245,158,11,.12)]", text: "text-[#F59E0B]" },
  Ready: { bg: "bg-[rgba(16,185,129,.12)]", text: "text-[#10B981]" },
  Pending: { bg: "bg-[rgba(239,68,68,.12)]", text: "text-[#EF4444]" },
};

const progressColors: Record<string, string> = {
  Loading: "bg-[#F59E0B]",
  Ready: "bg-[#10B981]",
  Pending: "bg-[#D1D5DB]",
};

export default function LoaderActiveTripsPage() {
  return (
    <>
      <Header
        navItems={loaderNavItems}
        activeHref="/loader/activeTrips"
        brandName="Waypoint"
        brandSubtitle="Loader"
      />

      <div className="min-h-screen bg-[#E9EDF3] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-[20px] font-extrabold tracking-[-0.04em] text-[#0F1020] sm:text-[28px]">
                Active trips
              </h1>
              <p className="mt-1 text-[11px] text-[#747B93]">
                Today&apos;s loading schedule · Peliyagoda depot
              </p>
            </div>
          </div>

          {/* Stat Cards */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5 xl:[&>*]:min-w-[260px]">
            <StatCard
              icon={<Truck className="h-4 w-4" />}
              label="Trips today"
              value="3"
              note="2 loading · 1 pending"
              tone="blue"
              bars={metricBars.blue}
            />
            <StatCard
              icon={<Package className="h-4 w-4" />}
              label="Cartons total"
              value="340"
              note="Across 30 stops"
              tone="green"
              bars={metricBars.green}
            />
            <StatCard
              icon={<Clock className="h-4 w-4" />}
              label="First departure"
              value="03:30"
              note="TRP-250614-01"
              tone="purple"
              bars={metricBars.purple}
            />
            <StatCard
              icon={<Check className="h-4 w-4" />}
              label="Ready to depart"
              value="1"
              note="TRP-250614-02"
              tone="green"
              bars={metricBars.orange}
            />
          </section>

          {/* Trip Queue Table */}
          <div className="mt-6">
            <Panel>
              <div className="px-5 py-4 border-b border-[#E7EAF0]">
                <div className="text-[15px] font-bold text-[#0F1020] leading-tight">
                  Trip queue
                </div>
                <div className="mt-0.5 text-[10px] text-[#7B7B9D]">
                  Loading priority order
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E7EAF0]">
                      <th className="px-5 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7B7B9D]">
                        Trip ID
                      </th>
                      <th className="px-3 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7B7B9D]">
                        Vehicle
                      </th>
                      <th className="px-3 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7B7B9D]">
                        Driver
                      </th>
                      <th className="px-3 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7B7B9D]">
                        Stops
                      </th>
                      <th className="px-3 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7B7B9D]">
                        Progress
                      </th>
                      <th className="px-3 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7B7B9D]">
                        Departure
                      </th>
                      <th className="px-3 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-[#7B7B9D]">
                        Status
                      </th>
                      <th className="px-3 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {trips.map((trip) => {
                      const pct =
                        trip.stops > 0
                          ? (trip.progress / trip.stops) * 100
                          : 0;
                      const colors = statusColors[trip.status];
                      const barColor = progressColors[trip.status];

                      return (
                        <tr
                          key={trip.id}
                          className="border-b border-[#E7EAF0] last:border-b-0 hover:bg-[#F5F6FB] transition-colors"
                        >
                          <td className="px-5 py-3.5 text-[11px] font-semibold text-[#0F1020]">
                            {trip.id}
                          </td>
                          <td className="px-3 py-3.5 text-[11px] text-[#7B7B9D]">
                            {trip.vehicle}
                          </td>
                          <td className="px-3 py-3.5 text-[11px] font-bold text-[#0F1020]">
                            {trip.driver}
                          </td>
                          <td className="px-3 py-3.5 text-[11px] text-[#7B7B9D]">
                            {trip.stops} stops
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="h-[6px] w-20 rounded-full bg-[#E7EAF0] overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${barColor}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-semibold text-[#0F1020]">
                                {trip.progress}/{trip.stops}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3.5 text-[11px] text-[#7B7B9D]">
                            {trip.departure}
                          </td>
                          <td className="px-3 py-3.5">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${colors.bg} ${colors.text}`}
                            >
                              {trip.status}
                            </span>
                          </td>
                          <td className="px-3 py-3.5">
                            <button
                              type="button"
                              className="p-1 rounded-md hover:bg-[#E7EAF0] transition-colors"
                            >
                              <Eye className="h-4 w-4 text-[#7B7B9D]" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}
