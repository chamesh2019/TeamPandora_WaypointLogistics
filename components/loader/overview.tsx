import React from "react";
import { Truck, Box, Clock, AlertTriangle } from "lucide-react";

interface LoaderOverviewProps {
  name: string;
  notify?: (msg: string) => void;
}

export function LoaderOverview({ name, notify }: LoaderOverviewProps) {
  const firstName = name.split(" ")[0];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <>
      <div className="hero-row">
        <div>
          <div className="section-title">
            {greeting()}, {firstName}
          </div>
          <div className="section-copy">Peliyagoda loading bay · Trip TRP-250613-11</div>
        </div>
        <button
          className="secondary button"
          onClick={() => notify?.("Shortfall alert sent to control tower.")}
        >
          <AlertTriangle className="icon-small" /> Report shortfall
        </button>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Active bays</span>
            <div className="stat-icon blue">
              <Truck className="icon" />
            </div>
          </div>
          <div className="stat-value">4</div>
          <div className="stat-note blue">2 loading now</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Cartons staged</span>
            <div className="stat-icon green">
              <Box className="icon" />
            </div>
          </div>
          <div className="stat-value">284</div>
          <div className="stat-note green">86% verified</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Time to departure</span>
            <div className="stat-icon purple">
              <Clock className="icon" />
            </div>
          </div>
          <div className="stat-value">38 min</div>
          <div className="stat-note purple">Loading on schedule</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Shortfall rate</span>
            <div className="stat-icon orange">
              <AlertTriangle className="icon" />
            </div>
          </div>
          <div className="stat-value">1.2%</div>
          <div className="stat-note orange">Below 2% threshold</div>
        </div>
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
                {[
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
                ].map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className="stop-number">{item.bay}</span>
                    </td>
                    <td className="tid">{item.vehicle}</td>
                    <td className="dim">{item.dest}</td>
                    <td>
                      <span
                        className={`badge ${
                          item.status === "Complete"
                            ? "delivered"
                            : item.status === "Loading"
                            ? "planned"
                            : "pending"
                        }`}
                      >
                        {item.status}
                      </span>
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
