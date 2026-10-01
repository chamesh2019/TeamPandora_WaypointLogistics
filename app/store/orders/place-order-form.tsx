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

interface PlaceOrderFormProps {
  onClose: () => void;
}

export default function PlaceOrderForm({ onClose }: PlaceOrderFormProps) {
  const [deliveryDate, setDeliveryDate] = useState("06/14/2025");
  const [tempRequirement, setTempRequirement] = useState("ambient");
  const [totalCartons, setTotalCartons] = useState("");
  const [estimatedWeight, setEstimatedWeight] = useState("");
  const [estimatedVolume, setEstimatedVolume] = useState("");
  const [notes, setNotes] = useState("");

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

  function handleSubmit() {
    onClose();
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
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
        <div className="mt-4 flex items-center gap-2 rounded-[10px] border border-[#FDE5BD] bg-[#FFF8EC] px-3.5 py-2.5 text-[#B45309]">
          <Clock className="h-3.5 w-3.5 shrink-0 text-[#D97706]" />
          <span className="text-[11px] font-semibold">
            Cutoff: 16:00 today · 2h 14m remaining
          </span>
        </div>

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
                            : "text-[#0F1020] hover:bg-[#F5F6FB]",
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
            className="px-5 py-2 text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-bold"
          >
            Submit order
          </Button>
        </div>
      </div>
    </div>
  );
}
