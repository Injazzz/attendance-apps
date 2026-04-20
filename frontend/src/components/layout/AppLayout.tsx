import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { subscribeToNotifications } from "@/lib/websocket";
import { requestNotificationPermission } from "@/lib/notification";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";
import PWABadge from "@/PWABadge";

export function AppLayout() {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    // Minta izin notifikasi browser
    requestNotificationPermission();

    // Subscribe ke notifikasi real-time
    subscribeToNotifications(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* PWA Install Badge */}
      <PWABadge />

      {/* Sidebar — hanya tampil di desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30">
        <Sidebar />
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1 lg:pl-64">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-10 md:pb-5">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}
