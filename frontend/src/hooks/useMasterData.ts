/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companyApi, siteApi, departmentApi, positionApi } from "@/lib/api";
import { toast } from "sonner";

// ── Companies ────────────────────────────────────────────
export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: companyApi.getAll,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: companyApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Perusahaan berhasil ditambahkan");
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Gagal menambahkan perusahaan"),
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      companyApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Perusahaan berhasil diperbarui");
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Gagal memperbarui"),
  });
}

// ── Sites ────────────────────────────────────────────────
export function useSites(params?: object) {
  return useQuery({
    queryKey: ["sites", params],
    queryFn: () => siteApi.getAll(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateSite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: siteApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sites"] });
      toast.success("Site berhasil ditambahkan");
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Gagal menambahkan site"),
  });
}

export function useUpdateSite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) =>
      siteApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sites"] });
      toast.success("Site berhasil diperbarui");
    },
  });
}

export function useDeleteSite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: siteApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sites"] });
      toast.success("Site berhasil dinonaktifkan");
    },
  });
}

// ── Departments ──────────────────────────────────────────
export function useDepartments(params?: object) {
  return useQuery({
    queryKey: ["departments", params],
    queryFn: () => departmentApi.getAll(params),
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: departmentApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Departemen berhasil ditambahkan");
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Gagal menambahkan departemen"),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) =>
      departmentApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Departemen berhasil diperbarui");
    },
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: departmentApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Departemen berhasil dihapus");
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Gagal menghapus departemen"),
  });
}

// ── Positions ────────────────────────────────────────────
export function usePositions(params?: object) {
  return useQuery({
    queryKey: ["positions", params],
    queryFn: () => positionApi.getAll(params),
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreatePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: positionApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Jabatan berhasil ditambahkan");
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Gagal menambahkan jabatan"),
  });
}

export function useUpdatePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) =>
      positionApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Jabatan berhasil diperbarui");
    },
  });
}

export function useDeletePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: positionApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Jabatan berhasil dihapus");
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Gagal menghapus jabatan"),
  });
}
