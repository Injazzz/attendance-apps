"use client";

import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Clock,
  Timer,
  Users,
  Menu,
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
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

export function MobileNav() {
  const { user, hasPermission, clearAuth } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

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
      {/* Bottom navigation for quick access */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-40">
        <div className="flex items-center justify-around h-16">
          {mainNav.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          ))}
          {/* More menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-2 h-auto"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px]">Lainnya</span>
          </Button>
        </div>
      </nav>

      {/* Drawer menu for all navigation items */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
                  onClick={() => setIsOpen(false)}
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
                    onClick={() => setIsOpen(false)}
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
                    onClick={() => setIsOpen(false)}
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
                    onClick={() => setIsOpen(false)}
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
