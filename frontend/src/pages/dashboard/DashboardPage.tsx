/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { attendanceApi, notificationApi } from "@/lib/api";
// import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default function DashboardPage() {
  //   const { user } = useAuthStore();

  const { data: todayData, isLoading } = useQuery({
    queryKey: ["attendance", "today"],
    queryFn: attendanceApi.getToday,
    refetchInterval: 60 * 1000, // refresh tiap menit
  });

  const { data: notifData } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.getAll({ is_read: false, per_page: 5 }),
  });

  const today = format(new Date(), "EEEE, dd MMMM yyyy", { locale: localeId });
  const attendance = todayData?.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">{today}</p>
      </div>

      {/* Status absensi hari ini */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Status Absensi Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          ) : attendance ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Check In</p>
                <p className="text-lg font-semibold text-green-600">
                  {attendance.check_in_time ?? "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Check Out</p>
                <p className="text-lg font-semibold text-blue-600">
                  {attendance.check_out_time ?? "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total Jam</p>
                <p className="text-lg font-semibold">
                  {attendance.total_hours ?? 0} jam
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge
                  variant={
                    attendance.status === "present" ? "default" : "destructive"
                  }
                >
                  {attendance.status_label}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Belum ada absensi hari ini</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifikasi terbaru */}
      {notifData?.data?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notifikasi Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifData.data.map((notif: any) => (
              <div
                key={notif.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{notif.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notif.created_at}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
