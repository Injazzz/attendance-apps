/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, profileApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: authApi.me,
  });

  const user = data?.data;
  const employee = user?.employee;

  const { register, handleSubmit } = useForm({
    values: {
      phone: employee?.phone ?? "",
      old_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: (formData: FormData) => profileApi.update(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profil diperbarui");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? "Gagal update profil"),
  });

  const onSubmit = (values: any) => {
    const form = new FormData();
    if (values.phone) form.append("phone", values.phone);
    if (values.old_password) form.append("old_password", values.old_password);
    if (values.new_password) form.append("new_password", values.new_password);
    if (values.new_password_confirmation)
      form.append(
        "new_password_confirmation",
        values.new_password_confirmation,
      );
    updateMutation.mutate(form);
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold">Profil Saya</h1>

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <>
          <Card>
            <CardContent className="pt-6 flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={employee?.photo_url} />
                  <AvatarFallback className="text-xl">
                    {employee?.full_name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="text-center">
                <p className="font-semibold">{employee?.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {employee?.employee_code}
                </p>
                <p className="text-sm text-muted-foreground">{user?.role}</p>
              </div>
              <div className="w-full grid grid-cols-2 gap-2 text-sm mt-2">
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-muted-foreground text-xs">Departemen</p>
                  <p className="font-medium mt-0.5">
                    {employee?.department?.name ?? "-"}
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-muted-foreground text-xs">Jabatan</p>
                  <p className="font-medium mt-0.5">
                    {employee?.position?.name ?? "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Edit Profil</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Nomor Telepon</Label>
                  <Input {...register("phone")} placeholder="08xxxxxxxxxx" />
                </div>

                <div className="border-t pt-4 space-y-3">
                  <p className="text-sm font-medium">Ganti Password</p>
                  <div className="space-y-1.5">
                    <Label>Password Lama</Label>
                    <Input type="password" {...register("old_password")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Password Baru</Label>
                    <Input type="password" {...register("new_password")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Konfirmasi Password Baru</Label>
                    <Input
                      type="password"
                      {...register("new_password_confirmation")}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
