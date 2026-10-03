"use client";

import React from "react";
import Header from "../../components/layout/header";
import { dispatcherNavItems } from "../../components/layout/dispatcher-nav";

export default function DispatcherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#ECEEF5] text-[#0F1020] font-sans antialiased flex flex-col selection:bg-[#F5C542]/30 selection:text-[#0F1928]">
      <Header
        navItems={dispatcherNavItems}
        brandName="Waypoint"
        brandSubtitle="Control"
        homeHref="/dispatcher"
      />
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
