/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useSites,
  useCreateSite,
  useUpdateSite,
  useDeleteSite,
} from "@/hooks/useMasterData";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, MapPin, Loader2 } from "lucide-react";

const schema = z.object({
  site_code: z.string().min(1, "Kode site wajib diisi"),
  site_name: z.string().min(2, "Nama site wajib diisi"),
  company_id: z.string().min(1, "Perusahaan wajib dipilih"),
  address: z.string().optional(),
  project_manager: z.string().optional(),
  start_date: z.string().min(1, "Tanggal mulai wajib diisi"),
  end_date: z.string().optional(),
  status: z.enum(["active", "completed", "hold"]),
  gps_latitude: z.string().min(1, "Latitude wajib diisi"),
  gps_longitude: z.string().min(1, "Longitude wajib diisi"),
  gps_radius: z.string().min(1, "Radius wajib diisi"),
});

type FormValues = z.infer<typeof schema>;

export default function SitePage() {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useSites();
  const createMutation = useCreateSite();
  const updateMutation = useUpdateSite();
  const deleteMutation = useDeleteSite();

  const sites = data?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "active", gps_radius: "100" },
  });

  const openCreate = () => {
    setEditData(null);
    reset({ status: "active", gps_radius: "100" });
    setOpen(true);
  };

  const openEdit = (site: any) => {
    setEditData(site);
    reset({
      site_code: site.site_code,
      site_name: site.site_name,
      company_id: String(site.company_id),
      address: site.address ?? "",
      project_manager: site.project_manager ?? "",
      start_date: site.start_date ?? "",
      end_date: site.end_date ?? "",
      status: site.status,
      gps_latitude: String(site.gps_latitude),
      gps_longitude: String(site.gps_longitude),
      gps_radius: String(site.gps_radius),
    });
    setOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      gps_latitude: parseFloat(values.gps_latitude),
      gps_longitude: parseFloat(values.gps_longitude),
      gps_radius: parseInt(values.gps_radius),
    };
    if (editData) {
      updateMutation.mutate(
        { id: editData.id, data: payload },
        {
          onSuccess: () => {
            setOpen(false);
            reset();
          },
        },
      );
    } else {
      createMutation.mutate(payload as any, {
        onSuccess: () => {
          setOpen(false);
          reset();
        },
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <PageHeader
        title="Site / Proyek"
        subtitle="Kelola lokasi proyek dan radius absensi"
        actions={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Tambah Site
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : sites.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="Belum ada site"
          description="Tambah site atau lokasi proyek pertama Anda"
          action={{ label: "Tambah Site", onClick: openCreate }}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site: any) => (
            <Card key={site.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {site.site_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {site.site_code}
                    </p>
                  </div>
                  <StatusBadge status={site.status} />
                </div>
                <div className="text-xs text-muted-foreground space-y-1 mb-3">
                  <p>PM: {site.project_manager ?? "-"}</p>
                  <p>
                    GPS: {site.gps_latitude}, {site.gps_longitude}
                  </p>
                  <p>Radius: {site.gps_radius}m</p>
                  <p>Mulai: {site.start_date}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEdit(site)}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(site.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editData ? "Edit Site" : "Tambah Site"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>
                  Kode Site <span className="text-destructive">*</span>
                </Label>
                <Input {...register("site_code")} disabled={!!editData} />
                {errors.site_code && (
                  <p className="text-xs text-destructive">
                    {errors.site_code.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>
                  Nama Site <span className="text-destructive">*</span>
                </Label>
                <Input {...register("site_name")} />
                {errors.site_name && (
                  <p className="text-xs text-destructive">
                    {errors.site_name.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Manajer Proyek</Label>
              <Input {...register("project_manager")} />
            </div>
            <div className="space-y-1.5">
              <Label>Alamat</Label>
              <Input {...register("address")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>
                  Tanggal Mulai <span className="text-destructive">*</span>
                </Label>
                <Input type="date" {...register("start_date")} />
              </div>
              <div className="space-y-1.5">
                <Label>Tanggal Selesai</Label>
                <Input type="date" {...register("end_date")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                defaultValue="active"
                onValueChange={(v) => setValue("status", v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="hold">Ditangguhkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Koordinat GPS</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>
                    Latitude <span className="text-destructive">*</span>
                  </Label>
                  <Input placeholder="-6.2088" {...register("gps_latitude")} />
                  {errors.gps_latitude && (
                    <p className="text-xs text-destructive">
                      {errors.gps_latitude.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>
                    Longitude <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="106.8456"
                    {...register("gps_longitude")}
                  />
                </div>
              </div>
              <div className="space-y-1.5 mt-3">
                <Label>
                  Radius Absensi (meter){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min="10"
                  max="5000"
                  {...register("gps_radius")}
                />
                <p className="text-xs text-muted-foreground">
                  Karyawan harus berada dalam radius ini untuk bisa absen
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
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

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Nonaktifkan Site?"
        description="Site akan dinonaktifkan. Data absensi yang sudah ada tetap tersimpan."
        confirmLabel="Ya, Nonaktifkan"
        variant="destructive"
        onConfirm={() => {
          if (deleteId)
            deleteMutation.mutate(deleteId, {
              onSuccess: () => setDeleteId(null),
            });
        }}
      />
    </div>
  );
}
