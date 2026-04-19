import { Bell, Wifi, WifiOff, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { notificationApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeChanger } from "@/components/shared/ThemeChanger";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/authStore";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Clock,
  Timer,
  Users,
  FileText,
  QrCode,
  Settings,
  LogOut,
  MapPin,
  Building2,
  Briefcase,
  Shield,
  Smartphone,
} from "lucide-react";
import { authApi } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
  role?: string;
}

const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Absensi", href: "/attendance", icon: Clock },
  { label: "Lembur", href: "/overtime", icon: Timer },
];

const managementNav: NavItem[] = [
  {
    label: "Karyawan",
    href: "/employees",
    icon: Users,
    permission: "employees.view",
  },
  {
    label: "QR Display",
    href: "/qr-displays",
    icon: QrCode,
    permission: "qr.view",
  },
  {
    label: "Laporan",
    href: "/reports",
    icon: FileText,
    permission: "reports.daily",
  },
];

const masterNav: NavItem[] = [
  {
    label: "Site/Proyek",
    href: "/master/sites",
    icon: MapPin,
    permission: "sites.view",
  },
  {
    label: "Departemen",
    href: "/master/departments",
    icon: Building2,
    permission: "departments.manage",
  },
  {
    label: "Jabatan",
    href: "/master/positions",
    icon: Briefcase,
    permission: "departments.manage",
  },
];

const adminNav: NavItem[] = [
  {
    label: "Pengguna",
    href: "/users",
    icon: Shield,
    permission: "users.manage",
  },
  {
    label: "Perangkat",
    href: "/devices",
    icon: Smartphone,
    role: "super_admin",
  },
  {
    label: "Pengaturan",
    href: "/settings",
    icon: Settings,
    permission: "settings.view",
  },
];

export function TopBar() {
  const navigate = useNavigate();
  const { user, hasPermission, clearAuth } = useAuthStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const qc = useQueryClient();

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
    queryFn: () => notificationApi.getAll({ is_read: false, per_page: 1 }),
    refetchInterval: 30000,
  });

  const unreadCount = data?.meta?.total ?? 0;

  const canShow = (item: NavItem) => {
    if (item.role)
      return user?.role === item.role || user?.role === "super_admin";
    if (item.permission) return hasPermission(item.permission);
    return true;
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      qc.clear();
      clearAuth();
      navigate("/login");
    }
  };

  const NavLink_ = ({
    item,
    onClick,
  }: {
    item: NavItem;
    onClick?: () => void;
  }) => (
    <NavLink
      to={item.href}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
          isActive
            ? "bg-primary text-primary-foreground font-medium"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )
      }
    >
      <item.icon className="w-4 h-4 shrink-0" />
      {item.label}
    </NavLink>
  );

  return (
    <>
      <header className="h-14 border-b bg-background flex items-center px-4 gap-3 lg:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(true)}
          className="lg:hidden"
        >
          <Menu className="w-4 h-4" />
        </Button>

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

      {/* Mobile menu drawer */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="px-4 py-2">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          <div className="overflow-y-auto h-full pb-20">
            {/* Main Navigation */}
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground font-medium px-3 mb-1">
                Utama
              </p>
              {mainNav.map((item) => (
                <NavLink_
                  key={item.href}
                  item={item}
                  onClick={() => setIsMenuOpen(false)}
                />
              ))}
            </div>

            {/* Management Navigation */}
            {managementNav.filter(canShow).length > 0 && (
              <div className="px-3 py-2">
                <p className="text-xs text-muted-foreground font-medium px-3 mb-1">
                  Manajemen
                </p>
                {managementNav.filter(canShow).map((item) => (
                  <NavLink_
                    key={item.href}
                    item={item}
                    onClick={() => setIsMenuOpen(false)}
                  />
                ))}
              </div>
            )}

            {/* Master Data Navigation */}
            {masterNav.filter(canShow).length > 0 && (
              <div className="px-3 py-2">
                <p className="text-xs text-muted-foreground font-medium px-3 mb-1">
                  Master Data
                </p>
                {masterNav.filter(canShow).map((item) => (
                  <NavLink_
                    key={item.href}
                    item={item}
                    onClick={() => setIsMenuOpen(false)}
                  />
                ))}
              </div>
            )}

            {/* Admin Navigation */}
            {adminNav.filter(canShow).length > 0 && (
              <div className="px-3 py-2">
                <p className="text-xs text-muted-foreground font-medium px-3 mb-1">
                  Admin
                </p>
                {adminNav.filter(canShow).map((item) => (
                  <NavLink_
                    key={item.href}
                    item={item}
                    onClick={() => setIsMenuOpen(false)}
                  />
                ))}
              </div>
            )}

            {/* Logout button */}
            <div className="px-3 py-2 border-t mt-4">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
