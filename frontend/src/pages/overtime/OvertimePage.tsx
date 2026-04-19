/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  useOvertime,
  useSubmitOvertime,
  useApproveOvertime,
} from "@/hooks/useOvertime";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { overtimeApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Check, X, Loader2, Timer } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { format } from "date-fns";

const schema = z.object({
  overtime_date: z.string().min(1, "Tanggal wajib diisi"),
  start_time: z.string().min(1, "Jam mulai wajib diisi"),
  end_time: z.string().min(1, "Jam selesai wajib diisi"),
  reason: z.string().min(10, "Alasan minimal 10 karakter"),
});

const STATUS_BADGE: Record<string, any> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

export default function OvertimePage() {
  const { hasPermission } = useAuthStore();
  const [openForm, setOpenForm] = useState(false);
  const [tab, setTab] = useState("all");
  const qc = useQueryClient();

  const { data, isLoading } = useOvertime({
    status: tab !== "all" ? tab : undefined,
    per_page: 20,
  });

  const submitMutation = useSubmitOvertime();
  const approveMutation = useApproveOvertime();

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      overtimeApi.reject(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["overtime"] });
      toast.success("Lembur ditolak");
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { overtime_date: format(new Date(), "yyyy-MM-dd") },
  });

  const onSubmit = (d: any) => {
    submitMutation.mutate(d, {
      onSuccess: () => {
        setOpenForm(false);
        reset();
      },
    });
  };

  const overtimes = data?.data ?? [];
  const canApprove = hasPermission("overtime.approve_team");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Lembur</h1>
        {hasPermission("overtime.request") && (
          <Button onClick={() => setOpenForm(true)}>
            <Plus className="w-4 h-4 mr-2" /> Ajukan Lembur
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="pending">Menunggu</TabsTrigger>
          <TabsTrigger value="approved">Disetujui</TabsTrigger>
          <TabsTrigger value="rejected">Ditolak</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-3 space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))
          ) : overtimes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                <Timer className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Tidak ada data lembur
              </CardContent>
            </Card>
          ) : (
            overtimes.map((ot: any) => (
              <Card key={ot.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{ot.employee?.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ot.overtime_date} · {ot.start_time}–{ot.end_time}(
                        {ot.total_hours} jam)
                      </p>
                      <p className="text-xs mt-1 line-clamp-2">{ot.reason}</p>
                    </div>
                    <Badge variant={STATUS_BADGE[ot.status] ?? "secondary"}>
                      {ot.status}
                    </Badge>
                  </div>

                  {canApprove && ot.status === "pending" && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => approveMutation.mutate({ id: ot.id })}
                        disabled={approveMutation.isPending}
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Setujui
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => {
                          const reason = prompt("Alasan penolakan:");
                          if (reason)
                            rejectMutation.mutate({ id: ot.id, reason });
                        }}
                      >
                        <X className="w-3.5 h-3.5 mr-1" /> Tolak
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Form pengajuan lembur */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajukan Lembur</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tanggal Lembur</Label>
              <Input type="date" {...register("overtime_date")} />
              {errors.overtime_date && (
                <p className="text-xs text-destructive">
                  {errors.overtime_date.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Jam Mulai</Label>
                <Input type="time" {...register("start_time")} />
              </div>
              <div className="space-y-1.5">
                <Label>Jam Selesai</Label>
                <Input type="time" {...register("end_time")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Alasan Lembur</Label>
              <Textarea
                rows={3}
                placeholder="Jelaskan alasan lembur..."
                {...register("reason")}
              />
              {errors.reason && (
                <p className="text-xs text-destructive">
                  {errors.reason.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenForm(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={submitMutation.isPending}>
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  "Kirim Pengajuan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
