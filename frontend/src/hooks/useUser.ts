/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi, deviceApi } from "@/lib/api";
import { toast } from "sonner";

export const userKeys = {
  all: ["users"] as const,
  list: (f: object) => [...userKeys.all, "list", f] as const,
  detail: (id: number) => [...userKeys.all, "detail", id] as const,
};

export function useUsers(params?: object) {
  return useQuery({
    queryKey: userKeys.list(params ?? {}),
    queryFn: () => userApi.getAll(params),
    placeholderData: (prev) => prev,
  });
}

export function useToggleActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userApi.toggleActive,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Status akun berhasil diperbarui");
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) =>
      userApi.resetPassword(id, data),
    onSuccess: () => toast.success("Password berhasil direset"),
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Gagal reset password"),
  });
}

export function useUnlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userApi.unlock,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Akun berhasil dibuka kuncinya");
    },
  });
}

export function useChangeRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      userApi.changeRole(id, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("Role berhasil diubah. User harus login ulang.");
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Gagal mengubah role"),
  });
}

// ── Devices ──────────────────────────────────────────────
export const deviceKeys = {
  all: ["devices"] as const,
  list: (f: object) => [...deviceKeys.all, "list", f] as const,
};

export function useDevices(params?: object) {
  return useQuery({
    queryKey: deviceKeys.list(params ?? {}),
    queryFn: () => deviceApi.getAll(params),
    placeholderData: (prev) => prev,
  });
}

export function useBlockDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deviceApi.block,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: deviceKeys.all });
      toast.success("Perangkat berhasil diblokir");
    },
  });
}

export function useResetDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deviceApi.reset,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: deviceKeys.all });
      toast.success("Perangkat berhasil direset");
    },
  });
}
