/* eslint-disable @typescript-eslint/no-explicit-any */
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { useAuthStore } from "@/stores/authStore";
import { queryClient } from "@/lib/queryClient";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

// Type definitions
interface NotificationPayload {
  title: string;
  message: string;
  notification_type?: string;
  data?: Record<string, unknown>;
  action_url?: string;
}

type EchoInstance = Echo<any> | null;

window.Pusher = Pusher;

let echo: EchoInstance = null;

export function initWebSocket(): EchoInstance {
  // Return existing instance if already initialized
  if (echo !== null) return echo;

  const { token, browserToken } = useAuthStore.getState();

  // Check if Reverb is configured
  const reverbKey = import.meta.env.VITE_REVERB_APP_KEY;
  const reverbHost = import.meta.env.VITE_REVERB_HOST;

  if (!reverbKey || !reverbHost) {
    console.debug("Broadcasting not configured. WebSocket disabled.");
    return null;
  }

  if (!token) {
    console.debug("No auth token available. WebSocket initialization skipped.");
    return null;
  }

  try {
    // Determine connection settings based on environment
    const isProduction = import.meta.env.PROD;
    const reverbPort =
      (import.meta.env.VITE_REVERB_PORT as unknown as number) ?? 8080;

    // In production: use WSS on port 443 (HTTPS)
    // In development: use WS on port 8080 (HTTP)
    const echoConfig = {
      broadcaster: "reverb" as const,
      key: reverbKey,
      wsHost: reverbHost,
      wsPort: isProduction ? 443 : reverbPort,
      wssPort: isProduction ? 443 : reverbPort,
      forceTLS: isProduction,
      enabledTransports: (isProduction
        ? ["wss"]
        : ["ws"]) as unknown as string[],
      authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Browser-Token": browserToken || "",
        },
      },
    };

    console.debug("[WebSocket] Initializing Echo with config:", {
      environment: isProduction ? "production" : "development",
      host: reverbHost,
      port: echoConfig.wsPort,
      forceTLS: echoConfig.forceTLS,
      transports: echoConfig.enabledTransports,
    });

    echo = new Echo(echoConfig as any);
  } catch (error) {
    console.warn("Failed to initialize WebSocket:", error);
    echo = null;
  }

  return echo;
}

export function subscribeToNotifications(userId: number): void {
  const echoInstance = initWebSocket();

  if (!echoInstance) {
    console.debug("WebSocket unavailable, skipping notification subscription");
    return;
  }

  try {
    echoInstance
      .private(`App.Models.User.${userId}`)
      .notification((notification: NotificationPayload) => {
        // Show push notification via Notification API
        if (Notification.permission === "granted") {
          new Notification(notification.title, {
            body: notification.message,
            icon: "/icons/icon-192.png",
            badge: "/icons/badge-72.png",
            tag: "notification",
          });
        }

        // Invalidate notifications query to refresh cache
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      });
  } catch (error) {
    console.warn("Failed to subscribe to notifications:", error);
  }
}

export function subscribeToQrDisplay(
  displayId: number,
  onRotate: (data: any) => void,
): () => void {
  const echoInstance = initWebSocket();

  const channelName = `qr-display.${displayId}`;

  const channel = echoInstance?.channel(channelName);

  channel.listen(".qr.rotated", (data: any) => {
    onRotate(data);
  });

  // ✅ RETURN unsubscribe function
  return () => {
    echoInstance?.leave(channelName);
  };
}

export function disconnectWebSocket() {
  echo?.disconnect();
  echo = null;
}
