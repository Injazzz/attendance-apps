import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { overtimeApi } from "@/lib/api";
import { toast } from "sonner";

export function useOvertime(params = {}) {
  return useQuery({
    queryKey: ["overtime", params],
    queryFn: () => overtimeApi.getAll(params),
  });
}

export function useSubmitOvertime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: overtimeApi.submit,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["overtime"] });
      toast.success("Pengajuan lembur berhasil dikirim");
    },
  });
}

export function useApproveOvertime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) => overtimeApi.approve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["overtime"] });
      toast.success("Lembur disetujui");
    },
  });
}
