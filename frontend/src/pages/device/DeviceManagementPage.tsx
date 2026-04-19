/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useDevices, useBlockDevice, useResetDevice } from "@/hooks/useUser";
import { useDebounce } from "@/hooks/useDebounce";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { Pagination } from "@/components/shared/Pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Smartphone, ShieldOff, RefreshCw } from "lucide-react";

export default function DeviceManagementPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [blockTarget, setBlockTarget] = useState<any>(null);
  const [resetTarget, setResetTarget] = useState<any>(null);

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useDevices({
    search: debouncedSearch || undefined,
    status: status || undefined,
    page,
    per_page: 15,
  });

  const blockMutation = useBlockDevice();
  const resetMutation = useResetDevice();

  const devices = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div>
      <PageHeader
        title="Manajemen Perangkat"
        subtitle="Kelola perangkat terdaftar dan keamanan akses"
      />

      <FilterBar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Cari nama karyawan..."
      >
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="blocked">Diblokir</SelectItem>
            <SelectItem value="inactive">Tidak Aktif</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : devices.length === 0 ? (
        <EmptyState
          icon={Smartphone}
          title="Tidak ada perangkat ditemukan"
          description="Perangkat akan terdaftar otomatis saat karyawan pertama kali login"
        />
      ) : (
        <div className="space-y-3">
          {devices.map((device: any) => (
            <Card key={device.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {device.user?.employee?.full_name ??
                          device.user?.name ??
                          "-"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {device.user?.employee?.employee_code ?? "-"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {device.device_info?.userAgent
                          ? device.device_info.userAgent.substring(0, 60) +
                            "..."
                          : "Info perangkat tidak tersedia"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Aktif terakhir: {device.last_active ?? "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge status={device.status} />
                    <div className="flex gap-2">
                      {device.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive text-xs"
                          onClick={() => setBlockTarget(device)}
                        >
                          <ShieldOff className="w-3 h-3 mr-1" /> Blokir
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setResetTarget(device)}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" /> Reset
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {meta && <Pagination meta={meta} onPageChange={setPage} />}

      <ConfirmDialog
        open={!!blockTarget}
        onOpenChange={(v) => !v && setBlockTarget(null)}
        title="Blokir Perangkat?"
        description="Pengguna tidak akan bisa login dari perangkat ini. Semua sesi aktif akan dihapus."
        confirmLabel="Ya, Blokir"
        variant="destructive"
        onConfirm={() => {
          blockMutation.mutate(blockTarget.id, {
            onSuccess: () => setBlockTarget(null),
          });
        }}
      />

      <ConfirmDialog
        open={!!resetTarget}
        onOpenChange={(v) => !v && setResetTarget(null)}
        title="Reset Perangkat?"
        description="Perangkat akan dihapus dari daftar. Pengguna bisa login dari perangkat baru mana pun."
        confirmLabel="Ya, Reset"
        onConfirm={() => {
          resetMutation.mutate(resetTarget.id, {
            onSuccess: () => setResetTarget(null),
          });
        }}
      />
    </div>
  );
}
