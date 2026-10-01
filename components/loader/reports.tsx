"use client";

import React from "react";
import { TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface ReportsProps {
  notify?: (msg: string) => void;
}

const weeklyData = [
  { day: "Mon", cartons: 248, height: 62 },
  { day: "Tue", cartons: 312, height: 78 },
  { day: "Wed", cartons: 272, height: 68 },
  { day: "Thu", cartons: 368, height: 92 },
  { day: "Fri", cartons: 328, height: 82 },
  { day: "Sat", cartons: 216, height: 54 },
  { day: "Sun", cartons: 182, height: 46 },
];

const kpiCards = [
  { label: "Cartons loaded this week", value: "1,842", delta: "+4.2%", tone: "green" },
  { label: "Shortfalls reported", value: "7", delta: "-2 vs last week", tone: "orange" },
  { label: "Damage reports", value: "2", delta: "All resolved", tone: "green" },
  { label: "On-time departures", value: "94%", delta: "+1.1%", tone: "green" },
];

const perfRows = [
  { metric: "Total cartons loaded", value: "1,842", vs: "1,768 last week", change: "+4.2%", up: true },
  { metric: "Average loading time", value: "38 min", vs: "41 min last week", change: "-7.3%", up: true },
  { metric: "Shortfall rate", value: "1.2%", vs: "1.9% last week", change: "-0.7pp", up: true },
  { metric: "Damage rate", value: "0.1%", vs: "0.3% last week", change: "-0.2pp", up: true },
  { metric: "On-time departure rate", value: "94%", vs: "93% last week", change: "+1pp", up: true },
  { metric: "Trips supported", value: "21", vs: "19 last week", change: "+2", up: true },
];

export function Reports({ notify }: ReportsProps) {
  return (
    <>
      <div className="hero-row">
        <div>
          <div className="panel-title" style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>
            REPORTS
          </div>
          <div className="section-title">Loader performance</div>
          <div className="section-copy">Peliyagoda depot · Week ending {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</div>
        </div>
        <button
          className="secondary button"
          onClick={() => notify?.("Report exported.")}
        >
          <TrendingUp className="icon-small" /> Export report
        </button>
      </div>

      {/* KPI Cards */}
      <section className="stats-grid">
        {kpiCards.map((card) => (
          <div className="stat-card" key={card.label}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>
              {card.value}
            </div>
            <div style={{ fontSize: 9, color: `var(--${card.tone})`, marginTop: 6, fontWeight: 600 }}>
              {card.delta}
            </div>
          </div>
        ))}
      </section>

      <div className="main-grid">
        {/* Weekly Bar Chart */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Weekly loading volume</div>
              <div className="panel-sub">Cartons loaded per day · This week</div>
            </div>
            <span className="kpi-chip">
              <span className="live-dot" />
              <strong>1,842</strong> this week
            </span>
          </div>
          <div className="chart">
            {weeklyData.map((d, idx) => (
              <div className="bar-column" key={d.day}>
                <div className={`bar h-${d.height}`} style={{ height: "100%", display: "flex", alignItems: "flex-end" }}>
                  <span
                    style={{
                      height: `${d.height}%`,
                      width: "100%",
                      borderRadius: "5px 5px 2px 2px",
                      background:
                        idx === weeklyData.length - 2
                          ? "linear-gradient(180deg, #f5c542d9, var(--primary))"
                          : "linear-gradient(180deg, #f5c54266, #f5c54233)",
                      display: "block",
                    }}
                  />
                </div>
                <div>{d.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance table */}
        <div className="panel" style={{ alignSelf: "start" }}>
          <div className="panel-head">
            <div>
              <div className="panel-title">Performance breakdown</div>
              <div className="panel-sub">This week vs last week</div>
            </div>
          </div>
          <div style={{ padding: "0 0 4px" }}>
            {perfRows.map((row) => (
              <div
                key={row.metric}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid var(--line)" }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{row.metric}</div>
                  <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>{row.vs}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>{row.value}</div>
                  <div style={{ fontSize: 9, color: row.up ? "var(--green)" : "var(--red)", fontWeight: 700, marginTop: 2 }}>{row.change}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Recent loading activity</div>
            <div className="panel-sub">Last 10 trips you supported</div>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Trip</th>
                <th>Date</th>
                <th>Vehicle</th>
                <th>Cartons</th>
                <th>Shortfalls</th>
                <th>Loading time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: "TRP-250613-11", date: "Today", vehicle: "WP NC-4872", cartons: 104, shortfalls: 2, time: "38 min", status: "In progress" },
                { id: "TRP-250612-08", date: "Yesterday", vehicle: "WP CB-1922", cartons: 140, shortfalls: 0, time: "41 min", status: "Complete" },
                { id: "TRP-250612-03", date: "Yesterday", vehicle: "WP LN-8831", cartons: 96, shortfalls: 1, time: "36 min", status: "Complete" },
                { id: "TRP-250611-04", date: "2 days ago", vehicle: "WP NC-4872", cartons: 112, shortfalls: 0, time: "39 min", status: "Complete" },
                { id: "TRP-250610-07", date: "3 days ago", vehicle: "WP KP-3308", cartons: 88, shortfalls: 3, time: "44 min", status: "Complete" },
              ].map((row) => (
                <tr key={row.id}>
                  <td className="tid">{row.id}</td>
                  <td className="dim">{row.date}</td>
                  <td style={{ fontWeight: 600 }}>{row.vehicle}</td>
                  <td style={{ fontWeight: 600 }}>{row.cartons}</td>
                  <td>
                    {row.shortfalls > 0 ? (
                      <span className="badge open">{row.shortfalls}</span>
                    ) : (
                      <span className="badge delivered">0</span>
                    )}
                  </td>
                  <td className="mono">{row.time}</td>
                  <td>
                    <span className={`badge ${row.status === "Complete" ? "delivered" : "planned"}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
