"use client";

import Header from "../../components/layout/header";
import { Button, Panel, StatCard } from "../../components/design-system";
import { useSession } from "../../lib/auth-client";
import {
  AlertTriangle,
  BarChart3,
  Check,
  Clock,
  LayoutGrid,
  Package,
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

const manifestStops = [
  {
    stop: 6,
    name: "Fresh — Nugegoda",
    cartons: 18,
    weight: 324,
    zone: "Chilled · front of hold",
  },
  {
    stop: 5,
    name: "Fresh — Dehiwala",
    cartons: 12,
    weight: 216,
    zone: "Chilled · bay B-14",
  },
  {
    stop: 4,
    name: "Fresh — Wellawatte",
    cartons: 24,
    weight: 446,
    zone: "Ambient · bay A-08",
  },
];

export default function LoaderPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || session?.user?.username || "User";

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
        ? "Good afternoon"
        : "Good evening";

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
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-[20px] font-extrabold tracking-[-0.04em] text-[#0F1020] sm:text-[28px]">
                {greeting}, {userName}
              </h1>
              <p className="mt-1 text-[11px] text-[#747B93]">
                Peliyagoda loading bay · Trip TRP-250613-11
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="px-4 py-2.5 text-[12px] font-bold"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Report shortfall
            </Button>
          </div>

          {/* Stat Cards */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5 xl:[&>*]:min-w-[260px]">
            <StatCard
              icon={<Truck className="h-4 w-4" />}
              label="Active bays"
              value="4"
              note="2 loading now"
              tone="blue"
              bars={metricBars.blue}
            />
            <StatCard
              icon={<Package className="h-4 w-4" />}
              label="Cartons staged"
              value="284"
              note="86% verified"
              tone="green"
              bars={metricBars.green}
            />
            <StatCard
              icon={<Clock className="h-4 w-4" />}
              label="Time to departure"
              value="38 min"
              note="Loading on schedule"
              tone="purple"
              bars={metricBars.purple}
            />
            <StatCard
              icon={<AlertTriangle className="h-4 w-4" />}
              label="Shortfalls"
              value="2"
              note="1 awaiting decision"
              tone="orange"
              bars={metricBars.orange}
            />
          </section>

          {/* Main Content: Manifest + Vehicle */}
          <div className="mt-6 grid gap-4 xl:grid-cols-[1.7fr_1fr]">
            {/* LIFO Loading Manifest */}
            <Panel>
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <div className="text-[15px] font-bold text-[#0F1020] leading-tight">
                    LIFO loading manifest
                  </div>
                  <div className="mt-0.5 text-[10px] text-[#7B7B9D]">
                    Load final stop first · Stop 1 last by the doors
                  </div>
                </div>
                <span className="inline-flex items-center rounded-[6px] bg-[#FFF8E1] px-2.5 py-1 text-[10px] font-bold text-[#F59E0B]">
                  Bay 03
                </span>
              </div>

              <div className="px-5 pb-2">
                {manifestStops.map((item) => (
                  <div
                    key={item.stop}
                    className="flex items-center gap-3 border-b border-[#E7EAF0] py-3.5 last:border-b-0"
                  >
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#D1D5DB]" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-bold text-[#0F1020]">
                        Stop {item.stop} · {item.name}
                      </div>
                      <div className="text-[10px] text-[#7B7B9D]">
                        {item.cartons} cartons · {item.weight} kg
                      </div>
                    </div>
                    <div className="text-[10px] text-[#7B7B9D] text-right whitespace-nowrap">
                      {item.zone}
                    </div>
                  </div>
                ))}
              </div>

              {/* Loading Progress */}
              <div className="border-t border-[#E7EAF0] px-5 py-3.5">
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="font-semibold text-[#4B8EF5]">Loading progress</span>
                  <span className="font-bold text-[#0F1020]">0 / 6 stops</span>
                </div>
                <div className="h-1 w-full rounded-full bg-[#E7EAF0] overflow-hidden">
                  <div className="h-full rounded-full bg-[#F5C542]" style={{ width: "0%" }} />
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
                  Ready at Bay 03
                </div>
              </div>

              <div className="flex flex-col items-center px-5 py-6">
                {/* Truck Icon */}
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F0F2F5] mb-3">
                  <Truck className="h-7 w-7 text-[#0F1020]" />
                </div>

                <div className="text-[18px] font-extrabold tracking-[-0.04em] text-[#0F1020] mb-2">
                  WP NC-4872
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E0F7F7] px-3 py-1 text-[10px] font-bold text-[#0D9488] mb-6">
                  <Snowflake className="h-3 w-3" />
                  Reefer truck
                </span>

                {/* Weight / Volume */}
                <div className="grid w-full grid-cols-2 gap-3 mb-6">
                  <div className="rounded-[10px] border border-[#E7EAF0] p-3">
                    <div className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#7B7B9D]">
                      Weight
                    </div>
                    <div className="mt-1 text-[13px] font-extrabold text-[#0F1020]">
                      3,842 / 5,000 kg
                    </div>
                  </div>
                  <div className="rounded-[10px] border border-[#E7EAF0] p-3">
                    <div className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#7B7B9D]">
                      Volume
                    </div>
                    <div className="mt-1 text-[13px] font-extrabold text-[#0F1020]">
                      18.4 / 24 m³
                    </div>
                  </div>
                </div>

                {/* Complete Loading Button */}
                <Button
                  type="button"
                  variant="primary"
                  className="w-full min-h-[44px] px-4 py-3 text-[13px] font-bold"
                >
                  <Check className="h-4 w-4" />
                  Complete loading
                </Button>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}
