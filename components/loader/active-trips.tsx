"use client";

import React, { useState, useEffect } from "react";
import { Truck, Box, Clock, CheckCircle } from "lucide-react";
import { Button, StatCard, StatusBadge } from "../design-system";
import type { LoaderTripSummary } from "../../lib/types/loader-api";

interface ActiveTripsProps {
  notify?: (msg: string) => void;
}

const defaultTrips = [
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
  const [trips, setTrips] = useState(defaultTrips);
  const [selected, setSelected] = useState(defaultTrips[0]);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/loader/trips")
      .then((res) => res.json())
      .then((body) => {
        if (isMounted && body && body.data && body.data.length > 0) {
          const mapped = body.data.map((t: LoaderTripSummary) => ({
            id: t.tripId,
            vehicle: t.vehicleId,
            type: t.vehicleType,
            route: t.route,
            driver: t.driver,
            stops: t.stops,
            cartons: t.cartons,
            departure: t.departure,
            status: t.status,
            progress: t.progress,
            bay: t.bay,
          }));
          setTrips(mapped);
          setSelected(mapped[0]);
        }
      })
      .catch(() => {
        // graceful offline fallback
      });
    return () => {
      isMounted = false;
    };
  }, []);

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
        <StatCard
          label="Trips today"
          value={3}
          tone="blue"
          icon={<Truck className="icon" />}
          note="2 loading · 1 pending"
          bars={[]}
        />
        <StatCard
          label="Cartons total"
          value={340}
          tone="green"
          icon={<Box className="icon" />}
          note="Across 30 stops"
          bars={[]}
        />
        <StatCard
          label="First departure"
          value="03:30"
          tone="purple"
          icon={<Clock className="icon" />}
          note="TRP-250613-01"
          bars={[]}
        />
        <StatCard
          label="Ready to depart"
          value={1}
          tone="orange"
          icon={<CheckCircle className="icon" />}
          note="TRP-250613-02"
          bars={[]}
        />
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
                    <StatusBadge
                      status={
                        trip.status === "Loading"
                          ? "planned"
                          : trip.status === "Staging"
                          ? "pending"
                          : "draft"
                      }
                    />
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
              <Button
                variant="primary"
                onClick={() => notify?.(`Loading confirmed for ${selected.id}.`)}
              >
                Mark loading complete
              </Button>
              <Button
                variant="secondary"
                onClick={() => notify?.("Shortfall reported to control tower.")}
              >
                Report shortfall
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
