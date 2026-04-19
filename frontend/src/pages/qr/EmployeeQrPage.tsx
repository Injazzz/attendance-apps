import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { employeeApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EmployeeQrPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [qrImg, setQrImg] = useState<string | null>(null);

  // Fetch employee details and QR code
  const { data: employee, isLoading: employeeLoading } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => employeeApi.getById(Number(id)),
    enabled: !!id,
  });

  const {
    data: qrData,
    isLoading: qrLoading,
    refetch,
  } = useQuery({
    queryKey: ["employee-qr", id],
    queryFn: async () => {
      const res = await employeeApi.generateQr(Number(id));
      if (res.data.qr_image) {
        setQrImg(`data:image/png;base64,${res.data.qr_image}`);
      }
      return res.data;
    },
    enabled: !!id,
  });

  const isLoading = employeeLoading || qrLoading;

  // Download QR code
  const handleDownloadQr = () => {
    if (!qrImg) {
      toast.error("QR code belum tersedia");
      return;
    }

    const link = document.createElement("a");
    link.href = qrImg;
    link.download = `QR-${employee?.data.employee_code || id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR code berhasil diunduh");
  };

  // Regenerate QR
  const regenerateMutation = useMutation({
    mutationFn: () => refetch().then((res) => res.data?.data),
    onSuccess: () => toast.success("QR code berhasil diperbarui"),
    onError: () => toast.error("Gagal membuat ulang QR code"),
  });

  const empData = employee?.data;

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/employees")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">QR Code Karyawan</h1>
          <p className="text-sm text-muted-foreground">
            Untuk scan attendance otomatis
          </p>
        </div>
      </div>

      {/* Employee Info Card */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {isLoading ? (
            <>
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
            </>
          ) : (
            <>
              {empData?.photo_url && (
                <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
                  <img
                    src={empData.photo_url}
                    alt={empData.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Nama</p>
                <p className="font-semibold">{empData?.full_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Kode</p>
                  <p className="text-sm font-medium">
                    {empData?.employee_code}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tipe</p>
                  <p className="text-sm font-medium">
                    {empData?.department
                      ? "Departemen"
                      : empData?.site
                        ? "Site"
                        : "-"}
                  </p>
                </div>
              </div>
              {empData?.department && (
                <div>
                  <p className="text-xs text-muted-foreground">Departemen</p>
                  <p className="text-sm font-medium">
                    {empData.department?.name}
                  </p>
                </div>
              )}
              {empData?.site && (
                <div>
                  <p className="text-xs text-muted-foreground">Site</p>
                  <p className="text-sm font-medium">{empData.site?.name}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* QR Code Card */}
      <Card>
        <CardContent className="p-6 flex flex-col items-center gap-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              QR Code Attendance
            </p>
            <p className="text-xs text-muted-foreground">
              Berisi: Employee ID + Type
            </p>
          </div>

          {isLoading ? (
            <Skeleton className="w-64 h-64 rounded-xl" />
          ) : qrImg ? (
            <div className="rounded-xl border border-border overflow-hidden">
              <img src={qrImg} alt="Employee QR Code" className="w-64 h-64" />
            </div>
          ) : (
            <div className="w-64 h-64 bg-muted rounded-xl flex items-center justify-center">
              <p className="text-sm text-muted-foreground">QR tidak tersedia</p>
            </div>
          )}

          {/* QR Data Info */}
          {qrData && (
            <div className="w-full bg-muted p-4 rounded-lg text-xs space-y-1">
              <div>
                <p className="text-muted-foreground">Employee ID</p>
                <p className="font-mono font-medium">
                  {qrData.qr_data?.employee_id}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-mono font-medium">{qrData.qr_data?.type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Timestamp</p>
                <p className="font-mono font-medium text-[10px]">
                  {qrData.qr_data?.timestamp}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => regenerateMutation.mutate()}
          disabled={regenerateMutation.isPending || isLoading}
        >
          {regenerateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Membuat Ulang...
            </>
          ) : (
            <>Buat Ulang QR Code</>
          )}
        </Button>
        <Button
          className="w-full"
          onClick={handleDownloadQr}
          disabled={!qrImg || isLoading}
        >
          <Download className="w-4 h-4 mr-2" />
          Unduh QR Code
        </Button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg text-sm text-blue-900 dark:text-blue-100 space-y-2">
        <p className="font-semibold">ℹ️ Cara Menggunakan:</p>
        <ul className="space-y-1 ml-4 list-disc text-xs">
          <li>Unduh atau tampilkan QR code ini</li>
          <li>Gunakan app scanner untuk scan attendance</li>
          <li>QR otomatis terdeteksi dan record absensi</li>
          <li>Setiap employee memiliki QR code unik</li>
        </ul>
      </div>
    </div>
  );
}
