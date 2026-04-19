/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from "react";
import QrScannerLib from "qr-scanner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Loader2, AlertTriangle, Camera } from "lucide-react";
import { toast } from "sonner";
import { attendanceApi } from "@/lib/api";
import { offlineQueue } from "@/lib/offlineQueue";
import { attendanceKeys } from "@/hooks/useAttendance";

interface QrPayload {
  employee_id: number;
  type: "department" | "site";
  timestamp?: number;
}

type ScanStatus = "idle" | "scanning" | "success" | "error" | "warning";

interface ScanResult {
  status: ScanStatus;
  message: string;
  data?: any;
  type?: string;
  employeeType?: string;
  retryable?: boolean;
}

export function QrScanner() {
  // ── Refs ───────────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScannerLib | null>(null);
  const queryClient = useQueryClient();

  // ── State ───────────────────────────────────────────────────
  const [isShowingCamera, setIsShowingCamera] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const gpsDataRef = useRef<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);

  // ── Mutations ──────────────────────────────────────────────
  // Token-based QR scan (dari QR Display - butuh login)
  const tokenBasedScanMutation = useMutation({
    mutationFn: (data: object) => attendanceApi.processQrScan(data),
    onSuccess: (data) => {
      toast.dismiss();
      toast.success(`✅ ${data.message}`);
      // Invalidate attendance queries to refresh dashboard immediately
      queryClient.invalidateQueries({ queryKey: attendanceKeys.today() });
      // Also invalidate history to ensure updated data appears in reports
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      setScanResult({
        status: "success",
        message: data.message,
        data,
        type: data.data.scan_type,
      });
      setTimeout(() => {
        setScanResult(null);
        setIsShowingCamera(false);
      }, 2000);
    },
    onError: (err: any) => {
      toast.dismiss();
      handleScanError(err);
    },
  });

  // Employee-ID-based QR scan (Employee QR page - standalone)
  const unifiedScanMutation = useMutation({
    mutationFn: attendanceApi.processUnifiedQrScan,
    onSuccess: (data) => {
      toast.dismiss();
      toast.success(`✅ ${data.message}`);
      // Invalidate attendance queries to refresh dashboard immediately
      queryClient.invalidateQueries({ queryKey: attendanceKeys.today() });
      // Also invalidate history to ensure updated data appears in reports
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      setScanResult({
        status: "success",
        message: data.message,
        data,
        type: data.data.scan_type,
        employeeType: data.data.device_info?.employee_type,
      });
      setTimeout(() => {
        setScanResult(null);
        setIsShowingCamera(false);
      }, 2000);
    },
    onError: (err: any) => {
      toast.dismiss();
      handleScanError(err);
    },
  });

  // ── Error Handler ───────────────────────────────────────────
  const handleScanError = (err: any) => {
    let message = "Scan gagal";

    if (err.response?.status === 400 && err.response?.data?.errors) {
      console.error("❌ Validation errors:", err.response.data.errors);
      const errors = err.response.data.errors as Record<string, string[]>;
      const errorValues = Object.values(errors);
      message = (errorValues[0] as string[])?.[0] ?? "Data tidak valid";
    } else if (err.response?.status === 422 && err.response?.data?.errors) {
      console.error("❌ Validation errors:", err.response.data.errors);
      const errors = err.response.data.errors as Record<string, string[]>;
      const errorValues = Object.values(errors);
      message = (errorValues[0] as string[])?.[0] ?? "Data tidak valid";
    } else {
      message = err.response?.data?.message ?? message;
    }

    console.error("❌ Full scan error response:", {
      status: err.response?.status,
      data: err.response?.data,
      message,
    });

    toast.error(`❌ ${message}`);
    setScanResult({
      status: "error",
      message,
      retryable: true,
    });
  };

  // ── QR Type Detection ───────────────────────────────────────
  const isTokenBasedQr = (qrContent: string): boolean => {
    // Token-based: exactly 64 chars, alphanumeric only (random)
    if (qrContent.length === 64 && /^[a-zA-Z0-9]+$/.test(qrContent)) {
      console.log("📨 Detected TOKEN-BASED QR");
      return true;
    }

    // Employee-id based: contains employee_id field
    if (qrContent.includes("employee_id")) {
      console.log("👤 Detected EMPLOYEE-ID QR");
      return false;
    }

    // Try parsing as JSON/base64 to determine
    try {
      const decoded = atob(qrContent);
      if (decoded && decoded.includes("employee_id")) {
        console.log("👤 Detected EMPLOYEE-ID QR (base64)");
        return false;
      }
    } catch {
      // Continue
    }

    // Default: assume token-based if ambiguous (random 64 chars)
    return qrContent.length === 64;
  };

  // ── QR Parsing ─────────────────────────────────────────────
  const parseQrPayload = (qrData: string): QrPayload | null => {
    console.log("🔍 Raw QR Data:", qrData);
    console.log("📊 QR Data Type:", typeof qrData, "Length:", qrData.length);

    try {
      let json = qrData;
      try {
        const decoded = atob(qrData);
        console.log("🔓 Base64 decoded:", decoded);
        if (decoded && decoded.includes("employee_id")) {
          json = decoded;
          console.log("✅ Using base64 decoded data");
        }
      } catch {
        // Not base64, continue
        console.log("⏭️ Not base64, using original data");
      }

      let payload;
      try {
        payload = JSON.parse(json);
        console.log("✅ JSON parsed:", payload);
      } catch (_error) {
        console.log("❌ JSON parse failed:", (_error as Error).message);
        if (json.includes("=") && json.includes("&")) {
          const params = new URLSearchParams(json);
          payload = {
            employee_id: parseInt(params.get("employee_id") || "0"),
            type: params.get("type"),
          };
          console.log("✅ Parsed from URL params:", payload);
        } else {
          console.log("❌ Not URL params, not JSON, giving up");
          return null;
        }
      }

      console.log("📋 Payload:", payload);

      if (!payload.employee_id || !payload.type) {
        console.log(
          "❌ Missing required fields - employee_id:",
          payload.employee_id,
          "type:",
          payload.type,
        );
        return null;
      }

      const normalizedType = String(payload.type).toLowerCase();
      console.log("🎯 Normalized type:", normalizedType);

      if (!["department", "site", "dept", "project"].includes(normalizedType)) {
        console.log("❌ Invalid type value:", normalizedType);
        return null;
      }

      const finalPayload = {
        ...payload,
        type: normalizedType.includes("dept")
          ? "department"
          : normalizedType.includes("site")
            ? "site"
            : (normalizedType as any),
      };

      console.log("✅ Final payload:", finalPayload);
      return finalPayload;
    } catch (_error) {
      console.error(
        "❌ Parsing error:",
        _error instanceof Error ? _error.message : String(_error),
      );
      return null;
    }
  };

  // ── Open Camera ────────────────────────────────────────────
  const openCamera = useCallback(async () => {
    try {
      toast.loading("📷 Membuka kamera...");
      setIsInitializing(true);
      // Just trigger camera UI to show - scanner will be created in useEffect
      setIsShowingCamera(true);
    } catch (error: any) {
      console.error("❌ Camera error:", error);
      toast.dismiss();
      toast.error(`❌ Gagal membuka kamera: ${error.message}`);
      setIsInitializing(false);
      setIsShowingCamera(false);
    }
  }, []);

  // ── Close Camera ───────────────────────────────────────────
  const closeCamera = useCallback(async () => {
    if (qrScannerRef.current) {
      await qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsShowingCamera(false);
    setScanResult(null);
  }, []);

  // ── Manual Capture & Scan ────────────────────────────────────────────
  const captureAndScan = useCallback(async () => {
    if (!videoRef.current || !qrScannerRef.current) {
      toast.error("❌ Kamera tidak siap");
      return;
    }

    try {
      setIsScanning(true);
      toast.loading("📸 Mengambil & Scan gambar...");

      // Capture frame from video to canvas - UPSCALE for better detection
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context failed");

      const scale = 2; // Upscale 2x untuk better QR detection
      canvas.width = videoRef.current.videoWidth * scale;
      canvas.height = videoRef.current.videoHeight * scale;
      ctx.scale(scale, scale);
      ctx.drawImage(videoRef.current, 0, 0);

      console.log(
        `📷 Captured canvas: ${canvas.width}x${canvas.height} (scaled 2x)`,
      );

      // Convert canvas to blob and scan
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            toast.error("❌ Gagal capture gambar");
            setIsScanning(false);
            return;
          }

          let imageUrl: string | null = null;
          try {
            // Use qr-scanner to scan the captured image
            imageUrl = URL.createObjectURL(blob);
            console.log("🔍 Scanning captured image...");

            // Try with different scan methods/options
            const result = await QrScannerLib.scanImage(
              imageUrl,
              undefined,
              undefined,
              undefined,
              false,
              true,
            );

            console.log("✅ QR Result:", result);
            toast.dismiss();
            toast.success("✅ QR code terdeteksi!");

            // Determine QR type
            const isToken = isTokenBasedQr(result);

            // For token-based: validate length, no need to parse
            // For employee-based: parse JSON payload
            if (!isToken) {
              const payload = parseQrPayload(result);
              if (!payload) {
                toast.error("❌ Format QR tidak valid");
                setScanResult({
                  status: "error",
                  message: "QR code tidak valid atau rusak",
                  retryable: true,
                });
                setIsScanning(false);
                if (imageUrl) URL.revokeObjectURL(imageUrl);
                return;
              }
            }

            // Prepare scan data
            const gps = gpsDataRef.current || {
              latitude: 0,
              longitude: 0,
              accuracy: 0,
            };

            const gpsData = gps;
            const deviceInfo = {
              user_agent: navigator.userAgent,
              model: navigator.platform,
            };

            // Different payload for token-based vs employee-based
            const scanData = isToken
              ? {
                  session_token: result, // ✅ Token-based: use session_token
                  gps: gpsDataRef.current || undefined, // ✅ GPS optional for token-based
                  device_info: deviceInfo,
                }
              : {
                  qr_data: result, // ✅ Employee-based: use qr_data
                  gps: gpsData, // GPS required for employee-based
                  device_info: deviceInfo,
                };

            // Log the exact data being sent
            console.log(
              `📤 Sending ${isToken ? "TOKEN-BASED" : "EMPLOYEE-ID"} scan data:`,
              JSON.stringify(scanData, null, 2),
            );

            // Submit to API
            toast.loading("💾 Menyimpan absensi...");
            if (!navigator.onLine) {
              await offlineQueue.enqueue("unified_qr_scan", scanData);
              toast.dismiss();
              toast.success("📱 Offline: akan disinkronkan nanti");
              setScanResult({
                status: "success",
                message: "Offline: akan disinkronkan nanti",
                type: "check_in",
              });
            } else {
              // Use correct mutation based on QR type
              if (isToken) {
                tokenBasedScanMutation.mutate(scanData);
              } else {
                unifiedScanMutation.mutate(scanData);
              }
            }
            setIsScanning(false);
          } catch (error: any) {
            console.error("❌ Scan error details:", {
              message: error.message,
              code: error.code,
              toString: error.toString(),
            });
            toast.dismiss();
            const errMsg = error.message || String(error);
            if (
              errMsg.includes("No barcode") ||
              errMsg.includes("not found") ||
              errMsg.includes("Could not infer image")
            ) {
              toast.error("❌ QR code tidak terdeteksi. Coba lagi!");
              setScanResult({
                status: "error",
                message: "QR code tidak terdeteksi. Coba positioning ulang.",
                retryable: true,
              });
            } else {
              toast.error(`❌ Error: ${errMsg}`);
              setScanResult({
                status: "error",
                message: errMsg,
                retryable: true,
              });
            }
            setIsScanning(false);
          } finally {
            if (imageUrl) {
              URL.revokeObjectURL(imageUrl);
            }
          }
        },
        "image/jpeg",
        0.95,
      ); // Use JPEG for better compression
    } catch (error: any) {
      console.error("❌ Capture error:", error);
      toast.dismiss();
      toast.error(`❌ Error: ${error.message}`);
      setIsScanning(false);
    }
  }, [unifiedScanMutation, tokenBasedScanMutation]);

  // ── Cleanup on unmount ────────────────────────────────────
  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  // ── Initialize Scanner when Camera is shown ────────────────────────────────────
  useEffect(() => {
    if (!isShowingCamera || !isInitializing || !videoRef.current) {
      return;
    }

    let isMounted = true;

    const initScanner = async () => {
      try {
        console.log("🚀 Initializing QrScanner...");
        // Create QrScanner instance
        const scanner = new QrScannerLib(
          videoRef.current!,
          async (result: any) => {
            // Auto scan on frame - parse and submit immediately
            console.log("✅ QR Auto-Detected:", result.data);

            // Stop scanner during processing
            await scanner.stop();
            toast.dismiss();
            toast.success("✅ QR code terdeteksi!");

            // Determine QR type
            const isToken = isTokenBasedQr(result.data);

            // For token-based: validate length, no need to parse
            // For employee-based: parse JSON payload
            if (!isToken) {
              const payload = parseQrPayload(result.data);
              if (!payload) {
                toast.error("❌ Format QR tidak valid");
                setScanResult({
                  status: "error",
                  message: "QR code tidak valid atau rusak",
                  retryable: true,
                });
                setIsScanning(true);
                setTimeout(() => {
                  scanner.start();
                  setIsScanning(false);
                }, 1000);
                return;
              }
            }

            setIsScanning(true);

            // Prepare scan data
            const gps = gpsDataRef.current || {
              latitude: 0,
              longitude: 0,
              accuracy: 0,
            };

            const gpsData = gps;
            const deviceInfo = {
              user_agent: navigator.userAgent,
              model: navigator.platform,
            };

            // Different payload for token-based vs employee-based
            const scanData = isToken
              ? {
                  session_token: result.data, // ✅ Token-based: use session_token
                  gps: gpsDataRef.current || undefined, // ✅ GPS optional for token-based
                  device_info: deviceInfo,
                }
              : {
                  qr_data: result.data, // ✅ Employee-based: use qr_data
                  gps: gpsData, // GPS required for employee-based
                  device_info: deviceInfo,
                };

            // Log the exact data being sent
            console.log(
              `📤 Sending ${isToken ? "TOKEN-BASED" : "EMPLOYEE-ID"} scan data:`,
              JSON.stringify(scanData, null, 2),
            );

            // Submit to API
            toast.loading("💾 Menyimpan absensi...");
            if (!navigator.onLine) {
              await offlineQueue.enqueue("unified_qr_scan", scanData);
              toast.dismiss();
              toast.success("📱 Offline: akan disinkronkan nanti");
              setScanResult({
                status: "success",
                message: "Offline: akan disinkronkan nanti",
                type: "check_in",
              });
              setTimeout(() => {
                scanner.start();
                setIsScanning(false);
              }, 1000);
            } else {
              // Use correct mutation based on QR type
              if (isToken) {
                tokenBasedScanMutation.mutate(scanData);
              } else {
                unifiedScanMutation.mutate(scanData);
              }
              setTimeout(() => {
                scanner.start();
                setIsScanning(false);
              }, 1000);
            }
          },
          {
            onDecodeError: () => {
              // Silently ignore decode errors
            },
            maxScansPerSecond: 20, // Increased from 10 - scan more frequently
            highlightScanRegion: true,
            highlightCodeOutline: true,
          },
        );

        if (!isMounted) {
          scanner.destroy();
          return;
        }

        qrScannerRef.current = scanner;
        await scanner.start();
        console.log("✅ QrScanner started successfully");
        toast.dismiss();
        toast.success("✅ Kamera siap. Arahkan ke QR code");
        setIsInitializing(false);
      } catch (error: any) {
        console.error("❌ Scanner init error:", error);
        if (isMounted) {
          toast.dismiss();
          toast.error(`❌ Gagal membuka kamera: ${error.message}`);
          setIsShowingCamera(false);
          setIsInitializing(false);
        }
      }
    };

    initScanner();

    return () => {
      isMounted = false;
    };
  }, [
    isShowingCamera,
    isInitializing,
    unifiedScanMutation,
    tokenBasedScanMutation,
  ]);

  // ── Cleanup on unmount ────────────────────────────────────
  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
    };
  }, []);

  // ── UI Helpers ────────────────────────────────────────────
  const getResultIcon = () => {
    switch (scanResult?.status) {
      case "success":
        return <CheckCircle className="w-16 h-16 text-white" />;
      case "error":
        return <AlertTriangle className="w-16 h-16 text-red-300" />;
      default:
        return null;
    }
  };

  const getResultBgColor = () => {
    switch (scanResult?.status) {
      case "success":
        return "bg-green-500/80";
      case "error":
        return "bg-red-500/80";
      default:
        return "";
    }
  };

  const isLoading = unifiedScanMutation.isPending || isScanning;

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Camera Preview */}
      {isShowingCamera ? (
        <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-black border-2 border-gray-300">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />

          {/* Scan Frame Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 rounded-lg border-2 border-yellow-400 border-opacity-70 shadow-lg" />
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
                <p className="text-white text-sm font-medium">Memproses...</p>
              </div>
            </div>
          )}

          {/* Result Overlay */}
          {scanResult && !isLoading && (
            <div
              className={`absolute inset-0 ${getResultBgColor()} flex flex-col items-center justify-center transition-all duration-300`}
            >
              {getResultIcon()}
              <p className="text-white font-bold text-lg mt-3 text-center px-4">
                {scanResult.message}
              </p>
              {scanResult.type && (
                <p className="text-white/90 text-sm mt-2">
                  {scanResult.type === "check_in"
                    ? "✓ Check In Berhasil"
                    : "✓ Check Out Berhasil"}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-linear-to-br from-gray-900 to-black border-2 border-gray-300 flex flex-col items-center justify-center gap-4 p-4">
          <Camera className="w-16 h-16 text-gray-400" />
          <p className="text-gray-400 text-center text-sm">
            Tekan tombol "Buka Kamera" untuk mulai scan QR code
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="w-full max-w-sm flex gap-2 flex-wrap justify-center">
        {!isShowingCamera ? (
          <Button
            onClick={openCamera}
            disabled={isLoading}
            className="flex-1 py-6 text-lg font-semibold"
          >
            <Camera className="w-5 h-5 mr-2" />
            Buka Kamera
          </Button>
        ) : (
          <>
            <Button
              onClick={captureAndScan}
              disabled={isLoading}
              className="flex-1 py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
            >
              <Camera className="w-5 h-5 mr-2" />
              Ambil & Scan
            </Button>
            <Button
              onClick={closeCamera}
              disabled={isLoading}
              variant="outline"
              className="flex-1 py-6 text-lg font-semibold"
            >
              Tutup
            </Button>
          </>
        )}
      </div>

      {/* Alerts */}
      {scanResult?.status === "error" && (
        <Alert variant="destructive" className="w-full max-w-sm">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <div className="font-semibold">{scanResult.message}</div>
            {scanResult.retryable && (
              <div className="mt-2 text-[11px] opacity-90">
                💡 <strong>Tips:</strong>
                <br />
                • Arahkan kamera ke QR code dengan jelas
                <br />
                • Pastikan pencahayaan cukup baik
                <br />• QR code akan otomatis terdeteksi
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {!isShowingCamera && !scanResult?.status && (
        <Alert className="w-full max-w-sm">
          <AlertDescription className="text-sm">
            <strong>📋 Panduan:</strong>
            <br />
            ✓ Klik "Buka Kamera"
            <br />
            ✓ Izinkan akses kamera
            <br />
            ✓ Arahkan ke QR code
            <br />✓ QR akan auto-scan otomatis
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
