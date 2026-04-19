import { QrScanner } from "@/components/attendance/QrScanner";
// import { QrDebugger } from "@/components/debug/QrDebugger";
import { QrCode } from "lucide-react";

/**
 * Unified Attendance Page
 * All employees use QR scanning (no more selfie-based attendance)
 * QR contains employee_id and type (department|site)
 */
export default function AttendancePage() {
  const isDev = import.meta.env.DEV;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Absensi</h1>
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <QrCode className="w-5 h-5 text-blue-600" />
        <p className="text-sm text-blue-700">
          Semua karyawan menggunakan pemindaian QR untuk absensi
        </p>
      </div>

      {/* QR Debugger - Development Only */}
      {/* {isDev && (
        <div className="mt-6">
          <QrDebugger />
        </div>
      )} */}

      {/* QR Scanner */}
      <div className={isDev ? "mt-6" : ""}>
        <QrScanner />
      </div>
    </div>
  );
}
