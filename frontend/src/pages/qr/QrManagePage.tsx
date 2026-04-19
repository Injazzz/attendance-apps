import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qrApi } from "@/lib/api";
import { subscribeToQrDisplay } from "@/lib/websocket";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function QrDisplayManagePage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [qrImg, setQrImg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["qr-session", "current", id],
    queryFn: () => qrApi.getCurrentSession(Number(id)),
    refetchOnWindowFocus: false,
  });

  // Set QR image dari data awal
  useEffect(() => {
    if (data?.data?.qr_image) setQrImg(data.data.qr_image);
  }, [data]);

  // Countdown timer
  useEffect(() => {
    if (!data?.data?.session?.valid_to) return;
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor(
          (new Date(data.data.session.valid_to).getTime() - Date.now()) / 1000,
        ),
      );
      setCountdown(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [data]);

  // Subscribe WebSocket — auto-update saat QR rotate
  useEffect(() => {
    if (!id) return;
    const unsub = subscribeToQrDisplay(Number(id), (payload) => {
      setQrImg(
        payload.qr_image ? `data:image/png;base64,${payload.qr_image}` : null,
      );
      qc.invalidateQueries({ queryKey: ["qr-session", "current", id] });
      toast.info("QR Code telah diperbarui otomatis");
    });
    return () => {
      unsub?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const regenerateMutation = useMutation({
    mutationFn: () => qrApi.generateSession(Number(id)),
    onSuccess: (res) => {
      setQrImg(res.data.qr_image);
      qc.invalidateQueries({ queryKey: ["qr-session", "current", id] });
      toast.success("QR baru berhasil dibuat");
    },
    onError: () => toast.error("Gagal generate QR"),
  });

  const display = data?.data?.display;
  const session = data?.data?.session;

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {display?.display_name ?? "QR Display"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {display?.location ?? "-"}
          </p>
        </div>
        <Badge variant={session?.is_valid ? "default" : "destructive"}>
          {session?.is_valid ? "Aktif" : "Expired"}
        </Badge>
      </div>

      <Card>
        <CardContent className="p-6 flex flex-col items-center gap-4">
          {isLoading ? (
            <Skeleton className="w-64 h-64 rounded-xl" />
          ) : qrImg ? (
            <img src={qrImg} alt="QR Code" className="w-64 h-64 rounded-xl" />
          ) : (
            <div className="w-64 h-64 bg-muted rounded-xl flex items-center justify-center">
              <p className="text-sm text-muted-foreground">QR tidak tersedia</p>
            </div>
          )}

          {countdown > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Ganti dalam {countdown} detik</span>
            </div>
          )}

          <div className="text-xs text-center text-muted-foreground">
            <p>
              Tipe:{" "}
              <span className="font-medium">
                {session?.qr_type === "check_in" ? "Check In" : "Check Out"}
              </span>
            </p>
            <p>
              Scan:{" "}
              <span className="font-medium">
                {session?.current_scans ?? 0}x
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => regenerateMutation.mutate()}
        disabled={regenerateMutation.isPending}
      >
        {regenerateMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Membuat QR Baru...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate QR Baru
          </>
        )}
      </Button>
    </div>
  );
}
