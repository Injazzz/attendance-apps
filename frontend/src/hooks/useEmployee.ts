import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeApi } from "@/lib/api";

export const employeeKeys = {
  all: ["employees"] as const,
  list: (f: object) => [...employeeKeys.all, "list", f] as const,
  detail: (id: number) => [...employeeKeys.all, "detail", id] as const,
};

export function useEmployees(filters = {}) {
  return useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: () => employeeApi.getAll(filters),
    placeholderData: (prev) => prev,
  });
}

export function useEmployee(id: number) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeeApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: employeeApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      employeeApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: employeeApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}
