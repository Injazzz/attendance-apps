import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { attendanceApi } from "@/lib/api";

interface TestResult {
  status: "idle" | "loading" | "success" | "error";
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  timestamp?: string;
}

interface GPSCoord {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export function QrDebugger() {
  const [employeeId, setEmployeeId] = useState<string>("1");
  const [employeeType, setEmployeeType] = useState<"department" | "site">(
    "department",
  );
  const [gpsLocation, setGpsLocation] = useState<
    "jakarta" | "bandung" | "custom"
  >("jakarta");
  const [customLat, setCustomLat] = useState<string>("-6.1753");
  const [customLng, setCustomLng] = useState<string>("106.8272");
  const [testResult, setTestResult] = useState<TestResult>({
    status: "idle",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  // Predefined GPS locations for quick testing
  const GPS_LOCATIONS: Record<string, GPSCoord> = {
    jakarta: {
      latitude: -6.1753,
      longitude: 106.8272,
      accuracy: 10,
    },
    bandung: {
      latitude: -6.9175,
      longitude: 107.6025,
      accuracy: 10,
    },
  };

  const getGpsData = (): GPSCoord => {
    if (gpsLocation === "custom") {
      return {
        latitude: parseFloat(customLat),
        longitude: parseFloat(customLng),
        accuracy: 10,
      };
    }
    return GPS_LOCATIONS[gpsLocation];
  };

  const handleTestScan = async () => {
    setLoading(true);
    setTestResult({ status: "loading", message: "Processing QR scan..." });

    try {
      const payload = {
        employee_id: parseInt(employeeId),
        type: employeeType,
        timestamp: Math.floor(Date.now() / 1000),
      };

      const qrData = JSON.stringify(payload);
      const gpsData = getGpsData();

      console.log("🔍 QR Payload:", payload);
      console.log("📍 GPS Data:", gpsData);

      const result = await attendanceApi.processUnifiedQrScan({
        qr_data: qrData,
        gps: gpsData,
        device_info: {
          user_agent: navigator.userAgent,
          model: navigator.platform,
        },
      });

      setTestResult({
        status: "success",
        message: result.message,
        data: result.data,
        timestamp: new Date().toLocaleTimeString(),
      });
      toast.success(`✓ ${result.message}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Scan failed";
      setTestResult({
        status: "error",
        message: errorMessage,
        data: error.response?.data,
        timestamp: new Date().toLocaleTimeString(),
      });
      toast.error(`✗ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getResultIcon = () => {
    switch (testResult.status) {
      case "success":
        return <Check className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "loading":
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return null;
    }
  };

  const getResultColor = () => {
    switch (testResult.status) {
      case "success":
        return "border-green-200 bg-green-50";
      case "error":
        return "border-red-200 bg-red-50";
      case "loading":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-2 border-dashed text-black border-orange-400 bg-orange-50">
      <CardHeader className="bg-orange-100">
        <CardTitle className="flex items-center gap-2 text-orange-900">
          🧪 QR Scanner Debugger
          <span className="text-xs font-normal text-orange-700 ml-auto">
            Dev Only
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5 pt-6">
        {/* Employee ID */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Employee ID
          </label>
          <Input
            type="number"
            min="1"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="Enter employee ID"
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            Gunakan ID karyawan yang sudah ada di database
          </p>
        </div>

        {/* Employee Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Employee Type
          </label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="department"
                checked={employeeType === "department"}
                onChange={(e) =>
                  setEmployeeType(e.target.value as "department")
                }
              />
              <span className="text-sm">Department</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="site"
                checked={employeeType === "site"}
                onChange={(e) => setEmployeeType(e.target.value as "site")}
              />
              <span className="text-sm">Site</span>
            </label>
          </div>
          <p className="text-xs text-gray-500">
            Pilih sesuai tipe karyawan di database
          </p>
        </div>

        {/* GPS Location */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            📍 GPS Location
          </label>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setGpsLocation("jakarta")}
              className={`px-3 py-2 rounded text-xs font-medium transition ${
                gpsLocation === "jakarta"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Jakarta
            </button>
            <button
              onClick={() => setGpsLocation("bandung")}
              className={`px-3 py-2 rounded text-xs font-medium transition ${
                gpsLocation === "bandung"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Bandung
            </button>
            <button
              onClick={() => setGpsLocation("custom")}
              className={`px-3 py-2 rounded text-xs font-medium transition ${
                gpsLocation === "custom"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Custom
            </button>
          </div>

          {gpsLocation === "custom" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600">Latitude</label>
                <Input
                  type="number"
                  step="0.0001"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  placeholder="-6.1753"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Longitude</label>
                <Input
                  type="number"
                  step="0.0001"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  placeholder="106.8272"
                />
              </div>
            </div>
          )}

          {gpsLocation !== "custom" && (
            <p className="text-xs text-gray-500">
              {gpsLocation === "jakarta" && "Jakarta: -6.1753, 106.8272"}
              {gpsLocation === "bandung" && "Bandung: -6.9175, 107.6025"}
            </p>
          )}
        </div>

        {/* Test Result */}
        {testResult.status !== "idle" && (
          <Alert
            className={`border-2 ${getResultColor()} ${
              testResult.status === "loading" ? "animate-pulse" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              {getResultIcon()}
              <div className="flex-1">
                <p className="font-medium text-sm">{testResult.message}</p>
                {testResult.timestamp && (
                  <p className="text-xs text-gray-500 mt-1">
                    {testResult.timestamp}
                  </p>
                )}
                {testResult.data && testResult.status === "success" && (
                  <div className="mt-2 text-xs bg-white/50 p-2 rounded border border-green-200">
                    <p className="font-mono text-green-800">
                      ✓ Scan Type: {testResult.data.scan_type}
                    </p>
                    {testResult.data.message && (
                      <p className="font-mono text-green-800">
                        Message: {testResult.data.message}
                      </p>
                    )}
                  </div>
                )}
                {testResult.data && testResult.status === "error" && (
                  <div className="mt-2 text-xs bg-white/50 p-2 rounded border border-red-200">
                    <pre className="text-red-700 whitespace-pre-wrap font-mono text-xs">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleTestScan}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>📱 Simulate QR Scan</>
            )}
          </Button>

          <Button
            onClick={() => {
              setTestResult({ status: "idle", message: "" });
              setEmployeeId("1");
              setEmployeeType("department");
              setGpsLocation("jakarta");
            }}
            variant="outline"
            className="flex-1"
          >
            🔄 Reset
          </Button>
        </div>

        {/* Help Text */}
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            📚 How to Use:
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>✓ Set Employee ID sesuai data di database</li>
            <li>✓ Pilih Employee Type (department/site)</li>
            <li>✓ Pilih lokasi GPS atau gunakan custom</li>
            <li>✓ Klik "Simulate QR Scan" untuk test</li>
            <li>✓ Lihat response dan error messages</li>
          </ul>
        </div>

        {/* Console Info */}
        <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs">
          <p className="text-gray-500">
            💻 Open DevTools Console (F12) untuk melihat request details
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
