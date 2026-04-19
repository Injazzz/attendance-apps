/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Loader2, Save, Upload } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  employee_code: z.string().min(1, "NIK wajib diisi").max(20),
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
  // Account fields — hanya untuk create
  username: z.string().min(3, "Username minimal 3 karakter").max(50).optional(),
  account_email: z
    .string()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal("")),
  password: z.string().min(8, "Password minimal 8 karakter").optional(),
  password_confirmation: z.string().optional(),
  role: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

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
const ROLE_OPTIONS = [
  { value: "employee", label: "Karyawan" },
  { value: "supervisor", label: "Supervisor" },
  { value: "project_manager", label: "Project Manager" },
  { value: "hrd", label: "HRD" },
  { value: "finance", label: "Finance" },
  { value: "admin", label: "Admin" },
];

// Generate unique employee code
const generateEmployeeCode = (deptId: string, posId: string): string => {
  if (!deptId || !posId) return "";
  const randomNum = Math.floor(Math.random() * 10000000000)
    .toString()
    .padStart(10, "0");
  return `${deptId.padStart(3, "0")}${posId.padStart(3, "0")}${randomNum}`;
};

export default function EmployeeFormPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: depts } = useDepartments();
  const { data: positions } = usePositions();
  const { data: sites } = useSites();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      gender: "male",
      marital_status: "single",
      tax_status: "TK0",
      employment_type: "permanent",
      status: "active",
      role: "employee",
    },
  });

  const deptId = watch("department_id");
  const posId = watch("position_id");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Auto-generate employee code when department or position changes
  useEffect(() => {
    if (deptId && posId) {
      const newCode = generateEmployeeCode(deptId, posId);
      setValue("employee_code", newCode);
    }
  }, [deptId, posId, setValue]);

  // Handle photo preview
  const photoFile = watch("photo");
  useEffect(() => {
    if (photoFile instanceof FileList) {
      const file = photoFile[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  }, [photoFile]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const form = new FormData();

      // Add all form fields
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
          // Regular fields
          form.append(key, String(val));
        }
      });

      // Debug: log FormData content
      console.log("📝 FormData content:");
      for (const pair of form.entries()) {
        if (pair[1] instanceof File) {
          console.log(
            `  ${pair[0]}: File(${pair[1].name}, ${pair[1].size} bytes)`,
          );
        } else {
          console.log(`  ${pair[0]}: ${pair[1]}`);
        }
      }

      return employeeApi.create(form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Karyawan berhasil ditambahkan");
      navigate("/employees");
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

  const SelectField = ({
    name,
    label,
    options,
    required,
  }: {
    name: keyof FormValues;
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
    name: keyof FormValues;
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
        title="Tambah Karyawan"
        backTo="/employees"
        actions={
          <Button
            onClick={handleSubmit((d) => saveMutation.mutate(d))}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
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
        }
      />

      {/* Data Pribadi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Pribadi</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Photo Upload - hanya saat create */}

          <div className="sm:col-span-2 space-y-2">
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
                      Klik untuk upload foto (JPG, PNG max 2MB)
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
          </div>

          <TextField name="full_name" label="Nama Lengkap" required />
          <TextField
            name="email"
            label="Email Karyawan"
            type="email"
            required
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
            name="employee_code"
            label="ID Karyawan"
            required
            disabled
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

      {/* Akun Login */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Akun Login</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField name="username" label="Username" required />
          <TextField
            name="account_email"
            label="Email Akun"
            type="email"
            required
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            required
          />
          <TextField
            name="password_confirmation"
            label="Konfirmasi Password"
            type="password"
            required
          />
          <SelectField
            name="role"
            label="Role / Hak Akses"
            options={ROLE_OPTIONS}
            required
          />
        </CardContent>
      </Card>
    </div>
  );
}
