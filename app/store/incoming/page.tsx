"use client";

import Header from "../../../components/layout/header";
import { Button } from "../../../components/design-system";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Check,
  Clock3,
  LayoutGrid,
  Package,
  Phone,
  Truck,
} from "lucide-react";

const storeNavItems = [
  { name: "Overview", href: "/store", icon: LayoutGrid },
  { name: "Orders", href: "/store/orders", icon: Package },
  { name: "Incoming", href: "/store/incoming", icon: Truck },
  { name: "Receipts", href: "/store/receipts", icon: Check },
  { name: "Claims", href: "/store/claims", icon: AlertTriangle },
  { name: "Deferrals", href: "/store/deferrals", icon: Calendar },
  { name: "Reports", href: "/store/reports", icon: BarChart3 },
];

const summaryStats = [
  {
    label: "Arriving today",
    value: "1",
    sub: "TRP-250614-01 · 07:35",
    tone: "blue",
    icon: Truck,
    bars: [28, 37, 45, 52, 48, 57, 63],
  },
  {
    label: "Cartons expected",
    value: "18",
    sub: "Chilled reefer",
    tone: "green",
    icon: Package,
    bars: [18, 23, 32, 54, 42, 36, 48],
  },
  {
    label: "ETA",
    value: "07:35",
    sub: "14 km away · On route",
    tone: "purple",
    icon: Clock3,
    bars: [10, 18, 27, 36, 48, 55, 52],
  },
  {
    label: "On time",
    value: "100%",
    sub: "Last 10 deliveries",
    tone: "amber",
    icon: Check,
    bars: [22, 31, 48, 54, 30, 62, 41],
  },
];

const liveTrips = [
  {
    id: "TRP-250614-01",
    cartons: "18 cartons · Chilled",
    status: "On route",
    eta: "07:35",
    etaLabel: "Live ETA",
    etaSub: "14 km away",
    route: "WP-NC-4872",
    driver: "N. Perera",
    driverCode: "NP",
    badgeTone: "blue",
    isLive: true,
  },
  {
    id: "TRP-250614-02",
    cartons: "12 cartons · Chilled",
    status: "Planned",
    eta: "Tomorrow 08:10",
    etaLabel: "Scheduled",
    etaSub: "Scheduled",
    route: "CP-LM-2194",
    driver: "S. Bandara",
    driverCode: "SB",
    badgeTone: "amber",
    isLive: false,
  },
];

export default function IncomingPage() {
  return (
    <>
      <Header
        navItems={storeNavItems}
        activeHref="/store/incoming"
        brandName="Waypoint"
        brandSubtitle="Store Manager"
      />

      <div className="min-h-screen bg-[#E9EDF3] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-5">
            <h1 className="text-[20px] font-extrabold tracking-[-0.04em] text-[#0F1020] sm:text-[28px]">
              Incoming deliveries
            </h1>
            <p className="mt-1 text-[11px] text-[#747B93]">
              Live arrival tracking · Bambalapitiya Fresh
            </p>
          </div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5 xl:[&>*]:min-w-[240px]">
            {summaryStats.map((item) => {
              const Icon = item.icon;
              const toneMap = {
                blue: {
                  box: "bg-[#EEF4FF] text-[#4B8EF5]",
                  bar: "bg-[#CFE1FF]",
                  active: "bg-[#4B8EF5]",
                },
                green: {
                  box: "bg-[#E9F9F1] text-[#10B981]",
                  bar: "bg-[#CEF1DE]",
                  active: "bg-[#10B981]",
                },
                purple: {
                  box: "bg-[#F2EAFF] text-[#7C3AED]",
                  bar: "bg-[#E2D4FF]",
                  active: "bg-[#7C3AED]",
                },
                amber: {
                  box: "bg-[#FFF7E8] text-[#F59E0B]",
                  bar: "bg-[#FDE7B8]",
                  active: "bg-[#F5C542]",
                },
              }[item.tone];

              return (
                <div
                  key={item.label}
                  className="rounded-[16px] border border-black/[0.07] bg-white p-[26px] shadow-[0_2px_12px_rgba(15,16,32,0.07),0_0_0_1px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_28px_rgba(15,16,32,0.1)] hover:-translate-y-[2px] transition-all duration-200"
                >
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <span className="text-[12px] font-medium text-[#7B7B9D]">
                      {item.label}
                    </span>
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${toneMap!.box}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mb-2 text-[36px] font-extrabold tracking-[-0.04em] text-[#0F1020] leading-none">
                    {item.value}
                  </div>
                  <div className="text-[10px] font-semibold text-[#7B7B9D]">
                    {item.sub}
                  </div>

                  <div className="mt-4 flex h-[44px] items-end gap-[3px]">
                    {item.bars.map((bar, idx) => (
                      <div
                        key={`${item.label}-${idx}`}
                        className={`flex-1 rounded-t-[3px] ${idx === item.bars.length - 1 ? toneMap!.active : toneMap!.bar}`}
                        style={{ height: `${Math.max(12, bar)}%` }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          <div className="mt-6 space-y-4">
            {liveTrips.map((trip) => (
              <div
                key={trip.id}
                className="overflow-hidden rounded-[14px] border border-black/[0.07] bg-white shadow-[0_2px_12px_rgba(15,16,32,0.07)]"
              >
                <div className="flex items-center justify-between border-b border-[#E7EAF0] px-5 py-3.5">
                  <div>
                    <div className="text-[13px] font-bold text-[#0F1020] leading-tight">
                      {trip.id}
                    </div>
                    <div className="mt-0.5 text-[10px] text-[#7B7B9D]">
                      {trip.cartons}
                    </div>
                  </div>

                  <div className="inline-flex items-center rounded-full border border-[#B7D7FF] bg-[#F1F7FF] px-2 py-0.5 text-[9px] font-bold text-[#4B8EF5]">
                    {trip.status}
                  </div>
                </div>

                <div className="px-4 pb-4 pt-4">
                  <div className="grid gap-3 border-b border-[#E7EAF0] pb-4 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#EEF4FF] text-[#4B8EF5]">
                        <Truck className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B7B9D]">
                          {trip.etaLabel}
                        </div>
                        <div className="mt-1 text-[20px] font-extrabold tracking-[-0.05em] text-[#0F1020]">
                          {trip.eta}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-[#7B7B9D]">
                          <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                          {trip.etaSub}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B7B9D]">
                        Live ETA
                      </div>
                      <div className="mt-1 text-[20px] font-extrabold tracking-[-0.05em] text-[#0F1020]">
                        {trip.eta}
                      </div>
                      <div className="text-[10px] text-[#7B7B9D]">On time</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5C542] text-[11px] font-bold text-[#0F1928]">
                        {trip.driverCode}
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7B7B9D]">
                          Driver
                        </div>
                        <div className="mt-0.5 text-[13px] font-bold text-[#0F1020]">
                          {trip.driver}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-[#7B7B9D]">
                      <span className="font-medium">{trip.route}</span>
                      <Button
                        type="button"
                        variant="secondary"
                        className="min-h-[30px] px-3 py-1.5 text-[10px] font-bold"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Call driver
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
