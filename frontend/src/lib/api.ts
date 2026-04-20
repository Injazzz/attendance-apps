import axios, { type AxiosInstance, AxiosError } from "axios";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

// Build API base URL
// VITE_API_URL can be: "/api" (proxy) or "http://localhost:8000/api" (direct)
const apiUrl = import.meta.env.VITE_API_URL;
const baseURL = apiUrl.endsWith("/api")
  ? apiUrl + "/v1" // Already has /api, just add /v1
  : apiUrl + "/api/v1"; // Full localhost URL, add /api/v1

const api: AxiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  // Allow credentials (cookies, authorization) to be sent with cross-origin requests
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.interceptors.request.use(
  (config) => {
    const { token, browserToken, deviceFingerprint } = useAuthStore.getState();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (browserToken) config.headers["X-Browser-Token"] = browserToken;
    if (deviceFingerprint)
      config.headers["X-Device-Fingerprint"] = deviceFingerprint;

    // Don't set Content-Type for FormData - let browser handle it
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (
    error: AxiosError<{ message: string; errors?: Record<string, string[]> }>,
  ) => {
    const { response } = error;
    if (!response) {
      toast.error("Tidak ada koneksi internet.");
      return Promise.reject(error);
    }
    switch (response.status) {
      case 401:
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
        break;
      case 403:
        toast.error("Akses ditolak.");
        break;
      case 429:
        toast.error("Terlalu banyak permintaan. Coba lagi.");
        break;
      case 500:
        toast.error("Terjadi kesalahan server.");
        break;
    }
    return Promise.reject(error);
  },
);

// ── Auth ────────────────────────────────────────────────
export const authApi = {
  login: (data: object) => api.post("/auth/login", data).then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
};

// ── Profile ─────────────────────────────────────────────
export const profileApi = {
  show: () => api.get("/profile").then((r) => r.data),
  update: (data: FormData) => api.post("/profile", data).then((r) => r.data),
};

// ── Attendance ──────────────────────────────────────────
export const attendanceApi = {
  getToday: () => api.get("/attendance/today").then((r) => r.data),
  getHistory: (params: object) =>
    api.get("/attendance/history", { params }).then((r) => r.data),

  // Unified QR scan - all employees use QR with employee_id and type
  processUnifiedQrScan: (data: object) =>
    api.post("/attendance/unified-qr-scan", data).then((r) => r.data),

  // DEPRECATED: Old QR scan endpoint (backward compatibility)
  processQrScan: (data: object) =>
    api.post("/attendance/qr-scan", data).then((r) => r.data),

  manualEdit: (id: number, data: object) =>
    api.patch(`/attendance/${id}/manual`, data).then((r) => r.data),
};

// ── Attendance Report ───────────────────────────────────
export const attendanceReportApi = {
  getMyReport: (params: object) =>
    api.get("/attendance-report/my-report", { params }).then((r) => r.data),
  exportMyReport: (params: object) =>
    api.get("/attendance-report/my-report/export", {
      params,
      responseType: "blob" as const,
    }),
};

// ── Attendance Rules ────────────────────────────────────
export const attendanceRuleApi = {
  getAll: () => api.get("/attendance-rules").then((r) => r.data),
  getById: (id: number) =>
    api.get(`/attendance-rules/${id}`).then((r) => r.data),
  getDefault: () => api.get("/attendance-rules/default").then((r) => r.data),
  create: (data: object) =>
    api.post("/attendance-rules", data).then((r) => r.data),
  update: (id: number, data: object) =>
    api.patch(`/attendance-rules/${id}`, data).then((r) => r.data),
  remove: (id: number) =>
    api.delete(`/attendance-rules/${id}`).then((r) => r.data),
};

// ── Overtime ────────────────────────────────────────────
export const overtimeApi = {
  getAll: (params?: object) =>
    api.get("/overtime", { params }).then((r) => r.data),
  getById: (id: number) => api.get(`/overtime/${id}`).then((r) => r.data),
  submit: (data: object) => api.post("/overtime", data).then((r) => r.data),
  approve: (id: number, notes?: string) =>
    api.patch(`/overtime/${id}/approve`, { notes }).then((r) => r.data),
  reject: (id: number, reason: string) =>
    api.patch(`/overtime/${id}/reject`, { reason }).then((r) => r.data),
};

// ── Employees ───────────────────────────────────────────
export const employeeApi = {
  getAll: (params?: object) =>
    api.get("/employees", { params }).then((r) => r.data),
  getById: (id: number) => api.get(`/employees/${id}`).then((r) => r.data),
  create: (data: FormData) => api.post("/employees", data).then((r) => r.data),
  update: (id: number, data: FormData) =>
    api.patch(`/employees/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/employees/${id}`).then((r) => r.data),
  // Generate unified QR code for employee attendance (with employee_id + type embedded)
  generateQr: (id: number) =>
    api.get(`/employees/${id}/qr`).then((r) => r.data),
};

// ── QR ──────────────────────────────────────────────────
export const qrApi = {
  getDisplays: (params?: object) =>
    api.get("/qr-displays", { params }).then((r) => r.data),
  getDisplay: (id: number) => api.get(`/qr-displays/${id}`).then((r) => r.data),
  createDisplay: (data: object) =>
    api.post("/qr-displays", data).then((r) => r.data),
  updateDisplay: (id: number, data: object) =>
    api.patch(`/qr-displays/${id}`, data).then((r) => r.data),
  deleteDisplay: (id: number) =>
    api.delete(`/qr-displays/${id}`).then((r) => r.data),
  getCurrentSession: (id: number) =>
    api.get(`/qr-sessions/${id}/current`).then((r) => r.data),
  generateSession: (id: number) =>
    api.post(`/qr-sessions/${id}/generate`).then((r) => r.data),
};

// ── Reports ─────────────────────────────────────────────
export const reportApi = {
  getDashboardStats: (params?: object) =>
    api.get("/reports/dashboard-stats", { params }).then((r) => r.data),
  getAttendance: (params: object) =>
    api.get("/reports/attendance", { params }).then((r) => r.data),
  getSummary: (params: object) =>
    api.get("/reports/summary", { params }).then((r) => r.data),
  export: (params: object) =>
    api.get("/reports/attendance/export", { params, responseType: "blob" }),
};

// ── Master Data ─────────────────────────────────────────
export const companyApi = {
  getAll: () => api.get("/companies").then((r) => r.data),
  getById: (id: number) => api.get(`/companies/${id}`).then((r) => r.data),
  create: (data: FormData) =>
    api
      .post("/companies", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),
  update: (id: number, data: FormData) =>
    api
      .patch(`/companies/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),
};

export const siteApi = {
  getAll: (params?: object) =>
    api.get("/sites", { params }).then((r) => r.data),
  getById: (id: number) => api.get(`/sites/${id}`).then((r) => r.data),
  create: (data: object) => api.post("/sites", data).then((r) => r.data),
  update: (id: number, data: object) =>
    api.patch(`/sites/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/sites/${id}`).then((r) => r.data),
};

export const departmentApi = {
  getAll: (params?: object) =>
    api.get("/departments", { params }).then((r) => r.data),
  getById: (id: number) => api.get(`/departments/${id}`).then((r) => r.data),
  create: (data: object) => api.post("/departments", data).then((r) => r.data),
  update: (id: number, data: object) =>
    api.patch(`/departments/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/departments/${id}`).then((r) => r.data),
};

export const jobFamilyApi = {
  getAll: (params?: object) =>
    api.get("/job-families", { params }).then((r) => r.data),
  getById: (id: number) => api.get(`/job-families/${id}`).then((r) => r.data),
  create: (data: object) => api.post("/job-families", data).then((r) => r.data),
  update: (id: number, data: object) =>
    api.patch(`/job-families/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/job-families/${id}`).then((r) => r.data),
};

export const positionApi = {
  getAll: (params?: object) =>
    api.get("/positions", { params }).then((r) => r.data),
  getById: (id: number) => api.get(`/positions/${id}`).then((r) => r.data),
  create: (data: object) => api.post("/positions", data).then((r) => r.data),
  update: (id: number, data: object) =>
    api.patch(`/positions/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/positions/${id}`).then((r) => r.data),
};

// ── Users ───────────────────────────────────────────────
export const userApi = {
  getAll: (params?: object) =>
    api.get("/users", { params }).then((r) => r.data),
  getById: (id: number) => api.get(`/users/${id}`).then((r) => r.data),
  toggleActive: (id: number) =>
    api.patch(`/users/${id}/toggle-active`).then((r) => r.data),
  resetPassword: (id: number, data: object) =>
    api.patch(`/users/${id}/reset-password`, data).then((r) => r.data),
  unlock: (id: number) => api.patch(`/users/${id}/unlock`).then((r) => r.data),
  changeRole: (id: number, role: string) =>
    api.patch(`/users/${id}/change-role`, { role }).then((r) => r.data),
};

// ── Devices ─────────────────────────────────────────────
export const deviceApi = {
  getAll: (params?: object) =>
    api.get("/devices", { params }).then((r) => r.data),
  block: (id: number) => api.patch(`/devices/${id}/block`).then((r) => r.data),
  reset: (id: number) => api.delete(`/devices/${id}/reset`).then((r) => r.data),
};

// ── Settings ────────────────────────────────────────────
export const settingApi = {
  getAll: () => api.get("/settings").then((r) => r.data),
  update: (data: { settings: Array<{ key: string; value: string }> }) =>
    api.post("/settings", data).then((r) => r.data),
};

// ── Notifications ────────────────────────────────────────
export const notificationApi = {
  getAll: (params?: object) =>
    api.get("/notifications", { params }).then((r) => r.data),
  markRead: (id: number) =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.patch("/notifications/read-all").then((r) => r.data),
  remove: (id: number) =>
    api.delete(`/notifications/${id}`).then((r) => r.data),
};

export default api;
