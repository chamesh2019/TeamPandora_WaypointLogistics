"use client";

import React, { useState } from "react";
import { Truck, Box, Clock, CheckCircle } from "lucide-react";

interface ActiveTripsProps {
  notify?: (msg: string) => void;
}

const trips = [
  {
    id: "TRP-250613-01",
    vehicle: "WP NC-4872",
    type: "Reefer · Chilled",
    route: "Colombo South",
    driver: "Nimal Perera",
    stops: 12,
    cartons: 104,
    departure: "03:30",
    status: "Loading",
    progress: 68,
    bay: "A-01",
  },
  {
    id: "TRP-250613-02",
    vehicle: "WP CB-1922",
    type: "Ambient",
    route: "Kandy Express",
    driver: "Suresh Bandara",
    stops: 8,
    cartons: 140,
    departure: "04:00",
    status: "Staging",
    progress: 12,
    bay: "A-04",
  },
  {
    id: "TRP-250613-03",
    vehicle: "WP LN-8831",
    type: "Ambient",
    route: "Negombo North",
    driver: "Kamani Silva",
    stops: 10,
    cartons: 96,
    departure: "04:30",
    status: "Pending",
    progress: 0,
    bay: "B-03",
  },
];

export function ActiveTrips({ notify }: ActiveTripsProps) {
  const [selected, setSelected] = useState(trips[0]);

  return (
    <>
      <div className="hero-row">
        <div>
          <div className="panel-title" style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>
            ACTIVE TRIPS
          </div>
          <div className="section-title">Today&apos;s loading schedule</div>
          <div className="section-copy">Peliyagoda depot · {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</div>
        </div>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Trips today</span>
            <div className="stat-icon blue"><Truck className="icon" /></div>
          </div>
          <div className="stat-value">3</div>
          <div className="stat-note blue">2 loading · 1 pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Cartons total</span>
            <div className="stat-icon green"><Box className="icon" /></div>
          </div>
          <div className="stat-value">340</div>
          <div className="stat-note green">Across 30 stops</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">First departure</span>
            <div className="stat-icon purple"><Clock className="icon" /></div>
          </div>
          <div className="stat-value">03:30</div>
          <div className="stat-note purple">TRP-250613-01</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Ready to depart</span>
            <div className="stat-icon orange"><CheckCircle className="icon" /></div>
          </div>
          <div className="stat-value">1</div>
          <div className="stat-note orange">TRP-250613-02</div>
        </div>
      </section>

      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Trip queue</div>
            <div className="panel-sub">Loading priority order</div>
          </div>
        </div>
        <div className="plan-grid">
          {/* Trip list */}
          <div className="plan-list">
            {trips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => setSelected(trip)}
                className={`plan-trip${selected.id === trip.id ? " selected" : ""}`}
              >
                <div>
                  <div className="tid">{trip.id}</div>
                  <div className="dim" style={{ fontSize: 9, marginTop: 3 }}>{trip.vehicle} · {trip.route}</div>
                  <div style={{ marginTop: 6 }}>
                    <span
                      className={`badge ${trip.status === "Loading" ? "planned" : trip.status === "Staging" ? "pending" : "draft"}`}
                    >
                      {trip.status}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{trip.departure}</div>
                  <div className="dim" style={{ fontSize: 9 }}>Dep. time</div>
                </div>
              </div>
            ))}
          </div>

          {/* Trip detail */}
          <div className="plan-detail">
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{selected.id}</div>
            <div className="dim" style={{ fontSize: 11, marginBottom: 18 }}>{selected.vehicle} · {selected.type}</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                ["Bay", selected.bay],
                ["Driver", selected.driver],
                ["Route", selected.route],
                ["Stops", String(selected.stops)],
                ["Cartons", String(selected.cartons)],
                ["Departure", selected.departure],
              ].map(([label, value]) => (
                <div key={label} style={{ padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 8 }}>
                  <div style={{ fontSize: 8, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 8 }}>
              <div className="progress-copy">
                <span>Loading progress</span>
                <strong>{selected.progress}%</strong>
              </div>
              <div className="progress">
                <span style={{ width: `${selected.progress}%` }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
              <button
                className="primary button"
                onClick={() => notify?.(`Loading confirmed for ${selected.id}.`)}
              >
                Mark loading complete
              </button>
              <button
                className="secondary button"
                onClick={() => notify?.("Shortfall reported to control tower.")}
              >
                Report shortfall
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
