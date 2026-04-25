import "./PWABadge.css";

import { useRegisterSW } from "virtual:pwa-register/react";
import { useEffect, useState } from "react";
import { Smartphone, RotateCcw, X, Mail } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function PWABadge() {
  // periodic sync is disabled, change the value to enable it, the period is in milliseconds
  // You can remove onRegisteredSW callback and registerPeriodicSync function
  const period = 0;

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (period <= 0) return;
      if (r?.active?.state === "activated") {
        registerPeriodicSync(period, swUrl, r);
      } else if (r?.installing) {
        r.installing.addEventListener("statechange", (e) => {
          const sw = e.target as ServiceWorker;
          if (sw.state === "activated") registerPeriodicSync(period, swUrl, r);
        });
      }
    },
  });

  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstallable(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  function close() {
    setNeedRefresh(false);
    setIsCollapsed(false);
  }

  function closeInstall() {
    setIsInstallable(false);
    setIsCollapsed(false);
  }

  async function handleInstall() {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error("Installation failed:", error);
    }
  }

  const hasNotification = (isInstallable && installPrompt) || needRefresh;

  return (
    <div className="PWABadge" role="alert" aria-labelledby="toast-message">
      {hasNotification && (
        <div className={`PWABadge-toast ${isCollapsed ? "collapsed" : ""}`}>
          {!isCollapsed ? (
            <>
              {isInstallable && installPrompt && (
                <>
                  <div className="PWABadge-header">
                    <div className="PWABadge-icon install-icon">
                      <Smartphone size={20} />
                    </div>
                    <div className="PWABadge-title">Instal Aplikasi</div>
                    <button
                      className="PWABadge-collapse-btn"
                      onClick={() => setIsCollapsed(true)}
                      aria-label="Collapse notification"
                      title="Sembunyikan"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="PWABadge-message">
                    <span id="toast-message">
                      Akses lebih cepat dengan instal aplikasi
                    </span>
                  </div>
                  <div className="PWABadge-buttons">
                    <button
                      className="PWABadge-toast-button-primary"
                      onClick={handleInstall}
                    >
                      Instal
                    </button>
                    <button
                      className="PWABadge-toast-button-secondary"
                      onClick={closeInstall}
                    >
                      Nanti
                    </button>
                  </div>
                </>
              )}
              {needRefresh && (
                <>
                  <div className="PWABadge-header">
                    <div className="PWABadge-icon update-icon">
                      <RotateCcw size={20} />
                    </div>
                    <div className="PWABadge-title">Update Tersedia</div>
                    <button
                      className="PWABadge-collapse-btn"
                      onClick={() => setIsCollapsed(true)}
                      aria-label="Collapse notification"
                      title="Sembunyikan"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="PWABadge-message">
                    <span id="toast-message">
                      Konten baru tersedia, muat ulang untuk mendapatkan versi
                      terbaru.
                    </span>
                  </div>
                  <div className="PWABadge-buttons">
                    <button
                      className="PWABadge-toast-button-primary"
                      onClick={() => updateServiceWorker(true)}
                    >
                      Muat Ulang
                    </button>
                    <button
                      className="PWABadge-toast-button-secondary"
                      onClick={close}
                    >
                      Nanti
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <button
              className="PWABadge-expand-btn"
              onClick={() => setIsCollapsed(false)}
              aria-label="Expand notification"
              title="Tampilkan pemberitahuan"
            >
              <span className="PWABadge-badge">1</span>
              <Mail size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default PWABadge;

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 */
function registerPeriodicSync(
  period: number,
  swUrl: string,
  r: ServiceWorkerRegistration,
) {
  if (period <= 0) return;

  setInterval(async () => {
    if ("onLine" in navigator && !navigator.onLine) return;

    const resp = await fetch(swUrl, {
      cache: "no-store",
      headers: {
        cache: "no-store",
        "cache-control": "no-cache",
      },
    });

    if (resp?.status === 200) await r.update();
  }, period);
}
