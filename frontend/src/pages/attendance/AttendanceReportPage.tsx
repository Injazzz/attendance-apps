/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useAttendanceReport } from "@/hooks/useAttendance";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
} from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  present: "default",
  late: "secondary",
  absent: "destructive",
  leave: "outline",
  sick: "outline",
  half_day: "secondary",
  business_trip: "outline",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  present: <CheckCircle2 className="w-4 h-4 text-green-600" />,
  late: <AlertCircle className="w-4 h-4 text-amber-600" />,
  absent: <AlertCircle className="w-4 h-4 text-red-600" />,
  leave: <Clock className="w-4 h-4 text-blue-600" />,
  sick: <Clock className="w-4 h-4 text-purple-600" />,
  half_day: <Clock className="w-4 h-4 text-orange-600" />,
  business_trip: <Clock className="w-4 h-4 text-cyan-600" />,
};

export default function AttendanceReportPage() {
  const [month, setMonth] = useState(new Date());
  const [isExporting, setIsExporting] = useState(false);

  const startDate = format(startOfMonth(month), "yyyy-MM-dd");
  const endDate = format(endOfMonth(month), "yyyy-MM-dd");

  const { data, isLoading } = useAttendanceReport({
    start_date: startDate,
    end_date: endDate,
  });

  const report = data?.data;
  const stats = report?.statistics ?? {};
  const records = report?.records ?? [];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { token, browserToken } = useAuthStore.getState();
      const response = await fetch(
        `/api/v1/attendance-report/my-report/export?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token || ""}`,
            "X-Browser-Token": browserToken || "",
          },
        },
      );

      if (!response.ok) {
        // Try to get error message from response
        console.log("Response not OK - status:", response.status);
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        console.log("Error data:", errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const blob = await response.blob();

      // Check if response is actually a PDF
      if (!blob.type.includes("pdf")) {
        const text = await blob.text();
        throw new Error(text || "Invalid response type");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Laporan-Absensi-${format(month, "MMMM-yyyy", {
        locale: localeId,
      })}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Laporan berhasil diunduh");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal mengunduh laporan: " + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Laporan Absensi</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Catatan lengkap kehadiran Anda
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={isExporting || !records.length}
          variant="outline"
          size="sm"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? "Mengunduh..." : "Unduh PDF"}
        </Button>
      </div>

      {/* Employee Info Card */}
      {isLoading && <Skeleton className="h-24 rounded-lg" />}

      {/* Month Navigation & Export */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 justify-center flex-1 min-w-fit">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMonth((m) => subMonths(m, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-48 text-center">
            {format(month, "MMMM yyyy", { locale: localeId })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            disabled={month >= new Date()}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground font-medium">
                TOTAL HARI KERJA
              </p>
              <p className="text-2xl font-bold mt-2">{stats.total_records}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground font-medium">
                KEHADIRAN
              </p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {stats.present}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.attendance_rate}% rata-rata
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground font-medium">
                TERLAMBAT
              </p>
              <p className="text-2xl font-bold text-amber-600 mt-2">
                {stats.late}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Total: {stats.total_late_minutes} menit
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground font-medium">
                TOTAL JAM KERJA
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {stats.regular_hours}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Lembur: {stats.overtime_hours}j
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Absensi</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>Tidak ada data absensi untuk periode ini</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted border-b">
                    <tr>
                      <th className="text-left px-4 py-2 font-semibold">
                        Tanggal
                      </th>
                      <th className="text-left px-4 py-2 font-semibold">
                        Status
                      </th>
                      <th className="text-left px-4 py-2 font-semibold">
                        Jam Masuk
                      </th>
                      <th className="text-left px-4 py-2 font-semibold">
                        Jam Pulang
                      </th>
                      <th className="text-right px-4 py-2 font-semibold">
                        Total Jam
                      </th>
                      <th className="text-right px-4 py-2 font-semibold">
                        Lembur
                      </th>
                      <th className="text-right px-4 py-2 font-semibold">
                        Terlambat
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record: any) => (
                      <tr
                        key={record.id}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">
                              {record.date_formatted}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {record.day_name}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              (STATUS_COLORS[record.status] as any) || "outline"
                            }
                          >
                            {record.status_label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {record.check_in_time || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {record.check_out_time || "-"}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {record.total_hours || "-"}j
                        </td>
                        <td className="px-4 py-3 text-right">
                          {record.overtime_hours > 0
                            ? `${record.overtime_hours}j`
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {record.late_minutes > 0
                            ? `${record.late_minutes}m`
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-2">
                {records.map((record: any) => (
                  <Card key={record.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-sm">
                              {record.date_formatted}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {record.day_name}
                            </p>
                          </div>
                          <Badge
                            variant={
                              (STATUS_COLORS[record.status] as any) || "outline"
                            }
                            className="flex items-center gap-1"
                          >
                            {STATUS_ICONS[record.status]}
                            {record.status_label}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">Masuk</p>
                            <p className="font-medium">
                              {record.check_in_time || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Pulang</p>
                            <p className="font-medium">
                              {record.check_out_time || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Jam</p>
                            <p className="font-medium">
                              {record.total_hours || "-"}j
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Lembur</p>
                            <p className="font-medium">
                              {record.overtime_hours > 0
                                ? `${record.overtime_hours}j`
                                : "-"}
                            </p>
                          </div>
                        </div>

                        {record.late_minutes > 0 && (
                          <div className="bg-amber-50 border border-amber-200 rounded px-3 py-2 text-xs text-amber-700">
                            ⏱ Terlambat {record.late_minutes} menit
                          </div>
                        )}

                        {record.notes && (
                          <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-xs text-blue-700">
                            📝 {record.notes}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Section */}
      {!isLoading && report && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Ringkasan Periode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Periode:</span>
                <span>
                  {report.period.start_date_formatted} -{" "}
                  {report.period.end_date_formatted}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-muted-foreground">Hadir</p>
                  <p className="font-bold text-lg text-green-600 mt-1">
                    {stats.present}
                  </p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-muted-foreground">Terlambat</p>
                  <p className="font-bold text-lg text-amber-600 mt-1">
                    {stats.late}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-muted-foreground">Tidak Hadir</p>
                  <p className="font-bold text-lg text-red-600 mt-1">
                    {stats.absent}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-muted-foreground">Cuti</p>
                  <p className="font-bold text-lg text-blue-600 mt-1">
                    {stats.leave}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
