import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import {
  LayoutDashboard,
  Clock,
  Users,
  FileText,
  QrCode,
  Settings,
  LogOut,
  Timer,
  MapPin,
  Building2,
  Briefcase,
  Shield,
  Smartphone,
  ChevronRight,
  Bell,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { authApi } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
  role?: string;
}

const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Lembur", href: "/overtime", icon: Timer },
  { label: "Notifikasi", href: "/notifications", icon: Bell },
];

// Submenu untuk Absensi
const attendanceNav: NavItem[] = [
  { label: "Checkin/Checkout", href: "/attendance", icon: Clock },
  { label: "Riwayat Absensi", href: "/attendance/history", icon: FileText },
  { label: "Laporan Absensi", href: "/attendance/report", icon: FileText },
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

export function Sidebar() {
  const { user, hasPermission, clearAuth } = useAuthStore();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      qc.clear();
      clearAuth();
      navigate("/login");
    }
  };

  const canShow = (item: NavItem) => {
    if (item.role)
      return user?.role === item.role || user?.role === "super_admin";
    if (item.permission) return hasPermission(item.permission);
    return true;
  };

  const NavGroup = ({ label, items }: { label: string; items: NavItem[] }) => {
    const visible = items.filter(canShow);
    if (visible.length === 0) return null;
    return (
      <div className="px-3 py-2">
        <p className="text-xs text-muted-foreground font-medium px-3 mb-1">
          {label}
        </p>
        {visible.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5",
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </div>
    );
  };

  // Collapsible menu untuk Absensi
  const AttendanceMenu = () => {
    const isExpanded = expandedMenu === "attendance";
    return (
      <div className="px-3 py-2">
        <p className="text-xs text-muted-foreground font-medium px-3 mb-1">
          MENU UTAMA
        </p>

        {/* Attendance dengan submenu */}
        <div className="mb-0.5">
          <button
            onClick={() => setExpandedMenu(isExpanded ? null : "attendance")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">Absensi</span>
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                isExpanded ? "rotate-180" : "",
              )}
            />
          </button>

          {isExpanded && (
            <div className="ml-3 mt-1 space-y-1 border-l border-border pl-3">
              {attendanceNav.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )
                  }
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Main nav items lainnya */}
        {mainNav.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5",
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-card border-r">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Clock className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm">AttendanceApp</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <AttendanceMenu />
        <Separator className="my-2" />
        <NavGroup label="Manajemen" items={managementNav} />
        <Separator className="my-2" />
        <NavGroup label="Master Data" items={masterNav} />
        <Separator className="my-2" />
        <NavGroup label="Administrasi" items={adminNav} />
      </nav>

      {/* User */}
      <div className="border-t px-3 py-4">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent mb-1"
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.employee?.photo_url ?? undefined} />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {user?.employee?.full_name?.slice(0, 2).toUpperCase() ??
                user?.name?.slice(0, 2).toUpperCase() ??
                "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.employee?.full_name ?? user?.name}
            </p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </NavLink>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" /> Keluar
        </Button>
      </div>
    </div>
  );
}
