"use client";

import React, { useState, useEffect } from "react";
import { Clipboard, Box, CheckCircle, AlertTriangle, Check } from "lucide-react";
import { Button, StatCard, StatusBadge } from "../design-system";
import type { LoaderManifestDto } from "../../lib/types/loader-api";

interface ManifestsProps {
  notify?: (msg: string) => void;
}

const defaultStops = [
  { stop: "Stop 6", store: "Nugegoda Fresh", cartons: "18 cartons · 324 kg", loc: "Chilled · front" },
  { stop: "Stop 5", store: "Dehiwala Fresh", cartons: "12 cartons · 216 kg", loc: "Chilled · bay B-14" },
  { stop: "Stop 4", store: "Wellawatte Fresh", cartons: "24 cartons · 448 kg", loc: "Ambient · bay A-08" },
  { stop: "Stop 3", store: "Bambalapitiya Fresh", cartons: "16 cartons · 288 kg", loc: "Ambient · bay B-09" },
  { stop: "Stop 2", store: "Maradana Fresh", cartons: "20 cartons · 360 kg", loc: "Ambient · bay A-04" },
  { stop: "Stop 1", store: "Pettah Fresh", cartons: "14 cartons · 252 kg", loc: "Ambient · near doors" },
];

export function Manifests({ notify }: ManifestsProps) {
  const [manifest, setManifest] = useState<LoaderManifestDto | null>(null);
  const [stopsList, setStopsList] = useState(defaultStops);
  const [checked, setChecked] = useState<boolean[]>(Array(defaultStops.length).fill(false));
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/loader/manifests/TRP-250613-11")
      .then((res) => res.json())
      .then((body) => {
        if (isMounted && body && body.data) {
          const m: LoaderManifestDto = body.data;
          setManifest(m);
          if (m.stops && m.stops.length > 0) {
            const mapped = m.stops.map((s) => ({
              stop: `Stop ${s.stopSequence}`,
              store: s.outletName,
              cartons: `${s.cartonsCount} cartons · ${s.weightKg} kg`,
              loc: s.locationHint || (s.tempRequirement === "CHILLED" ? "Chilled · front" : "Ambient"),
            }));
            setStopsList(mapped);
            setChecked(m.stops.map((s) => s.isVerified));
          }
        }
      })
      .catch(() => {
        // graceful offline fallback
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const completedCount = checked.filter(Boolean).length;

  const handleToggle = (idx: number) => {
    const next = [...checked];
    next[idx] = !next[idx];
    setChecked(next);
    if (next[idx]) notify?.(`${stopsList[idx].store} loaded and verified.`);
  };

  const handleSignOff = async () => {
    if (completedCount < stopsList.length) {
      notify?.("Please verify all stops before signing off.");
      return;
    }
    setSyncing(true);

    try {
      const tripId = manifest?.tripId || "TRP-250613-11";
      await fetch(`/api/loader/manifests/${tripId}/verify`, { method: "POST" });
    } catch {
      // ignore network errors in mock mode
    }

    notify?.("Manifest signed off. Synced to control tower.");
    setTimeout(() => setSyncing(false), 2200);
  };

  return (
    <>
      <div className="hero-row">
        <div>
          <div className="panel-title" style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>
            LOADING MANIFESTS
          </div>
          <div className="section-title">Loading manifests</div>
          <div className="section-copy">LIFO sequence · Load final stop first · Trip TRP-250613-11</div>
        </div>
        <Button
          variant="secondary"
          onClick={() => notify?.("Shortfall reported.")}
        >
          <AlertTriangle className="icon-small" /> Report shortfall
        </Button>
      </div>

      <section className="stats-grid">
        <StatCard
          label="Stops to load"
          value={6}
          tone="blue"
          icon={<Clipboard className="icon" />}
          note={`${completedCount} completed`}
          bars={[]}
        />
        <StatCard
          label="Total cartons"
          value={104}
          tone="green"
          icon={<Box className="icon" />}
          note="1,872 kg total"
          bars={[]}
        />
        <StatCard
          label="Time to departure"
          value="38 min"
          tone="purple"
          icon={<CheckCircle className="icon" />}
          note="On schedule"
          bars={[]}
        />
        <StatCard
          label="Shortfalls"
          value={0}
          tone="orange"
          icon={<AlertTriangle className="icon" />}
          note="All items available"
          bars={[]}
        />
      </section>

      <div className="main-grid">
        {/* LIFO checklist */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">LIFO load sequence</div>
              <div className="panel-sub">Check each stop as cartons are loaded into the vehicle</div>
            </div>
            <span className={`sync-badge${syncing ? " syncing" : ""}`}>
              <span />
              {syncing ? "Synchronizing…" : `${completedCount}/${stopsList.length} verified`}
            </span>
          </div>

          <div className="manifest-list">
            {stopsList.map((item, idx) => (
              <div
                key={idx}
                className={`manifest-row${checked[idx] ? " done" : ""}`}
                onClick={() => handleToggle(idx)}
              >
                <div className="check-box">
                  {checked[idx] && <Check style={{ width: 10, height: 10 }} strokeWidth={3} />}
                </div>
                <div>
                  <strong>{item.store}</strong>
                  <small>{item.cartons}</small>
                  <small style={{ color: "var(--blue)", fontWeight: 600 }}>{item.loc}</small>
                </div>
                <span>{item.stop}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: "16px 20px", borderTop: "1px solid var(--line)" }}>
            <div className="load-progress">
              <div>
                <span>Load progress</span>
                <strong>{completedCount}/{stopsList.length} stops</strong>
              </div>
              <div className="progress">
                <span style={{ width: `${(completedCount / stopsList.length) * 100}%` }} />
              </div>
            </div>
            <Button
              variant="primary"
              size="full"
              className="mt-3"
              onClick={handleSignOff}
            >
              <Check className="icon-small" /> SIGN OFF MANIFEST
            </Button>
          </div>
        </div>

        {/* Vehicle info panel */}
        <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">Vehicle details</div>
            </div>
            <div style={{ padding: "14px 20px", display: "grid", gap: 8 }}>
              {[
                ["Vehicle", "WP NC-4872"],
                ["Type", "Reefer truck · Chilled"],
                ["Capacity", "5,000 kg max"],
                ["Bay assigned", "A-01"],
                ["Driver", "Nimal Perera"],
                ["Departure", "03:30"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "4px 0", borderBottom: "1px solid var(--line)" }}
                >
                  <span style={{ color: "var(--muted)" }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">Temperature requirements</div>
            </div>
            <div style={{ padding: "14px 20px" }}>
              {[
                { zone: "Chilled cartons", temp: "−2°C to +4°C", count: "30 cartons", color: "var(--blue)" },
                { zone: "Ambient cartons", temp: "Room temp", count: "74 cartons", color: "var(--green)" },
              ].map((z) => (
                <div key={z.zone} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700 }}>{z.zone}</div>
                    <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>{z.temp}</div>
                  </div>
                  <span className="badge planned">{z.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
