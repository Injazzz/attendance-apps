/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, set } from "idb-keyval";

export async function getDeviceFingerprint(): Promise<string> {
  // Cek apakah sudah ada fingerprint tersimpan
  const stored = await get<string>("device_fingerprint");
  if (stored) return stored;

  // Generate fingerprint baru dari browser properties
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl");
  const debugInfo = gl?.getExtension("WEBGL_debug_renderer_info");
  const renderer =
    gl?.getParameter(debugInfo?.UNMASKED_RENDERER_WEBGL ?? 0) ?? "";

  const components = [
    navigator.userAgent,
    navigator.language,
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    renderer,
    navigator.hardwareConcurrency,
    (navigator as any).deviceMemory ?? "",
  ].join("|");

  // Hash dengan SHA-256
  const buffer = new TextEncoder().encode(components);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const fingerprint = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  await set("device_fingerprint", fingerprint);
  return fingerprint;
}

export function getDeviceInfo(): object {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenSize: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    online: navigator.onLine,
    standalone: (window.navigator as any).standalone ?? false,
  };
}
