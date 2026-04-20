/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  attendanceApi,
  attendanceRuleApi,
  attendanceReportApi,
} from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const attendanceKeys = {
  all: ["attendance"] as const,
  today: () => [...attendanceKeys.all, "today"] as const,
  history: (filters: object) =>
    [...attendanceKeys.all, "history", filters] as const,
  report: (filters: object) =>
    [...attendanceKeys.all, "report", filters] as const,
  summary: (period: string) =>
    [...attendanceKeys.all, "summary", period] as const,
  rules: () => [...attendanceKeys.all, "rules"] as const,
};

export function useTodayAttendance() {
  return useQuery({
    queryKey: attendanceKeys.today(),
    queryFn: attendanceApi.getToday,
    refetchInterval: 1000 * 60, // auto-refetch tiap menit
  });
}

export function useAttendanceHistory(filters: {
  start_date: string;
  end_date: string;
  page?: number;
}) {
  return useQuery({
    queryKey: attendanceKeys.history(filters),
    queryFn: () => attendanceApi.getHistory(filters),
    placeholderData: (prev) => prev, // smooth pagination
  });
}

export function useAttendanceReport(filters: {
  start_date: string;
  end_date: string;
}) {
  return useQuery({
    queryKey: attendanceKeys.report(filters),
    queryFn: () => attendanceReportApi.getMyReport(filters),
  });
}

export function useQrScanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attendanceApi.processQrScan,
    onSuccess: () => {
      // Invalidate today's attendance agar tampilan ter-update
      queryClient.invalidateQueries({ queryKey: attendanceKeys.today() });
    },
  });
}

// ── Attendance Rules ────────────────────────────────────

export function useAttendanceRules() {
  return useQuery({
    queryKey: attendanceKeys.rules(),
    queryFn: attendanceRuleApi.getAll,
  });
}

export function useAttendanceRuleById(id: number) {
  return useQuery({
    queryKey: [...attendanceKeys.rules(), id],
    queryFn: () => attendanceRuleApi.getById(id),
  });
}

export function useDefaultAttendanceRule() {
  return useQuery({
    queryKey: [...attendanceKeys.rules(), "default"],
    queryFn: attendanceRuleApi.getDefault,
  });
}

export function useCreateAttendanceRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attendanceRuleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.rules() });
    },
  });
}

export function useUpdateAttendanceRule(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => attendanceRuleApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.rules() });
      queryClient.invalidateQueries({
        queryKey: [...attendanceKeys.rules(), id],
      });
    },
  });
}

export function useDeleteAttendanceRule(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => attendanceRuleApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.rules() });
    },
  });
}
