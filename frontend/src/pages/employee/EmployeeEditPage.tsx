/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeApi } from "@/lib/api";
import { useDepartments, usePositions, useSites } from "@/hooks/useMasterData";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Trash2, QrCode } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const editSchema = z.object({
  full_name: z.string().min(2, "Nama wajib diisi").max(100),
  email: z.string().email("Format email tidak valid").max(100),
  phone: z.string().max(15).optional(),
  id_card: z.string().max(50).optional(),
  npwp: z.string().max(25).optional(),
  gender: z.enum(["male", "female"]),
  marital_status: z.enum(["single", "married", "divorced", "widowed"]),
  tax_status: z.enum(["TK0", "TK1", "TK2", "TK3", "K0", "K1", "K2", "K3"]),
  birthdate: z.string().optional(),
  birthplace: z.string().optional(),
  hire_date: z.string().min(1, "Tanggal masuk wajib diisi"),
  employment_type: z.enum([
    "permanent",
    "contract",
    "probation",
    "outsource",
    "daily_worker",
  ]),
  status: z.enum(["active", "inactive", "resigned", "terminated"]),
  department_id: z.string().min(1, "Departemen wajib dipilih"),
  position_id: z.string().min(1, "Jabatan wajib dipilih"),
  site_id: z.string().optional(),
  photo: z.any().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

const GENDER_OPTIONS = [
  { value: "male", label: "Laki-laki" },
  { value: "female", label: "Perempuan" },
];
const MARITAL_OPTIONS = [
  { value: "single", label: "Belum Menikah" },
  { value: "married", label: "Menikah" },
  { value: "divorced", label: "Cerai" },
  { value: "widowed", label: "Janda/Duda" },
];
const TAX_OPTIONS = ["TK0", "TK1", "TK2", "TK3", "K0", "K1", "K2", "K3"];
const EMP_TYPE_OPTIONS = [
  { value: "permanent", label: "Tetap" },
  { value: "contract", label: "Kontrak" },
  { value: "probation", label: "Percobaan" },
  { value: "outsource", label: "Outsource" },
  { value: "daily_worker", label: "Harian" },
];
const STATUS_OPTIONS = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Tidak Aktif" },
  { value: "resigned", label: "Resign" },
  { value: "terminated", label: "Diberhentikan" },
];

export default function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: depts } = useDepartments();
  const { data: positions } = usePositions();
  const { data: sites } = useSites();

  const { data: existingData, isLoading: isLoadingEmployee } = useQuery({
    queryKey: ["employees", "detail", id],
    queryFn: () => employeeApi.getById(Number(id)),
    enabled: !!id,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      gender: "male",
      marital_status: "single",
      tax_status: "TK0",
      employment_type: "permanent",
      status: "active",
    },
  });

  const photoFile = watch("photo");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [hasLocalFile, setHasLocalFile] = useState(false);

  useEffect(() => {
    if (photoFile instanceof FileList) {
      const file = photoFile[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result as string);
          setHasLocalFile(true);
        };
        reader.readAsDataURL(file);
      }
    }
  }, [photoFile]);

  useEffect(() => {
    if (existingData?.data && !hasLocalFile) {
      const emp = existingData.data;
      reset({
        full_name: emp.full_name,
        email: emp.email,
        phone: emp.phone ?? "",
        id_card: emp.id_card ?? "",
        npwp: emp.npwp ?? "",
        gender: emp.gender,
        marital_status: emp.marital_status,
        tax_status: emp.tax_status,
        birthdate: emp.birthdate ?? "",
        birthplace: emp.birthplace ?? "",
        hire_date: emp.hire_date ?? "",
        employment_type: emp.employment_type,
        status: emp.status,
        department_id: String(emp.department?.id ?? ""),
        position_id: String(emp.position?.id ?? ""),
        site_id: emp.site?.id ? String(emp.site.id) : "",
      });

      // Load existing photo with cache buster
      if (emp.photo_url && emp.photo_url.trim()) {
        let photoUrl = emp.photo_url;

        // Add cache-busting timestamp
        const separator = photoUrl.includes("?") ? "&" : "?";
        photoUrl = photoUrl + separator + "_t=" + Date.now();

        console.log("📸 Photo with cache buster:", photoUrl);
        setPhotoPreview(photoUrl);
      }
    }
  }, [existingData, reset, hasLocalFile]);

  const updateMutation = useMutation({
    mutationFn: (values: EditFormValues) => {
      const form = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (val === undefined || val === "") return;

        // Handle file uploads
        if (key === "photo") {
          if (val instanceof FileList && val[0]) {
            console.log("📸 Adding photo from FileList:", val[0].name);
            form.append(key, val[0]);
          } else if (val instanceof File) {
            console.log("📸 Adding photo from File:", val.name);
            form.append(key, val);
          }
        } else {
          form.append(key, String(val));
        }
      });

      // Debug: log FormData content
      console.log("📝 FormData content for update:");
      for (const pair of form.entries()) {
        if (pair[1] instanceof File) {
          console.log(
            `  ${pair[0]}: File(${pair[1].name}, ${pair[1].size} bytes)`,
          );
        } else {
          console.log(`  ${pair[0]}: ${pair[1]}`);
        }
      }

      return employeeApi.update(Number(id), form);
    },
    onSuccess: (response) => {
      // Update cache with fresh data from response
      qc.setQueryData(["employees", "detail", id], response);

      // Clear photo preview and local file flag to show fresh data from API
      setPhotoPreview(null);
      setHasLocalFile(false);

      // Clear file input element
      const photoInput = document.getElementById("photo") as HTMLInputElement;
      if (photoInput) {
        photoInput.value = "";
        console.log("🧹 File input cleared");
      }

      if (response?.data) {
        const emp = response.data;
        reset({
          full_name: emp.full_name,
          email: emp.email,
          phone: emp.phone ?? "",
          id_card: emp.id_card ?? "",
          npwp: emp.npwp ?? "",
          gender: emp.gender,
          marital_status: emp.marital_status,
          tax_status: emp.tax_status,
          birthdate: emp.birthdate ?? "",
          birthplace: emp.birthplace ?? "",
          hire_date: emp.hire_date ?? "",
          employment_type: emp.employment_type,
          status: emp.status,
          department_id: String(emp.department?.id ?? ""),
          position_id: String(emp.position?.id ?? ""),
          site_id: emp.site?.id ? String(emp.site.id) : "",
        });

        // Load fresh photo from API response with cache buster
        if (emp.photo_url && emp.photo_url.trim()) {
          let photoUrl = emp.photo_url;
          const separator = photoUrl.includes("?") ? "&" : "?";
          photoUrl = photoUrl + separator + "_t=" + Date.now();
          console.log("📸 Fresh photo after update:", photoUrl);
          setPhotoPreview(photoUrl);
        }
      }

      // Aggressively invalidate employees queries
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.refetchQueries({ queryKey: ["employees", "detail", id] });

      toast.success("Data karyawan berhasil diperbarui");

      // Optional: Delay navigation to see the updated photo
      setTimeout(() => navigate("/employees"), 500);
    },
    onError: (e: any) => {
      const errors = e.response?.data?.errors;
      if (errors) {
        Object.values(errors)
          .flat()
          .forEach((msg: any) => toast.error(msg));
      } else {
        toast.error(e.response?.data?.message ?? "Terjadi kesalahan");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => employeeApi.remove(Number(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Karyawan berhasil dihapus");
      navigate("/employees");
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message ?? "Gagal menghapus");
    },
  });

  if (isLoadingEmployee) {
    return <div className="text-center py-10">Loading...</div>;
  }

  const SelectField = ({
    name,
    label,
    options,
    required,
  }: {
    name: keyof EditFormValues;
    label: string;
    options: { value: string; label: string }[];
    required?: boolean;
  }) => (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select value={field.value as string} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue placeholder={`Pilih ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {errors[name] && (
        <p className="text-xs text-destructive">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );

  const TextField = ({
    name,
    label,
    type = "text",
    required,
    disabled,
  }: {
    name: keyof EditFormValues;
    label: string;
    type?: string;
    required?: boolean;
    disabled?: boolean;
  }) => (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input type={type} {...register(name)} disabled={disabled} />
      {errors[name] && (
        <p className="text-xs text-destructive">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Edit Karyawan"
        backTo="/employees"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/employees/${id}/qr`)}
            >
              <QrCode className="w-4 h-4 mr-2" />
              Lihat QR
            </Button>
            <Button
              onClick={handleSubmit((d) => updateMutation.mutate(d))}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan
                </>
              )}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>Hapus Karyawan?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tindakan ini akan menonaktifkan karyawan. Data tidak akan
                  dihapus permanen.
                </AlertDialogDescription>
                <div className="flex gap-2 justify-end">
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate()}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Hapus
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />

      {/* Data Pribadi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Pribadi</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Photo Upload */}
          {/* <div className="sm:col-span-2 space-y-2">
            <Label>Foto Profil</Label>
            <div className="flex gap-4">
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-lg object-cover border"
                />
              )}
              <div className="flex flex-col justify-center flex-1">
                <Label htmlFor="photo" className="cursor-pointer">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
                    <Upload className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Klik untuk ganti foto (JPG, PNG max 2MB)
                    </span>
                  </div>
                </Label>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  {...register("photo")}
                />
              </div>
            </div>
          </div> */}

          <TextField name="full_name" label="Nama Lengkap" required />
          <TextField
            name="email"
            label="Email Karyawan"
            type="email"
            required
            disabled
          />
          <TextField name="id_card" label="No. KTP" />
          <TextField name="npwp" label="No. NPWP" />
          <TextField name="phone" label="No. Telepon" type="tel" />
          <TextField name="birthplace" label="Tempat Lahir" />
          <TextField name="birthdate" label="Tanggal Lahir" type="date" />
          <SelectField
            name="gender"
            label="Jenis Kelamin"
            options={GENDER_OPTIONS}
            required
          />
          <SelectField
            name="marital_status"
            label="Status Nikah"
            options={MARITAL_OPTIONS}
            required
          />
          <SelectField
            name="tax_status"
            label="Status Pajak"
            options={TAX_OPTIONS.map((v) => ({ value: v, label: v }))}
            required
          />
        </CardContent>
      </Card>

      {/* Data Kepegawaian */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Kepegawaian</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            name="department_id"
            label="Departemen"
            required
            options={(depts?.data ?? []).map((d: any) => ({
              value: String(d.id),
              label: d.dept_name,
            }))}
          />
          <SelectField
            name="position_id"
            label="Jabatan"
            required
            options={(positions?.data ?? []).map((p: any) => ({
              value: String(p.id),
              label: p.position_name,
            }))}
          />
          <SelectField
            name="site_id"
            label="Site / Lokasi"
            options={(sites?.data ?? []).map((s: any) => ({
              value: String(s.id),
              label: s.site_name,
            }))}
          />
          <TextField
            name="hire_date"
            label="Tanggal Masuk"
            type="date"
            required
          />
          <SelectField
            name="employment_type"
            label="Tipe Karyawan"
            options={EMP_TYPE_OPTIONS}
            required
          />
          <SelectField
            name="status"
            label="Status"
            options={STATUS_OPTIONS}
            required
          />
        </CardContent>
      </Card>
    </div>
  );
}
