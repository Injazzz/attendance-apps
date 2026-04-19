import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { getDeviceFingerprint, getDeviceInfo } from "@/lib/deviceFingerprint";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (creds: { username: string; password: string }) => {
      const fingerprint = await getDeviceFingerprint();
      const deviceInfo = getDeviceInfo();
      return {
        fingerprint,
        response: await authApi.login({
          ...creds,
          device_fingerprint: fingerprint,
          device_info: deviceInfo,
        }),
      };
    },
    onSuccess: ({ fingerprint, response }) => {
      const { data } = response;
      setAuth(data.token, data.browser_token, fingerprint, data.user);
      toast.success(`Selamat datang, ${data.user.employee.full_name}!`);
      navigate("/dashboard");
    },
  });
}
