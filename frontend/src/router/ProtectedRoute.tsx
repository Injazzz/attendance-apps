import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

interface Props {
  children?: React.ReactNode;
  permission?: string;
  role?: string;
}

export function ProtectedRoute({ children, permission, role }: Props) {
  const { isAuthenticated, hasPermission, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Cek permission
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Cek role spesifik
  if (role && user?.role !== role && user?.role !== "super_admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
