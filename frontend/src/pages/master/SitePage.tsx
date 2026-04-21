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
import { Pagination } from "@/components/shared/Pagination";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

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
  const [page, setPage] = useState(1);

  const { data, isLoading } = useSites({ page, per_page: 10 });
  const createMutation = useCreateSite();
  const updateMutation = useUpdateSite();
  const deleteMutation = useDeleteSite();

  const sites = data?.data ?? [];
  const meta = data?.meta;

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Site / Proyek</h1>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Site
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama Site</TableHead>
              <TableHead className="hidden md:table-cell">
                Project Manager
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                Lokasi (GPS)
              </TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : sites.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground"
                >
                  Belum ada data site
                </TableCell>
              </TableRow>
            ) : (
              sites.map((site: any) => (
                <TableRow key={site.id}>
                  <TableCell className="font-medium text-sm">
                    {site.site_code}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{site.site_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {site.address}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {site.project_manager ?? "-"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {site.gps_latitude}, {site.gps_longitude}
                    <br />
                    <span className="text-xs">Radius: {site.gps_radius}m</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <StatusBadge status={site.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => openEdit(site)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(site.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <Pagination meta={meta} onPageChange={setPage} />
      )}

      {/* Dialog Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editData ? "Edit Site" : "Tambah Site"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Kode Site</Label>
                <Input
                  placeholder="SITE001"
                  {...register("site_code")}
                  disabled={isPending || !!editData}
                />
                {errors.site_code && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.site_code.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Nama Site</Label>
                <Input
                  placeholder="Kantor Pusat"
                  {...register("site_name")}
                  disabled={isPending}
                />
                {errors.site_name && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.site_name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Latitude</Label>
                <Input
                  placeholder="-6.2088"
                  {...register("gps_latitude")}
                  disabled={isPending}
                />
                {errors.gps_latitude && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.gps_latitude.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Longitude</Label>
                <Input
                  placeholder="106.8456"
                  {...register("gps_longitude")}
                  disabled={isPending}
                />
                {errors.gps_longitude && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.gps_longitude.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label>Radius (meter)</Label>
              <Input
                type="number"
                min="10"
                max="5000"
                placeholder="100"
                {...register("gps_radius")}
                disabled={isPending}
              />
              {errors.gps_radius && (
                <p className="text-xs text-destructive mt-1">
                  {errors.gps_radius.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Karyawan harus berada dalam radius ini untuk bisa absen
              </p>
            </div>

            <div>
              <Label>Alamat</Label>
              <Input
                placeholder="Jl. Contoh No. 1"
                {...register("address")}
                disabled={isPending}
              />
            </div>

            <div>
              <Label>Project Manager</Label>
              <Input
                placeholder="Nama PM"
                {...register("project_manager")}
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tanggal Mulai</Label>
                <Input
                  type="date"
                  {...register("start_date")}
                  disabled={isPending}
                />
                {errors.start_date && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.start_date.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Tanggal Selesai</Label>
                <Input
                  type="date"
                  {...register("end_date")}
                  disabled={isPending}
                />
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                defaultValue="active"
                onValueChange={(v) => setValue("status", v as any)}
              >
                <SelectTrigger disabled={isPending}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="hold">Ditangguhkan</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-xs text-destructive mt-1">
                  {errors.status.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editData ? "Simpan" : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Site"
        description="Apakah Anda yakin ingin menghapus site ini?"
        confirmLabel="Ya, Hapus"
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId, {
              onSuccess: () => setDeleteId(null),
            });
          }
        }}
      />
    </div>
  );
}
