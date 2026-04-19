/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  usePositions,
  useCreatePosition,
  useUpdatePosition,
  useDeletePosition,
} from "@/hooks/useMasterData";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Briefcase, Loader2 } from "lucide-react";

const schema = z.object({
  position_code: z.string().min(1, "Kode wajib diisi"),
  position_name: z.string().min(2, "Nama wajib diisi"),
  position_level: z.string().min(1, "Level wajib diisi"),
  job_family_id: z.string().min(1, "Job family wajib dipilih"),
  job_description: z.string().optional(),
  min_qualification: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function PositionPage() {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = usePositions();
  const createMutation = useCreatePosition();
  const updateMutation = useUpdatePosition();
  const deleteMutation = useDeletePosition();

  const positions = data?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const openCreate = () => {
    setEditData(null);
    reset({ job_family_id: "1", position_level: "1" });
    setOpen(true);
  };

  const openEdit = (pos: any) => {
    setEditData(pos);
    reset({
      position_code: pos.position_code,
      position_name: pos.position_name,
      position_level: String(pos.position_level),
      job_family_id: String(pos.job_family_id),
      job_description: pos.job_description ?? "",
      min_qualification: pos.min_qualification ?? "",
    });
    setOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      position_level: parseInt(values.position_level),
      job_family_id: parseInt(values.job_family_id),
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
      createMutation.mutate(payload, {
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
        title="Jabatan"
        subtitle="Kelola jabatan dan struktur posisi"
        actions={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Tambah Jabatan
          </Button>
        }
      />

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama Jabatan</TableHead>
              <TableHead>Level</TableHead>
              <TableHead className="hidden md:table-cell">Job Family</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 4 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : positions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState icon={Briefcase} title="Belum ada jabatan" />
                </TableCell>
              </TableRow>
            ) : (
              positions.map((pos: any) => (
                <TableRow key={pos.id}>
                  <TableCell className="font-mono text-sm">
                    {pos.position_code}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {pos.position_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">Level {pos.position_level}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {pos.job_family?.family_name ?? "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(pos)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteId(pos.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editData ? "Edit Jabatan" : "Tambah Jabatan"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>
                  Kode <span className="text-destructive">*</span>
                </Label>
                <Input {...register("position_code")} placeholder="MGR-01" />
                {errors.position_code && (
                  <p className="text-xs text-destructive">
                    {errors.position_code.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>
                  Level <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="99"
                  {...register("position_level")}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>
                Nama Jabatan <span className="text-destructive">*</span>
              </Label>
              <Input {...register("position_name")} placeholder="Manager IT" />
              {errors.position_name && (
                <p className="text-xs text-destructive">
                  {errors.position_name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Deskripsi Pekerjaan</Label>
              <Textarea rows={3} {...register("job_description")} />
            </div>
            <div className="space-y-1.5">
              <Label>Kualifikasi Minimal</Label>
              <Textarea rows={2} {...register("min_qualification")} />
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Hapus Jabatan?"
        description="Jabatan hanya bisa dihapus jika tidak ada karyawan yang memilikinya."
        confirmLabel="Ya, Hapus"
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
