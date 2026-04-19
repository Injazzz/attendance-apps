/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { set, get, del, keys } from "idb-keyval";

interface PendingAction {
  id: string;
  type: "unified_qr_scan" | "qr_scan";
  payload: object;
  timestamp: number;
  retries: number;
}

export const offlineQueue = {
  async enqueue(type: PendingAction["type"], payload: object): Promise<string> {
    const id = `offline_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await set(id, {
      id,
      type,
      payload,
      timestamp: Date.now(),
      retries: 0,
    } as PendingAction);
    return id;
  },

  async getAll(): Promise<PendingAction[]> {
    const allKeys = await keys();
    const offlineKeys = allKeys.filter((k) => String(k).startsWith("offline_"));
    const items = await Promise.all(
      offlineKeys.map((k) => get<PendingAction>(k)),
    );
    return items.filter(Boolean) as PendingAction[];
  },

  async remove(id: string): Promise<void> {
    await del(id);
  },

  async processQueue(apiClient: any): Promise<void> {
    if (!navigator.onLine) return;

    const items = await this.getAll();
    for (const item of items) {
      try {
        if (item.type === "unified_qr_scan") {
          // Unified QR scan with embedded employee_id and type
          await apiClient.processUnifiedQrScan(item.payload);
        } else if (item.type === "qr_scan") {
          // Legacy backward compatibility
          await apiClient.processQrScan(item.payload);
        }
        await this.remove(item.id);
        console.log(`✅ Offline action synced: ${item.id}`);
      } catch (err) {
        // Increment retry, max 3x
        if (item.retries >= 3) {
          await this.remove(item.id);
          console.warn(`❌ Max retries reached for ${item.id}`);
        } else {
          await set(item.id, { ...item, retries: item.retries + 1 });
        }
      }
    }
  },
};

// Auto-sync saat online kembali
window.addEventListener("online", () => {
  import("./api").then(({ attendanceApi }) => {
    offlineQueue.processQueue(attendanceApi);
  });
});
