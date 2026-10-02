"use client";

import { useState } from "react";
import Header from "../../components/layout/header";
import { Button, Panel, StatCard } from "../../components/design-system";
import { useSession } from "../../lib/auth-client";
import PlaceOrderForm from "./orders/place-order-form";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  LayoutGrid,
  Package,
  Phone,
  ShoppingCart,
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

const metricBars = {
  blue: [22, 34, 28, 36, 42, 48, 54],
  green: [18, 26, 30, 36, 42, 38, 48],
  purple: [14, 18, 23, 28, 34, 30, 36],
  orange: [16, 21, 24, 30, 34, 32, 28],
};

export default function StorePage() {
  const [placeOrderOpen, setPlaceOrderOpen] = useState(false);
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
        navItems={storeNavItems}
        activeHref="/store"
        brandName="Waypoint"
        brandSubtitle="Store Manager"
      />

      <div className="min-h-screen bg-[#E9EDF3] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-[20px] font-extrabold tracking-[-0.04em] text-[#0F1020] sm:text-[28px]">
                {greeting}, {userName}
              </h1>
              <p className="mt-1 text-[11px] text-[#747B93]">
                Bambalapitiyya Fresh · Store operations dashboard
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              className="px-4 py-2.5 text-[12px] font-bold"
              onClick={() => setPlaceOrderOpen(true)}
            >
              <span className="text-base leading-none">+</span>
              Place order
            </Button>
          </div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5 xl:[&>*]:min-w-[260px]">
            <StatCard
              icon={<Truck className="h-4 w-4" />}
              label="Next delivery"
              value="07:35"
              note="Arriving in 42 minutes"
              tone="blue"
              bars={metricBars.blue}
            />
            <StatCard
              icon={<ShoppingCart className="h-4 w-4" />}
              label="Open orders"
              value="6"
              note="2 planned for tomorrow"
              tone="green"
              bars={metricBars.green}
            />
            <StatCard
              icon={<Check className="h-4 w-4" />}
              label="Pending receipts"
              value="2"
              note="Awaiting confirmation"
              tone="purple"
              bars={metricBars.purple}
            />
            <StatCard
              icon={<AlertTriangle className="h-4 w-4" />}
              label="Open claims"
              value="1"
              note="Under review"
              tone="orange"
              bars={metricBars.orange}
            />
          </section>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1.7fr_1fr]">
            <Panel>
              <div className="flex items-center justify-between border-b border-[#E7EAF0] px-5 py-3.5">
                <div>
                  <div className="text-[13px] font-bold text-[#0F1020] leading-tight">
                    Incoming deliveries
                  </div>
                  <div className="mt-0.5 text-[10px] text-[#7B7B9D]">
                    Live service and visibility
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/20 bg-[#10B981]/10 px-2 py-0.5 text-[9px] font-bold text-[#10B981]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                  Live
                </span>
              </div>

              <div className="px-4 pb-4 pt-4">
                <div className="flex items-center justify-between gap-3 border-b border-[#E7EAF0] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#EEF4FF] text-[#4B8EF5]">
                      <Truck className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B7B9D]">
                        Arriving next
                      </div>
                      <div className="mt-1 text-[18px] font-extrabold tracking-[-0.04em] text-[#0F1020]">
                        TRP-250613-04 · 18 cartons
                      </div>
                      <div className="mt-1 text-[10px] text-[#7B7B9D]">
                        Child route · WPC-4072
                      </div>
                    </div>
                  </div>

                  <div className="flex min-w-[150px] items-center justify-end gap-3">
                    <div className="text-right">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B7B9D]">
                        Live ETA
                      </div>
                      <div className="mt-1 text-[34px] font-extrabold tracking-[-0.06em] text-[#0F1020]">
                        07:35
                      </div>
                      <div className="text-[10px] text-[#7B7B9D]">On time</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5C542] text-[11px] font-bold text-[#0F1928]">
                      NP
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7B7B9D]">
                        Driver
                      </div>
                      <div className="mt-0.5 text-[13px] font-bold text-[#0F1020]">
                        Nimal Perera
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    className="group min-h-[34px] px-3 py-2 text-[12px] font-semibold shadow-[0_1px_2px_rgba(15,16,32,0.03)] transition-all duration-200 hover:bg-[#F7FAFF] hover:text-[#0F1020]"
                  >
                    <Phone className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-105" />
                    Call driver
                  </Button>
                </div>

                <button
                  type="button"
                  className="group mt-4 -mx-4 -mb-4 flex w-[calc(100%+2rem)] items-center justify-center gap-1.5 rounded-b-xl border-t border-[#E7EAF0] bg-[#F4F7FF] px-4 py-3 text-[12px] font-semibold text-[#4B8EF5] transition-all duration-200 hover:bg-[#E5EEFF] hover:text-[#245CE3]"
                >
                  Track delivery
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </Panel>

            <Panel>
              <div className="flex items-center justify-between border-b border-[#E7EAF0] px-5 py-3.5">
                <div>
                  <div className="text-[13px] font-bold text-[#0F1020] leading-tight">
                    Pending confirmations
                  </div>
                  <div className="mt-0.5 text-[10px] text-[#7B7B9D]">
                    Delivered orders needing sign-off
                  </div>
                </div>

                <span className="inline-flex items-center rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[9px] font-bold text-[#EF4444]">
                  2
                </span>
              </div>

              <div className="p-0">
                <div className="flex items-center justify-between gap-3 border-b border-[#E7EAF0] px-4 py-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B7B9D]">
                      Delivered 11 Jun · 09:14
                    </div>
                    <div className="mt-1 text-[15px] font-extrabold tracking-[-0.04em] text-[#0F1020]">
                      ORD-250611-1842
                    </div>
                    <div className="mt-1 text-[10px] text-[#7B7B9D]">
                      24 cartons · Driver: R. Silva
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    className="min-h-[30px] px-3 py-1.5 text-[10px] font-bold"
                  >
                    Review receipt
                  </Button>
                </div>

                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B7B9D]">
                      Delivered 12 Jun · 07:48
                    </div>
                    <div className="mt-1 text-[15px] font-extrabold tracking-[-0.04em] text-[#0F1020]">
                      ORD-250612-1910
                    </div>
                    <div className="mt-1 text-[10px] text-[#7B7B9D]">
                      12 chilled cartons · Driver: N. Perera
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    className="min-h-[30px] px-3 py-1.5 text-[10px] font-bold"
                  >
                    Review receipt
                  </Button>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>

      {placeOrderOpen && (
        <PlaceOrderForm onClose={() => setPlaceOrderOpen(false)} />
      )}
    </>
  );
}
