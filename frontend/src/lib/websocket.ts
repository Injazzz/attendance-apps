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
    // Determine ports based on environment
    const isProduction = import.meta.env.PROD;
    const wsPort =
      (import.meta.env.VITE_REVERB_PORT as unknown as number) ?? 8080;
    const wssPort = isProduction
      ? 443
      : ((import.meta.env.VITE_REVERB_PORT as unknown as number) ?? 443);

    echo = new Echo({
      broadcaster: "reverb",
      key: reverbKey,
      wsHost: reverbHost,
      wsPort: wsPort,
      wssPort: wssPort,
      forceTLS: isProduction,
      enabledTransports: isProduction ? ["wss"] : ["ws"],
      authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Browser-Token": browserToken || "",
        },
      },
    });
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
