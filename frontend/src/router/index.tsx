/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

const w = (C: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<LoadingScreen />}>
    <C />
  </Suspense>
);

// Auth
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));

// Main
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const ProfilePage = lazy(() => import("@/pages/profile/ProfilePage"));

// Attendance
const AttendancePage = lazy(() => import("@/pages/attendance/AttendancePage"));
const AttendanceHistoryPage = lazy(
  () => import("@/pages/attendance/AttendanceHistoryPage"),
);

// Overtime
const OvertimePage = lazy(() => import("@/pages/overtime/OvertimePage"));

// Employees
const EmployeeListPage = lazy(
  () => import("@/pages/employee/EmployeeListPage"),
);
const EmployeeFormPage = lazy(
  () => import("@/pages/employee/EmployeeFormPage"),
);
const EmployeeEditPage = lazy(
  () => import("@/pages/employee/EmployeeEditPage"),
);

// QR
const QrDisplayPage = lazy(() => import("@/pages/qr/QrDisplayPage"));
const QrManagePage = lazy(() => import("@/pages/qr/QrManagePage"));
const EmployeeQrPage = lazy(() => import("@/pages/qr/EmployeeQrPage"));

// Reports
const ReportPage = lazy(() => import("@/pages/report/ReportPage"));

// Master Data
const SitePage = lazy(() => import("@/pages/master/SitePage"));
const DepartmentPage = lazy(() => import("@/pages/master/DepartmentPage"));
const PositionPage = lazy(() => import("@/pages/master/PositionPage"));

// Users & Devices
const UserManagementPage = lazy(
  () => import("@/pages/user/UserManagementPage"),
);
const DeviceManagementPage = lazy(
  () => import("@/pages/device/DeviceManagementPage"),
);

// Settings
const SettingsPage = lazy(() => import("@/pages/setting/SettingPage"));

// 404
const NotFoundPage = lazy(() => import("@/pages/common/NotFoundPage"));

export const router = createBrowserRouter([
  // Auth
  {
    element: <AuthLayout />,
    children: [{ path: "/login", element: w(LoginPage) }],
  },

  // Protected
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      { path: "/dashboard", element: w(DashboardPage) },
      { path: "/profile", element: w(ProfilePage) },

      // Attendance — semua user
      { path: "/attendance", element: w(AttendancePage) },
      { path: "/attendance/history", element: w(AttendanceHistoryPage) },

      // Overtime — semua user, filter di controller
      { path: "/overtime", element: w(OvertimePage) },

      // Employees
      {
        element: <ProtectedRoute permission="employees.view" />,
        children: [
          { path: "/employees", element: w(EmployeeListPage) },
          { path: "/employees/:id/edit", element: w(EmployeeEditPage) },
        ],
      },
      {
        element: <ProtectedRoute permission="employees.create" />,
        children: [{ path: "/employees/create", element: w(EmployeeFormPage) }],
      },

      // QR — Display (Kiosk) dan Employee (Attendance)
      {
        element: <ProtectedRoute permission="qr.view" />,
        children: [
          // QR Display untuk kiosk/display
          { path: "/qr-displays", element: w(QrDisplayPage) },
          { path: "/qr-displays/:id/manage", element: w(QrManagePage) },

          // QR Employee untuk attendance scanning
          { path: "/employees/:id/qr", element: w(EmployeeQrPage) },
        ],
      },

      // Reports
      {
        element: <ProtectedRoute permission="reports.daily" />,
        children: [{ path: "/reports", element: w(ReportPage) }],
      },

      // Master Data
      {
        element: <ProtectedRoute permission="sites.view" />,
        children: [{ path: "/master/sites", element: w(SitePage) }],
      },
      {
        element: <ProtectedRoute permission="departments.manage" />,
        children: [
          { path: "/master/departments", element: w(DepartmentPage) },
          { path: "/master/positions", element: w(PositionPage) },
        ],
      },

      // Users & Devices — admin only
      {
        element: <ProtectedRoute permission="users.manage" />,
        children: [{ path: "/users", element: w(UserManagementPage) }],
      },
      {
        element: <ProtectedRoute role="super_admin" />,
        children: [{ path: "/devices", element: w(DeviceManagementPage) }],
      },

      // Settings
      {
        element: <ProtectedRoute permission="settings.view" />,
        children: [{ path: "/settings", element: w(SettingsPage) }],
      },
    ],
  },

  { path: "*", element: w(NotFoundPage) },
]);
