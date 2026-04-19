import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Employee {
  id: number;
  full_name: string;
  employee_code: string;
  site_id: number | null;
  photo_url: string | null;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  employee: Employee | null;
}

interface AuthState {
  token: string | null;
  browserToken: string | null;
  deviceFingerprint: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (
    token: string,
    browserToken: string,
    deviceFingerprint: string,
    user: User,
  ) => void;
  clearAuth: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      browserToken: null,
      deviceFingerprint: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, browserToken, deviceFingerprint, user) =>
        set({
          token,
          browserToken,
          deviceFingerprint,
          user,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          token: null,
          browserToken: null,
          user: null,
          isAuthenticated: false,
        }),

      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;
        if (user.role === "super_admin" || user.role === "admin") return true;
        return user.permissions.includes(permission);
      },
    }),
    { name: "auth-storage" },
  ),
);
