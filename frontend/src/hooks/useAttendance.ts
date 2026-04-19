import { attendanceApi } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const attendanceKeys = {
  all: ["attendance"] as const,
  today: () => [...attendanceKeys.all, "today"] as const,
  history: (filters: object) =>
    [...attendanceKeys.all, "history", filters] as const,
  summary: (period: string) =>
    [...attendanceKeys.all, "summary", period] as const,
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
