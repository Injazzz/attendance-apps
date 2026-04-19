/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "@/hooks/useMasterData";
import { useEmployees } from "@/hooks/useEmployee";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Building2, Loader2, X } from "lucide-react";

const schema = z.object({
  dept_code: z.string().min(1, "Kode wajib diisi"),
  dept_name: z.string().min(2, "Nama wajib diisi"),
  cost_center: z.string().optional(),
  company_id: z.string().min(1),
  department_head_id: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

export default function DepartmentPage() {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [headId, setHeadId] = useState<string>("");
  const [headSearch, setHeadSearch] = useState<string>("");

  const { data, isLoading } = useDepartments();
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  const departments = data?.data ?? [];
  const employeeList = employees?.data ?? [];

  // Filter employees berdasarkan search term
  const filteredEmployees = employeeList.filter(
    (emp: any) =>
      emp.full_name.toLowerCase().includes(headSearch.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(headSearch.toLowerCase()),
  );

  // Get selected employee name
  const selectedEmployee = employeeList.find(
    (emp: any) => String(emp.id) === headId,
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const openCreate = () => {
    setEditData(null);
    setHeadId("");
    setHeadSearch("");
    reset({ company_id: "1", department_head_id: null });
    setOpen(true);
  };

  const openEdit = (dept: any) => {
    setEditData(dept);
    const headIdValue = dept.department_head_id
      ? String(dept.department_head_id)
      : "";
    setHeadId(headIdValue);
    setHeadSearch("");
    reset({
      dept_code: dept.dept_code,
      dept_name: dept.dept_name,
      cost_center: dept.cost_center ?? "",
      company_id: String(dept.company_id),
      department_head_id: headIdValue || null,
    });
    setOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    const payload: any = {
      ...values,
      company_id: parseInt(values.company_id),
    };
    if (values.department_head_id) {
      payload.department_head_id = parseInt(values.department_head_id);
    }
    if (editData) {
      updateMutation.mutate(
        { id: editData.id, data: payload },
        {
          onSuccess: () => {
            setOpen(false);
            reset();
            setHeadId("");
          },
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setOpen(false);
          reset();
          setHeadId("");
        },
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <PageHeader
        title="Departemen"
        subtitle="Kelola struktur departemen perusahaan"
        actions={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Tambah Departemen
          </Button>
        }
      />

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama Departemen</TableHead>
              <TableHead className="hidden sm:table-cell">
                Cost Center
              </TableHead>
              <TableHead className="hidden md:table-cell">
                Kepala Dept.
              </TableHead>
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
            ) : departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState icon={Building2} title="Belum ada departemen" />
                </TableCell>
              </TableRow>
            ) : (
              departments.map((dept: any) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-mono text-sm">
                    {dept.dept_code}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {dept.dept_name}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {dept.cost_center ?? "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {dept.head?.full_name ?? "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(dept)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteId(dept.id)}
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
              {editData ? "Edit Departemen" : "Tambah Departemen"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>
                  Kode <span className="text-destructive">*</span>
                </Label>
                <Input {...register("dept_code")} placeholder="IT" />
                {errors.dept_code && (
                  <p className="text-xs text-destructive">
                    {errors.dept_code.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Cost Center</Label>
                <Input {...register("cost_center")} placeholder="CC-IT-001" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>
                Nama Departemen <span className="text-destructive">*</span>
              </Label>
              <Input
                {...register("dept_name")}
                placeholder="Information Technology"
              />
              {errors.dept_name && (
                <p className="text-xs text-destructive">
                  {errors.dept_name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Kepala Departemen</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Cari nama atau kode karyawan..."
                  value={headSearch}
                  onChange={(e) => setHeadSearch(e.target.value)}
                  disabled={employeesLoading}
                  className="text-sm"
                />
                {selectedEmployee && (
                  <div className="flex items-center justify-between px-3 py-2 bg-blue-50 border text-gray-700 border-blue-200 rounded-md">
                    <span className="text-sm">
                      ✓ {selectedEmployee.full_name} (
                      {selectedEmployee.employee_code})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setHeadId("");
                        setHeadSearch("");
                        setValue("department_head_id", null, {
                          shouldValidate: true,
                        });
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {headSearch && !employeesLoading && (
                  <div className="border rounded-md max-h-40 overflow-y-auto">
                    {filteredEmployees.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                        Karyawan tidak ditemukan
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setHeadId("");
                            setHeadSearch("");
                            setValue("department_head_id", null, {
                              shouldValidate: true,
                            });
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted-foreground border-b transition-colors"
                        >
                          Tidak ada
                        </button>
                        {filteredEmployees.map((emp: any) => (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => {
                              setHeadId(String(emp.id));
                              setHeadSearch("");
                              setValue("department_head_id", String(emp.id), {
                                shouldValidate: true,
                              });
                            }}
                            className={`w-full px-3 py-2 text-left text-sm transition-colors border-b last:border-b-0 ${
                              String(emp.id) === headId
                                ? "bg-muted-foreground font-medium"
                                : "hover:bg-blue-100/30"
                            }`}
                          >
                            {emp.full_name} ({emp.employee_code})
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
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
        title="Hapus Departemen?"
        description="Departemen hanya bisa dihapus jika tidak ada karyawan aktif di dalamnya."
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
