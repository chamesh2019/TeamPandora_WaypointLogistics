"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle, Box, Clock, Plus, X } from "lucide-react";

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
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState("Missing items");

  const handleSubmit = () => {
    setShowModal(false);
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
        <button
          className="primary button"
          onClick={() => setShowModal(true)}
        >
          <Plus className="icon-small" /> Report shortfall
        </button>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Open shortfalls</span>
            <div className="stat-icon orange"><AlertTriangle className="icon" /></div>
          </div>
          <div className="stat-value">2</div>
          <div className="stat-note orange">Awaiting resolution</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Resolved today</span>
            <div className="stat-icon green"><CheckCircle className="icon" /></div>
          </div>
          <div className="stat-value">3</div>
          <div className="stat-note green">2 substituted · 1 cancelled</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Units short today</span>
            <div className="stat-icon purple"><Box className="icon" /></div>
          </div>
          <div className="stat-value">10</div>
          <div className="stat-note purple">Across 2 trips</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Avg resolution</span>
            <div className="stat-icon blue"><Clock className="icon" /></div>
          </div>
          <div className="stat-value">22 min</div>
          <div className="stat-note blue">Last 7 days</div>
        </div>
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
              {existingShortfalls.map((sf) => (
                <tr key={sf.id}>
                  <td className="tid">{sf.id}</td>
                  <td style={{ fontWeight: 600 }}>{sf.store}</td>
                  <td className="dim">{sf.item}</td>
                  <td style={{ fontWeight: 600 }}>{sf.qty}</td>
                  <td className="mono dim">{sf.time}</td>
                  <td>
                    <span
                      className={`badge ${
                        sf.status === "Resolved"
                          ? "delivered"
                          : sf.status === "Substituted"
                          ? "substituted"
                          : "open"
                      }`}
                    >
                      {sf.status}
                    </span>
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
            <input type="number" placeholder="e.g. 6" />

            <label>Notes (optional)</label>
            <textarea placeholder="Additional context…" rows={2} />

            <div className="modal-actions">
              <button className="secondary button" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="primary button" onClick={handleSubmit}>
                <AlertTriangle className="icon-small" /> Submit report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
