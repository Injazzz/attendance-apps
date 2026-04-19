/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "@/hooks/useEmployee";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useDebounce } from "@/hooks/useDebounce";

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useEmployees({
    search: debouncedSearch,
    page,
    per_page: 15,
  });

  const employees = data?.data ?? [];
  const meta = data?.meta;

  const STATUS_BADGE: Record<string, string> = {
    active: "default",
    inactive: "secondary",
    resigned: "destructive",
    terminated: "destructive",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Karyawan</h1>
        {hasPermission("employees.create") && (
          <Button onClick={() => navigate("/employees/create")}>
            <Plus className="w-4 h-4 mr-2" /> Tambah
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama atau ID Karyawan..."
          className="pl-9"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Karyawan</TableHead>
              <TableHead className="hidden sm:table-cell">Departemen</TableHead>
              <TableHead className="hidden md:table-cell">Jabatan</TableHead>
              <TableHead>Status</TableHead>
              {hasPermission("employees.edit") && (
                <TableHead className="w-16" />
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 4 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground"
                >
                  Tidak ada data karyawan
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp: any) => (
                <TableRow
                  key={emp.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/employees/${emp.id}/edit`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={emp.photo_url} />
                        <AvatarFallback className="text-xs">
                          {emp.full_name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{emp.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {emp.employee_code}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">
                    {emp.department?.name ?? "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {emp.position?.name ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={(STATUS_BADGE[emp.status] as any) ?? "secondary"}
                    >
                      {emp.status}
                    </Badge>
                  </TableCell>
                  {hasPermission("employees.edit") && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/employees/${emp.id}/edit`);
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>Total: {meta.total} karyawan</p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span>
              {page} / {meta.last_page}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= meta.last_page}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
