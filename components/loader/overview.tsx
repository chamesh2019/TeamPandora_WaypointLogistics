"use client";

import React, { useState, useEffect } from "react";
import { Truck, Box, Clock, AlertTriangle } from "lucide-react";
import { Button, StatCard, StatusBadge } from "../design-system";
import type { LoaderOverviewDto } from "../../lib/types/loader-api";

interface LoaderOverviewProps {
  name: string;
  notify?: (msg: string) => void;
}

export function LoaderOverview({ name, notify }: LoaderOverviewProps) {
  const firstName = name.split(" ")[0];

  const [data, setData] = useState<LoaderOverviewDto | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/loader/overview")
      .then((res) => res.json())
      .then((body) => {
        if (isMounted && body && body.data) {
          setData(body.data);
        }
      })
      .catch(() => {
        // graceful offline fallback
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const activeBays = data ? data.activeBaysCount : 4;
  const loadingBays = data ? data.loadingBaysCount : 2;
  const cartonsStaged = data ? data.cartonsStaged : 284;
  const cartonsVerifiedPct = data ? data.cartonsVerifiedPct : 86;
  const departureEta = data ? `${data.departureEtaMin} min` : "38 min";
  const shortfallRate = data ? `${data.shortfallRatePct}%` : "1.2%";

  const assignments = data && data.activeAssignments.length > 0 ? data.activeAssignments : [
    {
      bay: "A-01",
      vehicle: "WP NC-4872",
      dest: "Colombo South Route",
      status: "Loading",
      progress: 68,
    },
    {
      bay: "A-04",
      vehicle: "WP CB-1922",
      dest: "Kandy Express",
      status: "Staging",
      progress: 12,
    },
    {
      bay: "B-02",
      vehicle: "WP LN-8831",
      dest: "Negombo North",
      status: "Complete",
      progress: 100,
    },
  ];

  return (
    <>
      <div className="hero-row">
        <div>
          <div className="section-title">
            {greeting()}, {firstName}
          </div>
          <div className="section-copy">Peliyagoda loading bay · Trip TRP-250613-11</div>
        </div>
        <Button
          variant="secondary"
          onClick={() => notify?.("Shortfall alert sent to control tower.")}
        >
          <AlertTriangle className="icon-small" /> Report shortfall
        </Button>
      </div>

      <section className="stats-grid">
        <StatCard
          label="Active bays"
          value={activeBays}
          tone="blue"
          icon={<Truck className="icon" />}
          note={`${loadingBays} loading now`}
          bars={[]}
        />
        <StatCard
          label="Cartons staged"
          value={cartonsStaged}
          tone="green"
          icon={<Box className="icon" />}
          note={`${cartonsVerifiedPct}% verified`}
          bars={[]}
        />
        <StatCard
          label="Time to departure"
          value={departureEta}
          tone="purple"
          icon={<Clock className="icon" />}
          note="Loading on schedule"
          bars={[]}
        />
        <StatCard
          label="Shortfall rate"
          value={shortfallRate}
          tone="orange"
          icon={<AlertTriangle className="icon" />}
          note="Below 2% threshold"
          bars={[]}
        />
      </section>
      
      <div className="main-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Active dock assignments</div>
              <div className="panel-sub">Current vehicles at loading bays</div>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bay</th>
                  <th>Vehicle</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className="stop-number">{item.bay}</span>
                    </td>
                    <td className="tid">{item.vehicle}</td>
                    <td className="dim">{item.dest}</td>
                    <td>
                      <StatusBadge
                        status={
                          item.status === "Complete"
                            ? "delivered"
                            : item.status === "Loading"
                            ? "planned"
                            : "pending"
                        }
                      />
                    </td>
                    <td>
                      <div className="progress-copy">
                        <strong>{item.progress}%</strong>
                      </div>
                      <div className="progress">
                        <span style={{ width: `${item.progress}%` }}></span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="panel" style={{ alignSelf: "start" }}>
          <div className="panel-head">
            <div>
              <div className="panel-title">Recent alerts</div>
              <div className="panel-sub">Operational notifications</div>
            </div>
          </div>
          <div>
             <div className="alert-item">
               <div className="alert-icon"><AlertTriangle className="icon" /></div>
               <div>
                 <div className="alert-title">Temperature deviation</div>
                 <div className="alert-copy">Bay B-04 chilled staging area</div>
               </div>
               <div className="alert-meta">12m</div>
             </div>
             <div className="alert-item">
               <div className="alert-icon blue"><Box className="icon" /></div>
               <div>
                 <div className="alert-title">Pallet shortage</div>
                 <div className="alert-copy">Need 12 standard pallets at A-01</div>
               </div>
               <div className="alert-meta">45m</div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
