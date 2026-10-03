"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Button,
  Input,
  Select,
  FieldLabel,
} from "../../../components/design-system";

interface ReportShortfallFormProps {
  onClose: () => void;
}

export default function ReportShortfallForm({
  onClose,
}: ReportShortfallFormProps) {
  const [trip, setTrip] = useState("TRP-250614-01");
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [reason, setReason] = useState("Stock exhausted");

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
          <AlertTriangle className="h-5 w-5 text-[#F5A623]" />
        </div>

        {/* Title */}
        <h2 className="text-[20px] font-extrabold tracking-[-0.03em] text-[#0F1020]">
          Report a shortfall
        </h2>
        <p className="mt-1 text-[12px] leading-[1.6] text-[#747B93]">
          Log a missing or insufficient stock item for a trip being loaded at
          this depot.
        </p>

        {/* Fields */}
        <div className="mt-5 space-y-4">
          {/* Trip */}
          <div>
            <FieldLabel>TRIP</FieldLabel>
            <Select value={trip} onChange={(e) => setTrip(e.target.value)}>
              <option value="TRP-250614-01">TRP-250614-01</option>
              <option value="TRP-250614-02">TRP-250614-02</option>
              <option value="TRP-250614-03">TRP-250614-03</option>
            </Select>
          </div>

          {/* SKU / Product Code */}
          <div>
            <FieldLabel>SKU / PRODUCT CODE</FieldLabel>
            <Input
              type="text"
              placeholder="e.g. WPF-CHKN-FRZ-24"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </div>

          {/* Quantity Short */}
          <div>
            <FieldLabel>QUANTITY SHORT</FieldLabel>
            <Input
              type="number"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0"
            />
          </div>

          {/* Reason */}
          <div>
            <FieldLabel>REASON</FieldLabel>
            <Select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="Stock exhausted">Stock exhausted</option>
              <option value="Picking error">Picking error</option>
              <option value="Damaged goods">Damaged goods</option>
              <option value="Incorrect quantity">Incorrect quantity</option>
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
            className="px-5 py-2 text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold"
          >
            Report shortfall
          </Button>
        </div>
      </div>
    </div>
  );
}
