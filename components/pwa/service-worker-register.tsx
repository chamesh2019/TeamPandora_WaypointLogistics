"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service worker active with scope:", registration.scope);
          })
          .catch((error) => {
            console.warn("[PWA] Service worker registration failed:", error);
          });
      });
    }
  }, []);

  return null;
}
