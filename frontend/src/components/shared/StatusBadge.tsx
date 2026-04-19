/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";

type StatusType =
  | "active"
  | "inactive"
  | "resigned"
  | "terminated"
  | "present"
  | "late"
  | "absent"
  | "half_day"
  | "leave"
  | "sick"
  | "business_trip"
  | "pending"
  | "approved"
  | "rejected"
  | "completed"
  | "hold"
  | "blocked";

const STATUS_MAP: Record<StatusType, { label: string; variant: any }> = {
  active: { label: "Aktif", variant: "default" },
  inactive: { label: "Tidak Aktif", variant: "secondary" },
  resigned: { label: "Resign", variant: "destructive" },
  terminated: { label: "Diberhentikan", variant: "destructive" },
  present: { label: "Hadir", variant: "default" },
  late: { label: "Terlambat", variant: "secondary" },
  absent: { label: "Absen", variant: "destructive" },
  half_day: { label: "Setengah Hari", variant: "secondary" },
  leave: { label: "Cuti", variant: "outline" },
  sick: { label: "Sakit", variant: "outline" },
  business_trip: { label: "Perj. Dinas", variant: "outline" },
  pending: { label: "Menunggu", variant: "secondary" },
  approved: { label: "Disetujui", variant: "default" },
  rejected: { label: "Ditolak", variant: "destructive" },
  completed: { label: "Selesai", variant: "outline" },
  hold: { label: "Ditangguhkan", variant: "secondary" },
  blocked: { label: "Diblokir", variant: "destructive" },
};

interface Props {
  status: string;
}

export function StatusBadge({ status }: Props) {
  const config = STATUS_MAP[status as StatusType] ?? {
    label: status,
    variant: "outline",
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
