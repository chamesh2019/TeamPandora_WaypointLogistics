"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Box, Clock, Plus, X } from "lucide-react";
import { Button, StatCard, StatusBadge } from "../design-system";
import type { LoaderExceptionDto } from "../../lib/types/loader-api";

interface ShortfallsProps {
  notify?: (msg: string) => void;
}

const shortfallTypes = [
  "Missing items",
  "Damaged stock",
  "Quantity short",
  "Wrong SKU",
  "Temperature breach",
  "Other",
];

const existingShortfalls = [
  {
    id: "SF-250613-01",
    store: "Pettah Fresh · Stop 1",
    item: "Anchor Butter 500g",
    qty: "6 units short",
    status: "Open",
    time: "02:14",
    trip: "TRP-250613-11",
  },
  {
    id: "SF-250613-02",
    store: "Maradana Fresh · Stop 2",
    item: "Kotmale Milk 1L",
    qty: "4 units short",
    status: "Substituted",
    time: "02:41",
    trip: "TRP-250613-11",
  },
  {
    id: "SF-250611-01",
    store: "Kandy City · Stop 7",
    item: "Cargills Cheese 250g",
    qty: "12 units short",
    status: "Resolved",
    time: "08:32",
    trip: "TRP-250611-04",
  },
];

export function Shortfalls({ notify }: ShortfallsProps) {
  const [shortfalls, setShortfalls] = useState(existingShortfalls);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState("Missing items");
  const [qtyInput, setQtyInput] = useState("6");
  const [notesInput, setNotesInput] = useState("");

  useEffect(() => {
    let isMounted = true;
    fetch("/api/loader/exceptions")
      .then((res) => res.json())
      .then((body) => {
        if (isMounted && body && body.data && body.data.length > 0) {
          const mapped = body.data.map((sf: LoaderExceptionDto) => ({
            id: sf.exceptionId,
            store: sf.storeName || "Pettah Fresh · Stop 1",
            item: sf.itemName || "Stock Item",
            qty: `${sf.quantityShort} units short`,
            status: sf.status,
            time: sf.createdAt && sf.createdAt.includes("T") ? sf.createdAt.split("T")[1].slice(0, 5) : sf.createdAt || "02:14",
            trip: sf.tripId,
          }));
          setShortfalls(mapped);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async () => {
    setShowModal(false);
    try {
      const typeEnum =
        selectedType === "Damaged stock"
          ? "DAMAGED_CARTON"
          : selectedType === "Temperature breach"
          ? "TEMPERATURE_NONCOMPLIANT"
          : "MISSING_STOCK";

      await fetch("/api/loader/exceptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: "TRP-250613-11",
          orderId: "ORD-001",
          exceptionType: typeEnum,
          quantityShort: Number(qtyInput) || 1,
          notes: notesInput,
        }),
      });
    } catch {
      // offline fallback
    }

    notify?.("Shortfall reported. Control tower notified.");
  };

  return (
    <>
      <div className="hero-row">
        <div>
          <div className="panel-title" style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>
            SHORTFALLS
          </div>
          <div className="section-title">Shortfall log</div>
          <div className="section-copy">Missing or insufficient stock reports · Peliyagoda depot</div>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
        >
          <Plus className="icon-small" /> Report shortfall
        </Button>
      </div>

      <section className="stats-grid">
        <StatCard
          label="Open shortfalls"
          value={2}
          tone="orange"
          icon={<AlertTriangle className="icon" />}
          note="Awaiting resolution"
          bars={[]}
        />
        <StatCard
          label="Resolved today"
          value={3}
          tone="green"
          icon={<CheckCircle className="icon" />}
          note="2 substituted · 1 cancelled"
          bars={[]}
        />
        <StatCard
          label="Units short today"
          value={10}
          tone="purple"
          icon={<Box className="icon" />}
          note="Across 2 trips"
          bars={[]}
        />
        <StatCard
          label="Avg resolution"
          value="22 min"
          tone="blue"
          icon={<Clock className="icon" />}
          note="Last 7 days"
          bars={[]}
        />
      </section>

      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Shortfall log</div>
            <div className="panel-sub">All shortfalls for today&apos;s trips</div>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Stop / Store</th>
                <th>Item</th>
                <th>Shortage</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {shortfalls.map((sf) => (
                <tr key={sf.id}>
                  <td className="tid">{sf.id}</td>
                  <td style={{ fontWeight: 600 }}>{sf.store}</td>
                  <td className="dim">{sf.item}</td>
                  <td style={{ fontWeight: 600 }}>{sf.qty}</td>
                  <td className="mono dim">{sf.time}</td>
                  <td>
                    <StatusBadge
                      status={
                        sf.status === "Resolved"
                          ? "delivered"
                          : sf.status === "Substituted"
                          ? "substituted"
                          : "open"
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Shortfall Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div className="modal-icon">
                <AlertTriangle className="icon" />
              </div>
              <button
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4 }}
                onClick={() => setShowModal(false)}
              >
                <X className="icon" />
              </button>
            </div>
            <div className="modal-title">Report shortfall</div>
            <div className="modal-copy">Log a stock shortage against the current trip. Control tower will be notified immediately.</div>

            <label>Shortfall type</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
              {shortfallTypes.map((type) => (
                <button
                  key={type}
                  className={`exc-type-btn${selectedType === type ? " active" : ""}`}
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </button>
              ))}
            </div>

            <label>Affected stop</label>
            <select>
              {["Stop 1 · Pettah Fresh", "Stop 2 · Maradana Fresh", "Stop 3 · Bambalapitiya Fresh", "Stop 4 · Wellawatte Fresh"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <label>Item / SKU</label>
            <input type="text" placeholder="e.g. Anchor Butter 500g" />

            <label>Quantity short</label>
            <input
              type="number"
              placeholder="e.g. 6"
              value={qtyInput}
              onChange={(e) => setQtyInput(e.target.value)}
            />

            <label>Notes (optional)</label>
            <textarea
              placeholder="Additional context…"
              rows={2}
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
            />

            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSubmit}>
                <AlertTriangle className="icon-small" /> Submit report
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
