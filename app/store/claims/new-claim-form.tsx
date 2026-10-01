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

interface NewClaimFormProps {
  onClose: () => void;
}

export default function NewClaimForm({ onClose }: NewClaimFormProps) {
  const [orderRef, setOrderRef] = useState("");
  const [claimType, setClaimType] = useState("short_delivery");
  const [description, setDescription] = useState("");

  function handleSubmit() {
    // handle submit logic here
    onClose();
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal card */}
      <div className="relative w-full max-w-[420px] mx-4 rounded-[20px] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.18)] p-8">
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

        {/* Fields */}
        <div className="mt-6 space-y-4">
          <div>
            <FieldLabel>Related Order</FieldLabel>
            <Input
              placeholder="ORD-250613-XXXX"
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>Claim Type</FieldLabel>
            <Select
              value={claimType}
              onChange={(e) => setClaimType(e.target.value)}
            >
              <option value="short_delivery">Short delivery</option>
              <option value="cargo_damage">Cargo damage</option>
              <option value="wrong_item">Wrong item</option>
              <option value="missing_item">Late delivery</option>
            </Select>
          </div>

          <div>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              placeholder="Describe what happened..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-7 flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={handleSubmit}>
            Submit claim
          </Button>
        </div>
      </div>
    </div>
  );
}
