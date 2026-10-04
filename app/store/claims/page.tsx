"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "../../../components/layout/header";
import { Button } from "../../../components/design-system";
import NewClaimForm from "./new-claim-form";
import type {
  StoreDisputeDto,
  DisputeType,
  DisputeResolutionStatus,
} from "../../../lib/types/store-api";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Check,
  Clock3,
  Eye,
  FileText,
  LayoutGrid,
  Package,
  Plus,
  RefreshCw,
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

function formatDisputeType(type: DisputeType): string {
  switch (type) {
    case "DAMAGED":
      return "Cargo damage";
    case "SHORT_DELIVERY":
      return "Short delivery";
    case "WRONG_PRODUCT":
      return "Wrong product";
    case "TEMPERATURE_BREACH":
      return "Temperature breach";
    default:
      return type;
  }
}

function getClaimStatusBadge(status: DisputeResolutionStatus) {
  switch (status) {
    case "OPEN":
      return {
        label: "Open",
        className: "bg-[#FFF3DF] text-[#C07B00]",
      };
    case "UNDER_REVIEW":
      return {
        label: "Under review",
        className: "bg-[#FFF3DF] text-[#C07B00]",
      };
    case "CREDITED":
      return {
        label: "Resolved",
        className: "bg-[#EAFAF3] text-[#18895E]",
      };
    case "REJECTED":
      return {
        label: "Rejected",
        className: "bg-[#FEF2F2] text-[#DC2626]",
      };
    default:
      return {
        label: status,
        className: "bg-[#F3F4F6] text-[#4B5563]",
      };
  }
}

function formatRaisedDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
}

async function fetchStoreClaimsData(): Promise<{
  claims: StoreDisputeDto[];
  error: string | null;
}> {
  try {
    const res = await fetch("/api/store/claims");
    const json = await res.json();
    if (res.ok && json.success) {
      return { claims: json.data || [], error: null };
    }
    return {
      claims: [],
      error: json?.error?.message || "Failed to load claims",
    };
  } catch (err) {
    return {
      claims: [],
      error: err instanceof Error ? err.message : "Failed to load claims",
    };
  }
}

export default function ClaimsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [claims, setClaims] = useState<StoreDisputeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mountedTime] = useState(() => Date.now());

  const applyClaimsData = useCallback(
    (data: { claims: StoreDisputeDto[]; error: string | null }) => {
      setClaims(data.claims);
      setError(data.error);
      setIsLoading(false);
    },
    []
  );

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const data = await fetchStoreClaimsData();
    applyClaimsData(data);
  }, [applyClaimsData]);

  useEffect(() => {
    let ignore = false;

    async function init() {
      const data = await fetchStoreClaimsData();
      if (!ignore) {
        applyClaimsData(data);
      }
    }

    void init();

    return () => {
      ignore = true;
    };
  }, [applyClaimsData]);

  // Derived KPI metrics
  const openClaims = claims.filter(
    (c) => c.resolutionStatus === "OPEN" || c.resolutionStatus === "UNDER_REVIEW"
  );
  const resolvedClaims = claims.filter(
    (c) => c.resolutionStatus === "CREDITED"
  );
  const totalUnitsAffected = claims.reduce(
    (acc, c) => acc + (c.unitsAffected || 0),
    0
  );

  // Find oldest open claim
  const oldestOpenClaim =
    openClaims.length > 0
      ? openClaims.reduce((oldest, current) => {
          const oldestTime = new Date(oldest.createdAt).getTime();
          const currentTime = new Date(current.createdAt).getTime();
          return currentTime < oldestTime ? current : oldest;
        })
      : null;

  const oldestClaimDaysText = oldestOpenClaim
    ? (() => {
        const diffMs = mountedTime - new Date(oldestOpenClaim.createdAt).getTime();
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return days === 0 ? "Today" : `${days} days`;
      })()
    : "0 days";

  const summaryCards = [
    {
      label: "Open claims",
      value: String(openClaims.length),
      note: openClaims.length > 0 ? "Under review" : "No open disputes",
      tone: "amber" as const,
      icon: AlertTriangle,
      bars: [16, 18, 22, 24, 35, 28, 42],
    },
    {
      label: "Resolved this month",
      value: String(resolvedClaims.length),
      note: "Credits issued",
      tone: "green" as const,
      icon: Check,
      bars: [18, 21, 19, 32, 36, 41, 38],
    },
    {
      label: "Total claimed units",
      value: String(totalUnitsAffected),
      note: "Cartons / items affected",
      tone: "purple" as const,
      icon: FileText,
      bars: [12, 20, 24, 29, 36, 33, 41],
    },
    {
      label: "Oldest open claim",
      value: oldestClaimDaysText,
      note: oldestOpenClaim ? oldestOpenClaim.disputeId : "None pending",
      tone: "blue" as const,
      icon: Clock3,
      bars: [18, 32, 24, 36, 44, 39, 52],
    },
  ];

  return (
    <>
      <Header
        navItems={storeNavItems}
        activeHref="/store/claims"
        brandName="Waypoint"
        brandSubtitle="Store Manager"
      />

      <div className="min-h-screen bg-[#E9EDF3] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-[20px] font-extrabold tracking-[-0.04em] text-[#0F1020] sm:text-[28px]">
                Claims
              </h1>
              <p className="mt-1 text-[11px] text-[#747B93]">
                Delivery issues and dispute tracking
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="secondary"
                className="px-3 py-2 text-[12px] font-semibold"
                onClick={handleRefresh}
                disabled={isLoading}
                aria-label="Refresh claims"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
              <Button
                type="button"
                variant="primary"
                className="px-3.5 py-2 text-[11px] font-bold shadow-[0_2px_8px_rgba(245,197,66,0.25)]"
                onClick={() => setModalOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                New claim
              </Button>
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5 xl:[&>*]:min-w-[240px]">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              const toneClasses = {
                amber: {
                  badge: "bg-[#FFF3DF] text-[#F59E0B]",
                  bar: "bg-[#F5D59A]",
                  active: "bg-[#F5C542]",
                },
                green: {
                  badge: "bg-[#EAFAF3] text-[#10B981]",
                  bar: "bg-[#9DE7C5]",
                  active: "bg-[#3ECF8E]",
                },
                purple: {
                  badge: "bg-[#F2EAFF] text-[#8B5CF6]",
                  bar: "bg-[#DCCBFF]",
                  active: "bg-[#A78BFA]",
                },
                blue: {
                  badge: "bg-[#EAF4FF] text-[#3B82F6]",
                  bar: "bg-[#BBD8FF]",
                  active: "bg-[#5AA1FF]",
                },
              }[card.tone];

              return (
                <div
                  key={card.label}
                  className="rounded-[16px] border border-black/[0.07] bg-white p-[26px] shadow-[0_2px_12px_rgba(15,16,32,0.05),0_0_0_1px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_28px_rgba(15,16,32,0.1)] hover:-translate-y-[2px] transition-all duration-200"
                >
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <span className="text-[12px] font-medium text-[#7B7B9D]">
                      {card.label}
                    </span>
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${toneClasses.badge}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mb-2 text-[36px] font-extrabold tracking-[-0.04em] text-[#0F1020] leading-none">
                    {card.value}
                  </div>
                  <div className="text-[10px] font-semibold text-[#7B7B9D]">
                    {card.note}
                  </div>

                  <div className="mt-4 flex h-[44px] items-end gap-[3px]">
                    {card.bars.map((bar, index) => (
                      <div
                        key={`${card.label}-${index}`}
                        className={`flex-1 rounded-t-[3px] ${
                          index === card.bars.length - 1
                            ? toneClasses.active
                            : toneClasses.bar
                        }`}
                        style={{ height: `${Math.max(12, bar)}%` }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          {error && (
            <div className="mt-4 flex items-center justify-between rounded-[10px] border border-red-200 bg-red-50 p-3.5 text-[12px] text-red-700">
              <span>{error}</span>
              <button
                type="button"
                onClick={handleRefresh}
                className="font-bold underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="mt-6 overflow-hidden rounded-[14px] border border-black/[0.07] bg-white shadow-[0_2px_12px_rgba(15,16,32,0.06)]">
            <div className="px-4 py-3">
              <div className="text-[13px] font-bold text-[#0F1020]">
                Claim history
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="bg-[#F7F8FB] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7B7B9D]">
                    <th className="px-4 py-3 font-semibold">Claim ID</th>
                    <th className="px-4 py-3 font-semibold">Order ref</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Detail</th>
                    <th className="px-4 py-3 font-semibold">Raised</th>
                    <th className="px-4 py-3 font-semibold text-center">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-[12px] text-[#7B7B9D]"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin text-[#7B7B9D]" />
                          <span>Loading claims history...</span>
                        </div>
                      </td>
                    </tr>
                  ) : claims.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-[12px] text-[#7B7B9D]"
                      >
                        <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-[#C2C6D6]" />
                        <p className="font-semibold text-[#0F1020]">
                          No claims found
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#747B93]">
                          No claims or disputes recorded for this store outlet.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    claims.map((claim) => {
                      const badge = getClaimStatusBadge(claim.resolutionStatus);

                      return (
                        <tr
                          key={claim.disputeId}
                          className="border-t border-[#E7EAF0] text-[12px] text-[#0F1020] hover:bg-[#F9FAFC] transition-colors"
                        >
                          <td className="px-4 py-3 font-medium">
                            {claim.disputeId}
                          </td>
                          <td className="px-4 py-3 font-medium text-[#51576D]">
                            {claim.orderId}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-[#1F2430]">
                              {formatDisputeType(claim.disputeType)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#51576D]">
                            {claim.unitsAffected} units affected
                            {claim.storeNotes ? ` · ${claim.storeNotes}` : ""}
                          </td>
                          <td className="px-4 py-3 text-[#51576D]">
                            {formatRaisedDate(claim.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${badge.className}`}
                              >
                                {badge.label}
                              </span>
                              <button
                                type="button"
                                aria-label={`View ${claim.disputeId}`}
                                className="flex h-5 w-5 items-center justify-center rounded-full border border-[#DDE2EC] bg-white text-[#8E93A7] transition-colors hover:border-[#BFC9D6] hover:text-[#5E667E]"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {modalOpen && (
        <NewClaimForm
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            handleRefresh();
          }}
        />
      )}
    </>
  );
}
