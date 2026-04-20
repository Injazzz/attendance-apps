/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Plus, Edit2, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingApi } from "@/lib/api";
import {
  useAttendanceRules,
  useCreateAttendanceRule,
  useUpdateAttendanceRule,
  useDeleteAttendanceRule,
} from "@/hooks/useAttendance";

export default function SettingsPage() {
  const qc = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id?: number;
  }>({ open: false });

  // Settings queries
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: settingApi.getAll,
  });

  // Attendance rules queries and mutations
  const { data: rulesData, isLoading: rulesLoading } = useAttendanceRules();
  const createRule = useCreateAttendanceRule();
  const updateRule = useUpdateAttendanceRule(editingRule?.id || 0);
  const deleteRule = useDeleteAttendanceRule(deleteDialog.id || 0);

  const { register: registerSettings, handleSubmit: handleSettingsSubmit } =
    useForm();
  const {
    register: registerRule,
    handleSubmit: handleRuleSubmit,
    reset: resetRule,
  } = useForm();

  // Settings mutation
  const saveMutation = useMutation({
    mutationFn: (values: Record<string, string>) => {
      const settings = Object.entries(values).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      return settingApi.update({ settings });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Pengaturan disimpan");
    },
    onError: () => toast.error("Gagal menyimpan pengaturan"),
  });

  const settingsData = settings?.data ?? {};
  const rulesArray = rulesData?.data ?? [];

  const editableSettings = [
    { key: "app_name", label: "Nama Aplikasi" },
    { key: "qr_default_interval", label: "Interval QR Default (detik)" },
    { key: "max_login_attempts", label: "Maks Percobaan Login" },
    { key: "lock_duration_minutes", label: "Durasi Lock Akun (menit)" },
  ];

  const handleEditRule = (rule: any) => {
    setEditingRule(rule);
    resetRule({
      rule_name: rule.rule_name,
      start_time: rule.start_time,
      end_time: rule.end_time,
      late_grace_period: rule.late_grace_period,
      late_threshold: rule.late_threshold,
      max_late_minutes_per_month: rule.max_late_minutes_per_month,
      overtime_start_after: rule.overtime_start_after,
    });
    setOpenDialog(true);
  };

  const handleSubmitRule = (data: any) => {
    if (editingRule) {
      updateRule.mutate(data, {
        onSuccess: () => {
          setOpenDialog(false);
          setEditingRule(null);
          resetRule();
          toast.success("Aturan absensi berhasil diperbarui");
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || "Gagal memperbarui aturan absensi",
          );
        },
      });
    } else {
      createRule.mutate(data, {
        onSuccess: () => {
          setOpenDialog(false);
          resetRule();
          toast.success("Aturan absensi berhasil dibuat");
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || "Gagal membuat aturan absensi",
          );
        },
      });
    }
  };

  const handleDeleteRule = () => {
    if (deleteDialog.id) {
      deleteRule.mutate(undefined, {
        onSuccess: () => {
          setDeleteDialog({ open: false });
          toast.success("Aturan absensi berhasil dihapus");
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || "Gagal menghapus aturan absensi",
          );
        },
      });
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <h1 className="text-2xl font-semibold">Pengaturan Sistem</h1>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">Umum</TabsTrigger>
          <TabsTrigger value="attendance">Aturan Absensi</TabsTrigger>
        </TabsList>

        {/* ── GENERAL SETTINGS ── */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Konfigurasi Umum</CardTitle>
            </CardHeader>
            <CardContent>
              {settingsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <form
                  onSubmit={handleSettingsSubmit((d) => saveMutation.mutate(d))}
                  className="space-y-4"
                >
                  {editableSettings.map((s) => (
                    <div key={s.key} className="space-y-1.5">
                      <Label>{s.label}</Label>
                      <Input
                        defaultValue={settingsData[s.key]?.value ?? ""}
                        {...registerSettings(s.key)}
                      />
                      {settingsData[s.key]?.description && (
                        <p className="text-xs text-muted-foreground">
                          {settingsData[s.key].description}
                        </p>
                      )}
                    </div>
                  ))}
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Simpan Pengaturan
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ATTENDANCE RULES ── */}
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Aturan Absensi</CardTitle>
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingRule(null);
                      resetRule({
                        rule_name: "",
                        start_time: "08:00:00",
                        end_time: "17:00:00",
                        late_grace_period: 15,
                        late_threshold: 30,
                        max_late_minutes_per_month: 120,
                        overtime_start_after: 60,
                      });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Aturan
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingRule ? "Edit" : "Tambah"} Aturan Absensi
                    </DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={handleRuleSubmit(handleSubmitRule)}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="rule_name">Nama Aturan</Label>
                      <Input
                        id="rule_name"
                        placeholder="Contoh: Aturan Standar"
                        {...registerRule("rule_name", {
                          required: "Nama aturan wajib diisi",
                        })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="start_time">Jam Mulai Kerja</Label>
                        <Input
                          id="start_time"
                          type="time"
                          {...registerRule("start_time", {
                            required: "Jam mulai wajib diisi",
                          })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="end_time">Jam Akhir Kerja</Label>
                        <Input
                          id="end_time"
                          type="time"
                          {...registerRule("end_time", {
                            required: "Jam akhir wajib diisi",
                          })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="late_grace_period">
                          Toleransi Terlambat (menit)
                        </Label>
                        <Input
                          id="late_grace_period"
                          type="number"
                          min="0"
                          {...registerRule("late_grace_period", {
                            valueAsNumber: true,
                          })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Checkin dalam periode ini dianggap tepat waktu
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="late_threshold">
                          Batas Maksimal Terlambat (menit)
                        </Label>
                        <Input
                          id="late_threshold"
                          type="number"
                          min="0"
                          {...registerRule("late_threshold", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="max_late_minutes_per_month">
                          Maks Terlambat/Bulan (menit)
                        </Label>
                        <Input
                          id="max_late_minutes_per_month"
                          type="number"
                          min="0"
                          {...registerRule("max_late_minutes_per_month", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="overtime_start_after">
                          Lembur Dihitung Setelah (menit)
                        </Label>
                        <Input
                          id="overtime_start_after"
                          type="number"
                          min="0"
                          {...registerRule("overtime_start_after", {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={createRule.isPending || updateRule.isPending}
                      className="w-full"
                    >
                      {createRule.isPending || updateRule.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Simpan Aturan
                        </>
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent>
              {rulesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : rulesArray.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Belum ada aturan absensi. Silakan buat aturan baru.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rulesArray.map((rule: any) => (
                    <div
                      key={rule.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{rule.rule_name}</h3>
                          {rule.id === 1 && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Jam Kerja:{" "}
                            </span>
                            <span className="font-mono">
                              {rule.start_time} - {rule.end_time}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Toleransi:{" "}
                            </span>
                            <span className="font-mono">
                              {rule.late_grace_period} menit
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Batas Terlambat:{" "}
                            </span>
                            <span className="font-mono">
                              {rule.late_threshold} menit
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Maks Terlambat/Bulan:{" "}
                            </span>
                            <span className="font-mono">
                              {rule.max_late_minutes_per_month} menit
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditRule(rule)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            setDeleteDialog({ open: true, id: rule.id })
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── DELETE CONFIRMATION ── */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Aturan Absensi?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Aturan absensi akan dihapus
              secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRule}
              disabled={deleteRule.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteRule.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
