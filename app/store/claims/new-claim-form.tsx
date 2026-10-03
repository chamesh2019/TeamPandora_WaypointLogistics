"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Button,
  Input,
  Select,
  Textarea,
  FieldLabel,
} from "../../../components/design-system";

export type DisputeType =
  | "DAMAGED"
  | "SHORT_DELIVERY"
  | "WRONG_PRODUCT"
  | "TEMPERATURE_BREACH";

export interface NewClaimFormData {
  orderId: string;
  disputeType: string;
  unitsAffected: string | number;
  storeNotes: string;
  evidencePhotoUrls?: string[];
}

export interface NewClaimApiPayload {
  orderId: string;
  disputeType: DisputeType;
  unitsAffected: number;
  storeNotes: string;
  evidencePhotoUrls?: string[];
}

export function normalizeDisputeType(type: string): DisputeType {
  const upper = (type || "").trim().toUpperCase();
  if (
    upper === "SHORT_DELIVERY" ||
    upper === "DAMAGED" ||
    upper === "WRONG_PRODUCT" ||
    upper === "TEMPERATURE_BREACH"
  ) {
    return upper as DisputeType;
  }
  if (type === "short_delivery") return "SHORT_DELIVERY";
  if (type === "cargo_damage") return "DAMAGED";
  if (type === "wrong_item") return "WRONG_PRODUCT";
  if (type === "missing_item") return "SHORT_DELIVERY";
  if (type === "temperature_breach") return "TEMPERATURE_BREACH";
  return upper as DisputeType;
}

export function formatClaimPayload(data: NewClaimFormData): NewClaimApiPayload {
  const orderId = (data.orderId || "").trim();
  if (!orderId) {
    throw new Error("Order ID is required");
  }

  const disputeType = normalizeDisputeType(data.disputeType || "SHORT_DELIVERY");

  const unitsAffected =
    typeof data.unitsAffected === "number"
      ? data.unitsAffected
      : parseInt(String(data.unitsAffected).trim(), 10);

  if (isNaN(unitsAffected) || unitsAffected <= 0) {
    throw new Error("Units affected must be a positive number");
  }

  const storeNotes = (data.storeNotes || "").trim();
  if (!storeNotes) {
    throw new Error("Store notes/description is required");
  }

  const evidencePhotoUrls = Array.isArray(data.evidencePhotoUrls)
    ? data.evidencePhotoUrls.map((u) => u.trim()).filter(Boolean)
    : undefined;

  return {
    orderId,
    disputeType,
    unitsAffected,
    storeNotes,
    evidencePhotoUrls:
      evidencePhotoUrls && evidencePhotoUrls.length > 0
        ? evidencePhotoUrls
        : undefined,
  };
}

export async function submitNewClaim(
  data: NewClaimFormData,
  fetchImpl: typeof fetch = fetch
) {
  const payload = formatClaimPayload(data);

  const res = await fetchImpl("/api/store/claims", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json?.error?.message || "Failed to submit claim");
  }

  return json;
}

interface NewClaimFormProps {
  onClose: () => void;
  initialOrderId?: string;
  onSuccess?: (claim: unknown) => void;
}

export default function NewClaimForm({
  onClose,
  initialOrderId = "",
  onSuccess,
}: NewClaimFormProps) {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [disputeType, setDisputeType] = useState("SHORT_DELIVERY");
  const [unitsAffected, setUnitsAffected] = useState("1");
  const [storeNotes, setStoreNotes] = useState("");
  const [evidencePhotoUrlsInput, setEvidencePhotoUrlsInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit() {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const photoUrls = evidencePhotoUrlsInput
        ? evidencePhotoUrlsInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

      const response = await submitNewClaim({
        orderId,
        disputeType,
        unitsAffected,
        storeNotes,
        evidencePhotoUrls: photoUrls,
      });

      if (onSuccess) {
        onSuccess(response.data);
      }
      onClose();
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while submitting your claim"
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
      <div className="relative w-full max-w-[440px] rounded-[20px] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.18)] p-7 sm:p-8">
        {/* Icon */}
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#FFF3DF]">
          <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
        </div>

        {/* Title */}
        <h2 className="text-[18px] font-extrabold tracking-[-0.03em] text-[#0F1020]">
          Raise a new claim
        </h2>
        <p className="mt-1.5 text-[12px] leading-[1.6] text-[#7B7B9D]">
          Submit a delivery claim for review. Claims are processed within 5
          business days.
        </p>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Fields */}
        <div className="mt-6 space-y-4">
          <div>
            <FieldLabel>Related Order</FieldLabel>
            <Input
              placeholder="ORD-250613-XXXX"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>Claim Type</FieldLabel>
            <Select
              value={disputeType}
              onChange={(e) => setDisputeType(e.target.value)}
            >
              <option value="SHORT_DELIVERY">Short delivery</option>
              <option value="DAMAGED">Cargo damage</option>
              <option value="WRONG_PRODUCT">Wrong item</option>
              <option value="TEMPERATURE_BREACH">Temperature breach</option>
            </Select>
          </div>

          <div>
            <FieldLabel>Units Affected</FieldLabel>
            <Input
              type="number"
              min="1"
              placeholder="e.g. 2"
              value={unitsAffected}
              onChange={(e) => setUnitsAffected(e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>Evidence Photo URLs (Optional)</FieldLabel>
            <Input
              type="text"
              placeholder="Comma-separated URLs (e.g. https://...)"
              value={evidencePhotoUrlsInput}
              onChange={(e) => setEvidencePhotoUrlsInput(e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              placeholder="Describe what happened..."
              value={storeNotes}
              onChange={(e) => setStoreNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-7 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit claim"}
          </Button>
        </div>
      </div>
    </div>
  );
}
