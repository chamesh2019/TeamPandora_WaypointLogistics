import React from "react";

export function LogisticsIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 520 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 500 }}
    >
      {/* Map grid lines */}
      {[50, 100, 150, 200, 250].map((y) => (
        <line
          key={`h${y}`}
          x1="0"
          y1={y}
          x2="520"
          y2={y}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
      ))}
      {[80, 160, 240, 320, 400, 480].map((x) => (
        <line
          key={`v${x}`}
          x1={x}
          y1="0"
          x2={x}
          y2="300"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
      ))}

      {/* Transit Route curve */}
      <path
        d="M 30 230 C 80 200 120 165 175 180 S 255 215 310 175 S 400 130 470 145"
        stroke="rgba(245,197,66,0.3)"
        strokeWidth="2.5"
        strokeDasharray="6 4"
      />

      {/* Stop glow halos */}
      <circle cx="175" cy="180" r="20" fill="rgba(245,197,66,0.06)" />
      <circle cx="310" cy="175" r="20" fill="rgba(245,197,66,0.06)" />
      <circle cx="470" cy="145" r="26" fill="rgba(245,197,66,0.08)" />

      {/* Stop pins */}
      <circle
        cx="175"
        cy="180"
        r="7"
        fill="rgba(245,197,66,0.15)"
        stroke="rgba(245,197,66,0.6)"
        strokeWidth="1.5"
      />
      <circle cx="175" cy="180" r="3" fill="#F5C542" />

      <circle
        cx="310"
        cy="175"
        r="7"
        fill="rgba(245,197,66,0.15)"
        stroke="rgba(245,197,66,0.6)"
        strokeWidth="1.5"
      />
      <circle cx="310" cy="175" r="3" fill="#F5C542" />

      {/* Central Depot Node */}
      <circle
        cx="470"
        cy="145"
        r="10"
        fill="rgba(245,197,66,0.2)"
        stroke="#F5C542"
        strokeWidth="2"
      />
      <circle cx="470" cy="145" r="4" fill="#F5C542" />

      {/* Distribution Depot Building */}
      <rect
        x="440"
        y="80"
        width="56"
        height="68"
        rx="4"
        fill="rgba(255,255,255,0.04)"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1.5"
      />
      <path
        d="M 436 80 L 468 60 L 500 80"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1.5"
      />
      <rect
        x="452"
        y="104"
        width="24"
        height="44"
        rx="1"
        fill="rgba(255,255,255,0.04)"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1"
      />
      <rect x="448" y="86" width="12" height="10" rx="1" fill="rgba(245,197,66,0.12)" />
      <rect x="465" y="86" width="12" height="10" rx="1" fill="rgba(245,197,66,0.12)" />

      {/* Delivery Truck */}
      <rect
        x="52"
        y="200"
        width="128"
        height="52"
        rx="4"
        fill="rgba(255,255,255,0.05)"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="1.5"
      />
      <rect
        x="30"
        y="210"
        width="44"
        height="42"
        rx="4"
        fill="rgba(255,255,255,0.06)"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.5"
      />
      <rect
        x="40"
        y="220"
        width="20"
        height="14"
        rx="2"
        fill="rgba(245,197,66,0.15)"
        stroke="rgba(245,197,66,0.3)"
        strokeWidth="1"
      />
      <circle
        cx="66"
        cy="252"
        r="10"
        fill="rgba(255,255,255,0.05)"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.5"
      />
      <circle cx="66" cy="252" r="4" fill="rgba(255,255,255,0.1)" />
      <circle
        cx="146"
        cy="252"
        r="10"
        fill="rgba(255,255,255,0.05)"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.5"
      />
      <circle cx="146" cy="252" r="4" fill="rgba(255,255,255,0.1)" />
    </svg>
  );
}
