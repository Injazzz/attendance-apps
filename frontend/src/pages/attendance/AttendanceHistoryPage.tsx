/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useAttendanceHistory } from "@/hooks/useAttendance";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { id as localeId } from "date-fns/locale";

const STATUS_COLORS: Record<string, string> = {
  present: "default",
  late: "secondary",
  absent: "destructive",
  leave: "outline",
  sick: "outline",
  half_day: "secondary",
};

export default function AttendanceHistoryPage() {
  const [month, setMonth] = useState(new Date());

  const start = format(startOfMonth(month), "yyyy-MM-dd");
  const end = format(endOfMonth(month), "yyyy-MM-dd");

  const { data, isLoading } = useAttendanceHistory({
    start_date: start,
    end_date: end,
  });
  const records = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Riwayat Absensi</h1>
      </div>

      {/* Month navigation */}
      <div className="flex items-center gap-3 justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMonth((m) => subMonths(m, 1))}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium min-w-32 text-center">
          {format(month, "MMMM yyyy", { locale: localeId })}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMonth((m) => subMonths(m, -1))}
          disabled={month >= new Date()}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* List records */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))
        ) : records.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              Tidak ada data absensi
            </CardContent>
          </Card>
        ) : (
          records.map((r: any) => (
            <Card key={r.id}>
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{r.date_formatted}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Masuk: {r.check_in_time ?? "-"} | Pulang:{" "}
                    {r.check_out_time ?? "-"}
                  </p>
                  {r.late_minutes > 0 && (
                    <p className="text-xs text-amber-600 mt-0.5">
                      Telat {r.late_minutes} menit
                    </p>
                  )}
                </div>
                <Badge variant={(STATUS_COLORS[r.status] as any) ?? "outline"}>
                  {r.status_label}
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
