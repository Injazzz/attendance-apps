import { Bell, Wifi, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { notificationApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeChanger } from "@/components/shared/ThemeChanger";
import { useEffect, useState } from "react";

export function TopBar() {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const { data } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationApi.getAll({ per_page: 50 }),
    refetchInterval: 30000,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unreadCount = (data?.data ?? []).filter((n: any) => !n.read_at).length;

  return (
    <header className="h-14 border-b bg-background flex items-center px-4 gap-3 lg:px-6">
      <div className="flex-1" />
      {/* Indikator online/offline */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {isOnline ? (
          <>
            <Wifi className="w-3.5 h-3.5 text-green-500" />
            <span className="hidden sm:block">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5 text-destructive" />
            <span className="hidden sm:block text-destructive">Offline</span>
          </>
        )}
      </div>
      {/* Theme Changer */}
      <ThemeChanger />
      {/* Notifikasi bell */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => navigate("/notifications")}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>
    </header>
  );
}
