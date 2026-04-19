/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qrApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { QrCode, Plus, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery as useQ } from "@tanstack/react-query";
import api from "@/lib/api";

const schema = z.object({
  site_id: z.string().min(1, "Site wajib dipilih"),
  display_name: z.string().min(2, "Nama minimal 2 karakter"),
  location: z.string().optional(),
  department_id: z.string().optional(),
  qr_type: z.enum(["check_in", "check_out"]),
  refresh_mode: z.enum(["time_based", "scan_based"]),
  time_interval: z.number().min(10).optional(),
  max_scans: z.number().min(1).optional(),
});

type FormData = z.infer<typeof schema>;

export default function QrDisplayPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["qr-displays"],
    queryFn: qrApi.getDisplays,
  });

  const { data: sitesData } = useQ({
    queryKey: ["sites"],
    queryFn: () => api.get("/sites").then((r) => r.data),
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      qr_type: "check_in",
      refresh_mode: "time_based",
      time_interval: 30,
    },
  });

  const refreshMode = watch("refresh_mode");

  const createMutation = useMutation({
    mutationFn: (data: FormData) => qrApi.createDisplay(data),
    onSuccess: () => {
      toast.success("QR Display berhasil dibuat");
      qc.invalidateQueries({ queryKey: ["qr-displays"] });
      setOpen(false);
      reset();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? "Gagal membuat display"),
  });

  const displays = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">QR Display</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Display
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : displays.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <QrCode className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Belum ada QR Display</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {displays.map((d: any) => (
            <Card key={d.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{d.display_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.location ?? "-"}
                    </p>
                  </div>
                  <Badge
                    variant={d.status === "active" ? "default" : "secondary"}
                  >
                    {d.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>Site: {d.site?.site_name}</p>
                  <p>
                    Mode:{" "}
                    {d.refresh_mode === "time_based"
                      ? `${d.time_interval}s`
                      : `${d.max_scans}x scan`}
                  </p>
                  <p>
                    Tipe: {d.qr_type === "check_in" ? "Check In" : "Check Out"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => navigate(`/qr-displays/${d.id}/manage`)}
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" /> Lihat QR
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog tambah display */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogDescription>qr code display</DialogDescription>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah QR Display</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((d) => createMutation.mutate(d))}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>Site / Lokasi</Label>
              <Controller
                name="site_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih site" />
                    </SelectTrigger>
                    <SelectContent>
                      {sitesData?.data?.map((s: any) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.site_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.site_id && (
                <p className="text-xs text-destructive">
                  {errors.site_id.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Nama Display</Label>
              <Input
                placeholder="Contoh: Pintu Masuk Utama"
                {...register("display_name")}
              />
              {errors.display_name && (
                <p className="text-xs text-destructive">
                  {errors.display_name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Lokasi Fisik</Label>
              <Input placeholder="Lantai 1, Lobby" {...register("location")} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipe QR</Label>
                <Controller
                  name="qr_type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="check_in">Check In</SelectItem>
                        <SelectItem value="check_out">Check Out</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Mode Refresh</Label>
                <Controller
                  name="refresh_mode"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="time_based">Per Waktu</SelectItem>
                        <SelectItem value="scan_based">Per Scan</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {refreshMode === "time_based" && (
              <div className="space-y-1.5">
                <Label>Interval (detik)</Label>
                <Input
                  type="number"
                  min={10}
                  max={3600}
                  {...register("time_interval", { valueAsNumber: true })}
                />
              </div>
            )}

            {refreshMode === "scan_based" && (
              <div className="space-y-1.5">
                <Label>Maks Scan sebelum ganti</Label>
                <Input
                  type="number"
                  min={1}
                  {...register("max_scans", { valueAsNumber: true })}
                />
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
