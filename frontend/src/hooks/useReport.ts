import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportApi } from "@/lib/api";
import { toast } from "sonner";

export function useAttendanceReport(params: object, enabled = true) {
  return useQuery({
    queryKey: ["reports", "attendance", params],
    queryFn: () => reportApi.getAttendance(params),
    enabled,
  });
}

export function useExportReport() {
  const [isDownloading, setIsDownloading] = useState(false);

  const download = async (params: object) => {
    setIsDownloading(true);
    try {
      const response = await reportApi.export(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "laporan_absensi.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Laporan berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh laporan");
    } finally {
      setIsDownloading(false);
    }
  };

  return { download, isDownloading };
}
