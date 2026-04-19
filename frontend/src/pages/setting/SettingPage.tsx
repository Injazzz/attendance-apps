import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { settingApi } from "@/lib/api";

export default function SettingsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: settingApi.getAll,
  });

  const { register, handleSubmit } = useForm();

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

  const settings = data?.data ?? {};

  const editableSettings = [
    { key: "app_name", label: "Nama Aplikasi" },
    { key: "qr_default_interval", label: "Interval QR Default (detik)" },
    { key: "max_login_attempts", label: "Maks Percobaan Login" },
    { key: "lock_duration_minutes", label: "Durasi Lock Akun (menit)" },
  ];

  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="text-2xl font-semibold">Pengaturan Sistem</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Konfigurasi Umum</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <form
              onSubmit={handleSubmit((d) => saveMutation.mutate(d))}
              className="space-y-4"
            >
              {editableSettings.map((s) => (
                <div key={s.key} className="space-y-1.5">
                  <Label>{s.label}</Label>
                  <Input
                    defaultValue={settings[s.key]?.value ?? ""}
                    {...register(s.key)}
                  />
                  {settings[s.key]?.description && (
                    <p className="text-xs text-muted-foreground">
                      {settings[s.key].description}
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
    </div>
  );
}
