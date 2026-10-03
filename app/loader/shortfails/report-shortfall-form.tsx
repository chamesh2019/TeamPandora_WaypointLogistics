"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Button,
  Input,
  Select,
  FieldLabel,
} from "../../../components/design-system";
import type { LoaderTripSummary } from "../../../lib/types/loader-api";

interface ReportShortfallFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialTripId?: string;
}

export default function ReportShortfallForm({
  onClose,
  onSuccess,
  initialTripId,
}: ReportShortfallFormProps) {
  const [trips, setTrips] = useState<LoaderTripSummary[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<string>(initialTripId || "");
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("Stock exhausted");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function fetchTrips() {
      try {
        const res = await fetch("/api/loader/trips");
        const json = await res.json();
        if (!ignore && res.ok && json.success && Array.isArray(json.data) && json.data.length > 0) {
          setTrips(json.data);
          if (!initialTripId) {
            setSelectedTrip(json.data[0].tripId);
          }
        }
      } catch {
        // Keep initialTripId or fallback
      }
    }
    fetchTrips();
    return () => {
      ignore = true;
    };
  }, [initialTripId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      setErrorMsg("Please enter a valid quantity greater than 0");
      return;
    }

    const tripId = selectedTrip || initialTripId || (trips[0]?.tripId ?? "TRP-250614-01");
    if (!tripId) {
      setErrorMsg("Please select a trip");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/loader/exceptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          sku: sku.trim() || undefined,
          quantityShort: qty,
          reason,
          notes: `${reason} flagged during load verification`,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        onSuccess?.();
        onClose();
      } else {
        setErrorMsg(json?.error?.message || "Failed to record shortfall");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error reporting shortfall");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      {/* Modal card */}
      <div className="relative w-full max-w-[480px] rounded-[22px] bg-white p-7 sm:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.18)]">
        {/* Icon */}
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#FFF4DC]">
          <AlertTriangle className="h-5 w-5 text-[#F5A623]" />
        </div>

        {/* Title */}
        <h2 className="text-[20px] font-extrabold tracking-[-0.03em] text-[#0F1020]">
          Report a shortfall
        </h2>
        <p className="mt-1 text-[12px] leading-[1.6] text-[#747B93]">
          Log a missing or insufficient stock item for a trip being loaded at this depot.
        </p>

        {errorMsg && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-[12px] font-medium text-red-600 border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Fields */}
          <div className="mt-5 space-y-4">
            {/* Trip */}
            <div>
              <FieldLabel>TRIP</FieldLabel>
              <Select
                value={selectedTrip || initialTripId || (trips[0]?.tripId ?? "")}
                onChange={(e) => setSelectedTrip(e.target.value)}
                disabled={isSubmitting}
              >
                {trips.length > 0 ? (
                  trips.map((t) => (
                    <option key={t.tripId} value={t.tripId}>
                      {t.tripId} · {t.vehicleId} ({t.route})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="TRP-250614-01">TRP-250614-01 (Colombo South)</option>
                    <option value="TRP-250614-02">TRP-250614-02 (Kandy Express)</option>
                    <option value="TRP-250614-03">TRP-250614-03 (Negombo North)</option>
                  </>
                )}
              </Select>
            </div>

            {/* SKU / Product Code */}
            <div>
              <FieldLabel>SKU / PRODUCT CODE</FieldLabel>
              <Input
                type="text"
                placeholder="e.g. SKU-DAIRY-01 or WPF-CHKN-FRZ-24"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Quantity Short */}
            <div>
              <FieldLabel>QUANTITY SHORT</FieldLabel>
              <Input
                type="number"
                placeholder="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Reason */}
            <div>
              <FieldLabel>REASON</FieldLabel>
              <Select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="Stock exhausted">Stock exhausted</option>
                <option value="Picking error">Picking error</option>
                <option value="Damaged goods">Damaged goods</option>
                <option value="Incorrect quantity">Incorrect quantity</option>
                <option value="Temperature issue">Temperature issue</option>
                <option value="Other">Other</option>
              </Select>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Report shortfall"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
