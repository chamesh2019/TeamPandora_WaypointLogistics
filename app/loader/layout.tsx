"use client";

import React from "react";
import { OfflineSyncProvider } from "../../components/offline/offline-sync-provider";
import { ServiceWorkerRegister } from "../../components/pwa/service-worker-register";

export default function LoaderLayout({ children }: { children: React.ReactNode }) {
  return (
    <OfflineSyncProvider>
      <ServiceWorkerRegister />
      {children}
    </OfflineSyncProvider>
  );
}
