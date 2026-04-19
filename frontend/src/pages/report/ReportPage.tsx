/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useAttendanceReport, useExportReport } from "@/hooks/useReport";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Search, Loader2 } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";

type Interval = "daily" | "weekly" | "monthly" | "yearly";

function getDateRange(interval: Interval) {
  const now = new Date();
  switch (interval) {
    case "daily":
      return {
        interval: "daily",
        start_date: format(now, "yyyy-MM-dd"),
        end_date: format(now, "yyyy-MM-dd"),
      };
    case "weekly":
      return {
        interval: "weekly",
        start_date: format(startOfWeek(now), "yyyy-MM-dd"),
        end_date: format(endOfWeek(now), "yyyy-MM-dd"),
      };
    case "monthly":
      return {
        interval: "monthly",
        start_date: format(startOfMonth(now), "yyyy-MM-dd"),
        end_date: format(endOfMonth(now), "yyyy-MM-dd"),
      };
    case "yearly":
      return {
        interval: "yearly",
        start_date: `${now.getFullYear()}-01-01`,
        end_date: `${now.getFullYear()}-12-31`,
      };
  }
}

const STATUS_BADGE: Record<string, any> = {
  present: "default",
  late: "secondary",
  absent: "destructive",
  leave: "outline",
  sick: "outline",
};

export default function ReportPage() {
  const [interval, setInterval] = useState<Interval>("monthly");
  const [filters, setFilters] = useState(() => getDateRange("monthly"));
  const [applied, setApplied] = useState(filters);
  const { download, isDownloading } = useExportReport();

  const { data, isLoading } = useAttendanceReport(applied, true);
  const records = data?.data ?? [];
  const meta = data?.meta;

  const applyFilter = () => {
    setApplied({ ...filters });
  };

  const handleIntervalChange = (v: Interval) => {
    setInterval(v);
    const range = getDateRange(v);
    setFilters(range);
    setApplied(range);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Laporan Absensi</h1>
        <Button
          onClick={() => download(applied)}
          disabled={isDownloading}
          variant="outline"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Mengunduh...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </>
          )}
        </Button>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Interval</Label>
              <Select
                value={interval}
                onValueChange={(v) => handleIntervalChange(v as Interval)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Harian</SelectItem>
                  <SelectItem value="weekly">Mingguan</SelectItem>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                  <SelectItem value="yearly">Tahunan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Dari Tanggal</Label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    start_date: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Sampai Tanggal</Label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    end_date: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={applyFilter}>
                <Search className="w-4 h-4 mr-2" /> Tampilkan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ringkasan */}
      {meta && (
        <p className="text-sm text-muted-foreground">
          Menampilkan {records.length} dari {meta.total} data
        </p>
      )}

      {/* Tabel */}
      <div className="rounded-xl border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Karyawan</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="hidden sm:table-cell">Masuk</TableHead>
              <TableHead className="hidden sm:table-cell">Pulang</TableHead>
              <TableHead className="hidden md:table-cell">Jam Kerja</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground text-sm"
                >
                  Tidak ada data untuk periode ini
                </TableCell>
              </TableRow>
            ) : (
              records.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <p className="text-sm font-medium">{r.employee?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.employee?.code}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm">{r.date}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">
                    {r.check_in_time ?? "-"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">
                    {r.check_out_time ?? "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {r.total_hours}j
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE[r.status] ?? "outline"}>
                      {r.status_label}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
