import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import { router } from "@/router";
import { queryClient } from "@/lib/queryClient";
import { useThemeStore } from "@/stores/themeStore";
import "./index.css";
import { registerSW } from "virtual:pwa-register";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";

// Initialize theme on app startup
useThemeStore.getState().initializeTheme();

const updateSW = registerSW({
  onNeedRefresh() {
    // Tampilkan toast: ada update tersedia
    if (confirm("Ada versi baru tersedia. Update sekarang?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App siap digunakan offline");
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
        {import.meta.env.DEV && <ReactQueryDevtools />}
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
