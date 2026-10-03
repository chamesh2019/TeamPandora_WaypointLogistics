"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import { Button, Textarea, FieldLabel } from "../../../components/design-system";
import { cn } from "../../../lib/utils";
import type { PendingReceiptDto } from "../../../lib/types/store-api";

export interface ConfirmReceiptModalProps {
  receipt: PendingReceiptDto;
  onClose: () => void;
  onSuccess: () => void;
}

export async function submitConfirmReceipt(
  orderId: string,
  decision: "ACCEPTED_IN_FULL" | "REPORT_DISCREPANCY",
  receiverNotes?: string,
  fetchImpl: typeof fetch = fetch
) {
  const res = await fetchImpl("/api/store/receipts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderId,
      decision,
      receiverNotes: receiverNotes?.trim() || undefined,
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json?.error?.message || "Failed to confirm receipt");
  }

  return json;
}

export default function ConfirmReceiptModal({
  receipt,
  onClose,
  onSuccess,
}: ConfirmReceiptModalProps) {
  const [decision, setDecision] = useState<
    "ACCEPTED_IN_FULL" | "REPORT_DISCREPANCY"
  >("ACCEPTED_IN_FULL");
  const [receiverNotes, setReceiverNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit() {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await submitConfirmReceipt(receipt.orderId, decision, receiverNotes);
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to confirm delivery receipt"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="relative w-full max-w-[480px] rounded-[22px] bg-white p-7 sm:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.18)]">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-6 top-6 text-[#7B7B9D] hover:text-[#0F1020] transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#E9F9F1]">
          <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
        </div>

        <h2 className="text-[20px] font-extrabold tracking-[-0.03em] text-[#0F1020]">
          Sign off delivery receipt
        </h2>
        <p className="mt-1 text-[12px] leading-[1.6] text-[#747B93]">
          Order <span className="font-bold text-[#0F1020]">{receipt.orderId}</span> delivered by{" "}
          <span className="font-semibold text-[#0F1020]">{receipt.driverName}</span>.
        </p>

        {errorMessage && (
          <div className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="mt-5 space-y-4">
          <div>
            <FieldLabel>DELIVERY VERIFICATION</FieldLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
              <button
                type="button"
                onClick={() => setDecision("ACCEPTED_IN_FULL")}
                className={cn(
                  "flex flex-col items-start p-3.5 rounded-[12px] border text-left transition-all",
                  decision === "ACCEPTED_IN_FULL"
                    ? "border-[#10B981] bg-[#F0FDF4] shadow-[0_0_0_1px_#10B981]"
                    : "border-black/[0.08] hover:border-black/[0.15]"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2
                    className={cn(
                      "h-4 w-4",
                      decision === "ACCEPTED_IN_FULL"
                        ? "text-[#10B981]"
                        : "text-[#7B7B9D]"
                    )}
                  />
                  <span className="text-[12px] font-bold text-[#0F1020]">
                    Accept in full
                  </span>
                </div>
                <span className="mt-1 text-[10px] text-[#747B93] leading-tight">
                  All cartons received in good order
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDecision("REPORT_DISCREPANCY")}
                className={cn(
                  "flex flex-col items-start p-3.5 rounded-[12px] border text-left transition-all",
                  decision === "REPORT_DISCREPANCY"
                    ? "border-[#F59E0B] bg-[#FFFBEB] shadow-[0_0_0_1px_#F59E0B]"
                    : "border-black/[0.08] hover:border-black/[0.15]"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <AlertTriangle
                    className={cn(
                      "h-4 w-4",
                      decision === "REPORT_DISCREPANCY"
                        ? "text-[#F59E0B]"
                        : "text-[#7B7B9D]"
                    )}
                  />
                  <span className="text-[12px] font-bold text-[#0F1020]">
                    Report issue
                  </span>
                </div>
                <span className="mt-1 text-[10px] text-[#747B93] leading-tight">
                  Damage, shortage, or breach
                </span>
              </button>
            </div>
          </div>

          <div>
            <FieldLabel>RECEIVER NOTES (OPTIONAL)</FieldLabel>
            <Textarea
              placeholder="Notes on delivery condition, shortage observations, dock sign-off remarks..."
              value={receiverNotes}
              onChange={(e) => setReceiverNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

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
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold"
          >
            {isSubmitting ? "Confirming..." : "Confirm receipt"}
          </Button>
        </div>
      </div>
    </div>
  );
}
