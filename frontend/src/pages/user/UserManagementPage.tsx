/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useUsers,
  useToggleActive,
  useResetPassword,
  useUnlockUser,
  useChangeRole,
} from "@/hooks/useUser";
import { useDebounce } from "@/hooks/useDebounce";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterBar } from "@/components/shared/FilterBar";
import { Pagination } from "@/components/shared/Pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  MoreVertical,
  Lock,
  Unlock,
  KeyRound,
  Shield,
  Loader2,
} from "lucide-react";

const resetSchema = z
  .object({
    new_password: z.string().min(8, "Minimal 8 karakter"),
    new_password_confirmation: z.string().min(8),
  })
  .refine((d) => d.new_password === d.new_password_confirmation, {
    message: "Password tidak cocok",
    path: ["new_password_confirmation"],
  });

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  hrd: "HRD",
  finance: "Finance",
  project_manager: "Project Manager",
  supervisor: "Supervisor",
  employee: "Karyawan",
};

const ROLE_OPTIONS = [
  "admin",
  "hrd",
  "finance",
  "project_manager",
  "supervisor",
  "employee",
];

export default function UserManagementPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [resetTarget, setResetTarget] = useState<any>(null);
  const [roleTarget, setRoleTarget] = useState<any>(null);
  const [newRole, setNewRole] = useState("");
  const [confirmToggle, setConfirmToggle] = useState<any>(null);
  const [confirmUnlock, setConfirmUnlock] = useState<any>(null);

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useUsers({
    search: debouncedSearch || undefined,
    role: roleFilter || undefined,
    page,
    per_page: 15,
  });

  const toggleMutation = useToggleActive();
  const unlockMutation = useUnlockUser();
  const roleMutation = useChangeRole();
  const resetMutation = useResetPassword();

  const users = data?.data ?? [];
  const meta = data?.meta;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetSchema) });

  const onResetPassword = (values: any) => {
    resetMutation.mutate(
      { id: resetTarget.id, data: values },
      {
        onSuccess: () => {
          setResetTarget(null);
          reset();
        },
      },
    );
  };

  return (
    <div>
      <PageHeader
        title="Manajemen Pengguna"
        subtitle="Kelola akun dan hak akses pengguna"
      />

      <FilterBar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Cari nama, username, email..."
      >
        <Select
          value={roleFilter}
          onValueChange={(v) => {
            setRoleFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Semua Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Role</SelectItem>
            {Object.entries(ROLE_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pengguna</TableHead>
              <TableHead>Username</TableHead>
              <TableHead className="hidden sm:table-cell">Role</TableHead>
              <TableHead className="hidden md:table-cell">
                Login Terakhir
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    icon={Users}
                    title="Tidak ada pengguna ditemukan"
                  />
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {user.name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-mono">
                    {user.username}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className="text-xs">
                      {ROLE_LABELS[user.role] ?? user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {user.last_login ?? "Belum pernah"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={user.is_active ? "active" : "inactive"}
                    />
                  </TableCell>
                  <TableCell>
                    {user.role !== "super_admin" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setConfirmToggle(user)}
                          >
                            {user.is_active ? (
                              <>
                                <Lock className="w-3.5 h-3.5 mr-2" />
                                Nonaktifkan
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3.5 h-3.5 mr-2" />
                                Aktifkan
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setResetTarget(user)}
                          >
                            <KeyRound className="w-3.5 h-3.5 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setRoleTarget(user);
                              setNewRole(user.role);
                            }}
                          >
                            <Shield className="w-3.5 h-3.5 mr-2" />
                            Ubah Role
                          </DropdownMenuItem>
                          {user.locked_until && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-amber-600"
                                onClick={() => setConfirmUnlock(user)}
                              >
                                <Unlock className="w-3.5 h-3.5 mr-2" />
                                Buka Kunci Akun
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {meta && <Pagination meta={meta} onPageChange={setPage} />}

      {/* Reset Password Dialog */}
      <Dialog
        open={!!resetTarget}
        onOpenChange={(v) => !v && setResetTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Reset password untuk{" "}
            <span className="font-medium">{resetTarget?.name}</span>. User harus
            login ulang setelah password direset.
          </p>
          <form onSubmit={handleSubmit(onResetPassword)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Password Baru</Label>
              <Input type="password" {...register("new_password")} />
              {errors.new_password && (
                <p className="text-xs text-destructive">
                  {errors.new_password.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Konfirmasi Password</Label>
              <Input
                type="password"
                {...register("new_password_confirmation")}
              />
              {errors.new_password_confirmation && (
                <p className="text-xs text-destructive">
                  {errors.new_password_confirmation.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setResetTarget(null)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={resetMutation.isPending}>
                {resetMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Reset Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog
        open={!!roleTarget}
        onOpenChange={(v) => !v && setRoleTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Ubah Role</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-3">
            Mengubah role{" "}
            <span className="font-medium">{roleTarget?.name}</span>
          </p>
          <Select value={newRole} onValueChange={setNewRole}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABELS[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleTarget(null)}>
              Batal
            </Button>
            <Button
              disabled={roleMutation.isPending}
              onClick={() => {
                roleMutation.mutate(
                  { id: roleTarget.id, role: newRole },
                  { onSuccess: () => setRoleTarget(null) },
                );
              }}
            >
              {roleMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmToggle}
        onOpenChange={(v) => !v && setConfirmToggle(null)}
        title={
          confirmToggle?.is_active ? "Nonaktifkan Akun?" : "Aktifkan Akun?"
        }
        description={
          confirmToggle?.is_active
            ? "Pengguna tidak akan bisa login hingga diaktifkan kembali."
            : "Pengguna akan bisa login kembali."
        }
        variant={confirmToggle?.is_active ? "destructive" : "default"}
        confirmLabel={
          confirmToggle?.is_active ? "Ya, Nonaktifkan" : "Ya, Aktifkan"
        }
        onConfirm={() => {
          toggleMutation.mutate(confirmToggle.id, {
            onSuccess: () => setConfirmToggle(null),
          });
        }}
      />

      <ConfirmDialog
        open={!!confirmUnlock}
        onOpenChange={(v) => !v && setConfirmUnlock(null)}
        title="Buka Kunci Akun?"
        description="Akun yang terkunci akan dibuka dan pengguna bisa login kembali."
        confirmLabel="Ya, Buka Kunci"
        onConfirm={() => {
          unlockMutation.mutate(confirmUnlock.id, {
            onSuccess: () => setConfirmUnlock(null),
          });
        }}
      />
    </div>
  );
}
