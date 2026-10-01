"use client";

import { useState, useRef, useEffect } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Package,
} from "lucide-react";
import {
  Button,
  Input,
  Select,
  Textarea,
  FieldLabel,
} from "../../../components/design-system";
import { cn } from "../../../lib/utils";
import { getCutoffInfo, type CutoffInfo } from "../../../lib/utils/cutoff";

export interface PlaceOrderFormData {
  deliveryDate: string;
  tempRequirement: string;
  totalCartons: string | number;
  estimatedWeight: string | number;
  estimatedVolume: string | number;
  notes?: string;
}

export interface PlaceOrderApiPayload {
  deliveryDate: string;
  tempRequirement: "ambient" | "chilled";
  orderUnits: number;
  orderWeightKg: number;
  orderVolumeM3: number;
  notes?: string;
}

export function formatOrderPayload(
  data: PlaceOrderFormData
): PlaceOrderApiPayload {
  let deliveryDate = data.deliveryDate.trim();
  const dateParts = deliveryDate.split("/").map((p) => p.trim());
  if (dateParts.length === 3 && dateParts[2].length === 4) {
    const [month, day, year] = dateParts;
    deliveryDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate)) {
    throw new Error(
      "Valid delivery date in MM/DD/YYYY or YYYY-MM-DD format is required"
    );
  }

  const tempRequirement =
    data.tempRequirement === "chilled" ? "chilled" : "ambient";

  const orderUnits =
    typeof data.totalCartons === "number"
      ? data.totalCartons
      : parseInt(String(data.totalCartons).trim(), 10);
  if (isNaN(orderUnits) || orderUnits <= 0) {
    throw new Error("Total cartons must be a positive number");
  }

  const orderWeightKg =
    typeof data.estimatedWeight === "number"
      ? data.estimatedWeight
      : parseFloat(String(data.estimatedWeight).trim());
  if (isNaN(orderWeightKg) || orderWeightKg <= 0) {
    throw new Error("Estimated weight must be a positive number");
  }

  const orderVolumeM3 =
    typeof data.estimatedVolume === "number"
      ? data.estimatedVolume
      : parseFloat(String(data.estimatedVolume).trim());
  if (isNaN(orderVolumeM3) || orderVolumeM3 <= 0) {
    throw new Error("Estimated volume must be a positive number");
  }

  const trimmedNotes = data.notes?.trim();

  return {
    deliveryDate,
    tempRequirement,
    orderUnits,
    orderWeightKg,
    orderVolumeM3,
    notes: trimmedNotes || undefined,
  };
}

export async function submitPlaceOrder(
  data: PlaceOrderFormData,
  fetchImpl: typeof fetch = fetch
) {
  const payload = formatOrderPayload(data);

  const res = await fetchImpl("/api/store/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json?.error?.message || "Failed to place order");
  }

  return json;
}

interface PlaceOrderFormProps {
  onClose: () => void;
  onSuccess?: (order: unknown, notice?: string) => void;
}

export default function PlaceOrderForm({
  onClose,
  onSuccess,
}: PlaceOrderFormProps) {
  const [deliveryDate, setDeliveryDate] = useState("06/14/2025");
  const [tempRequirement, setTempRequirement] = useState("ambient");
  const [totalCartons, setTotalCartons] = useState("");
  const [estimatedWeight, setEstimatedWeight] = useState("");
  const [estimatedVolume, setEstimatedVolume] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cutoffNotice, setCutoffNotice] = useState<string | null>(null);
  const [cutoffInfo, setCutoffInfo] = useState<CutoffInfo>(() => getCutoffInfo());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCutoffInfo(getCutoffInfo());
    }, 60000);
    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Calendar popover state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Initialize view month based on deliveryDate (06/14/2025)
  const [viewDate, setViewDate] = useState(() => {
    const parts = "06/14/2025".split("/").map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[2])) {
      return new Date(parts[2], parts[0] - 1, 1);
    }
    return new Date();
  });

  // Close calendar popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    }
    if (isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalendarOpen]);

  // Parse currently selected date
  const parsedSelected = (() => {
    const parts = deliveryDate.split("/").map(Number);
    if (
      parts.length === 3 &&
      !isNaN(parts[0]) &&
      !isNaN(parts[1]) &&
      !isNaN(parts[2])
    ) {
      return { month: parts[0] - 1, day: parts[1], year: parts[2] };
    }
    return null;
  })();

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  function handleSelectDate(day: number) {
    const formatted = `${String(viewMonth + 1).padStart(2, "0")}/${String(day).padStart(2, "0")}/${viewYear}`;
    setDeliveryDate(formatted);
    setIsCalendarOpen(false);
  }

  function handleSelectToday() {
    const now = new Date();
    const formatted = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}/${now.getFullYear()}`;
    setDeliveryDate(formatted);
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setIsCalendarOpen(false);
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await submitPlaceOrder({
        deliveryDate,
        tempRequirement,
        totalCartons,
        estimatedWeight,
        estimatedVolume,
        notes,
      });

      const notice = response.meta?.notice;
      if (onSuccess) {
        onSuccess(response.data, notice);
      }

      if (notice) {
        setCutoffNotice(notice);
        timerRef.current = setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        onClose();
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while placing your order"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

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
          <Package className="h-5 w-5 text-[#F5A623]" />
        </div>

        {/* Title */}
        <h2 className="text-[20px] font-extrabold tracking-[-0.03em] text-[#0F1020]">
          Place a new order
        </h2>
        <p className="mt-1 text-[12px] leading-[1.6] text-[#747B93]">
          Orders placed before 16:00 today are eligible for tomorrow&apos;s
          delivery run. Orders placed after 16:00 will be scheduled for the
          following day.
        </p>

        {/* Cutoff banner */}
        <div
          data-testid="cutoff-status-banner"
          className={cn(
            "mt-4 flex items-center gap-2 rounded-[10px] border px-3.5 py-2.5",
            cutoffInfo.isAfterCutoff
              ? "border-[#FDE5BD] bg-[#FFF8EC] text-[#B45309]"
              : "border-[#FDE5BD] bg-[#FFF8EC] text-[#B45309]"
          )}
        >
          <Clock className="h-3.5 w-3.5 shrink-0 text-[#D97706]" />
          <span className="text-[11px] font-semibold">
            {cutoffInfo.bannerText}
          </span>
        </div>

        {/* Cutoff notice banner */}
        {cutoffNotice && (
          <div
            data-testid="cutoff-notice-banner"
            className="mt-4 flex items-start gap-2.5 rounded-[10px] border border-[#FDE5BD] bg-[#FFF8EC] p-3 text-[#B45309]"
          >
            <Clock className="h-4 w-4 shrink-0 text-[#D97706] mt-0.5" />
            <div className="text-[12px] font-medium leading-[1.5]">
              <span className="font-bold">Cutoff Notice: </span>
              {cutoffNotice}
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Fields */}
        <div className="mt-5 space-y-4">
          {/* Requested delivery date with Calendar popover */}
          <div className="relative" ref={calendarRef}>
            <FieldLabel>REQUESTED DELIVERY DATE</FieldLabel>
            <div className="relative">
              <Input
                type="text"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                onClick={() => setIsCalendarOpen(true)}
                placeholder="MM/DD/YYYY"
                className="pr-10 font-medium"
              />
              <button
                type="button"
                onClick={() => setIsCalendarOpen((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md text-[#7B7B9D] hover:bg-black/[0.05] hover:text-[#0F1020] transition-colors"
                aria-label="Open calendar"
              >
                <Calendar className="h-4 w-4" />
              </button>
            </div>

            {/* Calendar Popover */}
            {isCalendarOpen && (
              <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full sm:w-[290px] rounded-[16px] border border-black/[0.08] bg-white p-3.5 shadow-[0_16px_40px_rgba(15,16,32,0.18)]">
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[13px] font-bold text-[#0F1020]">
                    {viewDate.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setViewDate(new Date(viewYear, viewMonth - 1, 1))
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#F5F6FB] text-[#7B7B9D] hover:text-[#0F1020] transition-colors"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setViewDate(new Date(viewYear, viewMonth + 1, 1))
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#F5F6FB] text-[#7B7B9D] hover:text-[#0F1020] transition-colors"
                      aria-label="Next month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Day name headers */}
                <div className="grid grid-cols-7 mb-1 text-center">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <span
                      key={day}
                      className="text-[10px] font-bold text-[#7B7B9D] uppercase py-1"
                    >
                      {day}
                    </span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Previous month trailing days */}
                  {Array.from({ length: firstDayOfWeek }).map((_, idx) => {
                    const prevDay = daysInPrevMonth - firstDayOfWeek + 1 + idx;
                    return (
                      <span
                        key={`prev-${idx}`}
                        className="h-8 w-8 mx-auto flex items-center justify-center text-[11px] text-[#C2C6D6]"
                      >
                        {prevDay}
                      </span>
                    );
                  })}

                  {/* Current month days */}
                  {Array.from({ length: daysInCurrentMonth }).map((_, idx) => {
                    const dayNumber = idx + 1;
                    const isSelected =
                      parsedSelected?.year === viewYear &&
                      parsedSelected?.month === viewMonth &&
                      parsedSelected?.day === dayNumber;

                    return (
                      <button
                        key={`day-${dayNumber}`}
                        type="button"
                        onClick={() => handleSelectDate(dayNumber)}
                        className={cn(
                          "h-8 w-8 mx-auto rounded-[8px] text-[12px] font-medium flex items-center justify-center transition-all",
                          isSelected
                            ? "bg-[#F5C542] text-[#0F1928] font-extrabold shadow-[0_2px_8px_rgba(245,197,66,0.38)]"
                            : "text-[#0F1020] hover:bg-[#F5F6FB]"
                        )}
                      >
                        {dayNumber}
                      </button>
                    );
                  })}
                </div>

                {/* Quick actions at bottom */}
                <div className="mt-2.5 pt-2.5 border-t border-black/[0.06] flex items-center justify-between px-1">
                  <button
                    type="button"
                    onClick={handleSelectToday}
                    className="text-[11px] font-bold text-[#4F46E5] hover:underline"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCalendarOpen(false)}
                    className="text-[11px] font-semibold text-[#7B7B9D] hover:text-[#0F1020]"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Temperature requirement + Total cartons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <FieldLabel>TEMPERATURE REQUIREMENT</FieldLabel>
              <Select
                value={tempRequirement}
                onChange={(e) => setTempRequirement(e.target.value)}
              >
                <option value="ambient">Ambient (dry goods)</option>
                <option value="chilled">Chilled (reefer required)</option>
              </Select>
            </div>
            <div>
              <FieldLabel>TOTAL CARTONS</FieldLabel>
              <Input
                type="text"
                placeholder="e.g. 24"
                value={totalCartons}
                onChange={(e) => setTotalCartons(e.target.value)}
              />
            </div>
          </div>

          {/* Estimated weight + Estimated volume */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <FieldLabel>ESTIMATED WEIGHT (KG)</FieldLabel>
              <Input
                type="text"
                placeholder="e.g. 420"
                value={estimatedWeight}
                onChange={(e) => setEstimatedWeight(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>ESTIMATED VOLUME (M³)</FieldLabel>
              <Input
                type="text"
                placeholder="e.g. 4.2"
                value={estimatedVolume}
                onChange={(e) => setEstimatedVolume(e.target.value)}
              />
            </div>
          </div>

          {/* Fresh stores info box */}
          <div className="rounded-[10px] border border-[#DDD6FE] bg-[#F5F3FF] px-3.5 py-3 text-[11px]">
            <p className="font-bold text-[#4F46E5]">Fresh stores only:</p>
            <p className="mt-0.5 leading-[1.6] text-[#6366F1]">
              You can place a separate Chilled order for the same delivery date.
              Each temperature category is treated as its own order.
            </p>
          </div>

          {/* Access & handling notes */}
          <div>
            <FieldLabel>ACCESS &amp; HANDLING NOTES</FieldLabel>
            <Textarea
              placeholder="Dock access, temperature handling, fragile items, contact on arrival..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[85px]"
            />
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
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !!cutoffNotice}
            className="px-5 py-2 text-xs font-bold"
          >
            {isSubmitting
              ? "Placing order..."
              : cutoffNotice
              ? "Order placed"
              : "Submit order"}
          </Button>
        </div>
      </div>
    </div>
  );
}
