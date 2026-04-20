/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useNotifications } from "@/hooks/useNotification";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const NOTIFICATION_COLORS: Record<string, string> = {
  overtime: "bg-blue-50 border-l-4 border-blue-400",
  attendance: "bg-green-50 border-l-4 border-green-400",
  system: "bg-gray-50 border-l-4 border-gray-400",
  alert: "bg-red-50 border-l-4 border-red-400",
  info: "bg-yellow-50 border-l-4 border-yellow-400",
};

const NOTIFICATION_BADGES: Record<string, string> = {
  overtime: "default",
  attendance: "secondary",
  system: "outline",
  alert: "destructive",
  info: "secondary",
};

export default function NotificationPage() {
  const { data, isLoading, markRead, markAllRead, remove } =
    useNotifications();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filterTab, setFilterTab] = useState<"all" | "unread">("all");

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((n: any) => !n.read_at).length;
  const displayNotifications =
    filterTab === "unread"
      ? notifications.filter((n: any) => !n.read_at)
      : notifications;

  const handleMarkRead = (id: number, isRead: boolean) => {
    if (!isRead) {
      markRead.mutate(id, {
        onSuccess: () => {
          toast.success("Notifikasi ditandai sudah dibaca");
        },
        onError: () => {
          toast.error("Gagal menandai notifikasi");
        },
      });
    }
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => {
        toast.success("Semua notifikasi ditandai sudah dibaca");
      },
      onError: () => {
        toast.error("Gagal menandai semua notifikasi");
      },
    });
  };

  const handleDelete = (id: number) => {
    remove.mutate(id, {
      onSuccess: () => {
        toast.success("Notifikasi dihapus");
        setDeleteId(null);
      },
      onError: () => {
        toast.error("Gagal menghapus notifikasi");
      },
    });
  };

  const getNotificationType = (notification: any): string => {
    if (notification.type?.includes("Overtime")) return "overtime";
    if (notification.type?.includes("Attendance")) return "attendance";
    if (notification.type?.includes("Alert")) return "alert";
    if (notification.type?.includes("Attendance")) return "attendance";
    return "info";
  };

  const getNotificationTitle = (notification: any): string => {
    if (notification.data?.title) return notification.data.title;
    if (notification.type) {
      const type = notification.type.split("\\").pop() || "Notifikasi";
      return type.replace(/Notification/, "");
    }
    return "Notifikasi";
  };

  const getNotificationMessage = (notification: any): string => {
    return notification.data?.message || notification.data?.body || "-";
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notifikasi</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} notifikasi baru
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markAllRead.isPending}
          >
            {markAllRead.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menandai...
              </>
            ) : (
              "Tandai Semua Sudah Dibaca"
            )}
          </Button>
        )}
      </div>

      <Tabs
        defaultValue="all"
        value={filterTab}
        onValueChange={(v) => setFilterTab(v as "all" | "unread")}
      >
        <TabsList>
          <TabsTrigger value="all">
            Semua ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Belum Dibaca ({unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : displayNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Tidak ada notifikasi untuk ditampilkan
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {displayNotifications.map((notif: any) => {
                const notifType = getNotificationType(notif);
                const isRead = !!notif.read_at;
                const colorClass = NOTIFICATION_COLORS[notifType] || "";
                const badgeVariant =
                  NOTIFICATION_BADGES[notifType] || "default";

                return (
                  <Card
                    key={notif.id}
                    className={`${colorClass} transition cursor-pointer hover:shadow-md`}
                    onClick={() => handleMarkRead(notif.id, isRead)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            {isRead ? (
                              <CheckCircle2 className="w-5 h-5 text-muted-foreground shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-blue-500 shrink-0" />
                            )}
                            <h3
                              className={`font-medium ${
                                !isRead ? "font-semibold" : ""
                              }`}
                            >
                              {getNotificationTitle(notif)}
                            </h3>
                            <Badge variant={badgeVariant as any}>
                              {notifType}
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-700 line-clamp-2">
                            {getNotificationMessage(notif)}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {format(new Date(notif.created_at), "PPpp", {
                              locale: localeId,
                            })}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(notif.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : displayNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Tidak ada notifikasi yang belum dibaca
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {displayNotifications.map((notif: any) => {
                const notifType = getNotificationType(notif);
                const colorClass = NOTIFICATION_COLORS[notifType] || "";
                const badgeVariant =
                  NOTIFICATION_BADGES[notifType] || "default";

                return (
                  <Card
                    key={notif.id}
                    className={`${colorClass} transition cursor-pointer hover:shadow-md`}
                    onClick={() => handleMarkRead(notif.id, false)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Circle className="w-5 h-5 text-blue-500 shrink-0" />
                            <h3 className="font-semibold">
                              {getNotificationTitle(notif)}
                            </h3>
                            <Badge variant={badgeVariant as any}>
                              {notifType}
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-700 line-clamp-2">
                            {getNotificationMessage(notif)}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {format(new Date(notif.created_at), "PPpp", {
                              locale: localeId,
                            })}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(notif.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── DELETE CONFIRMATION ── */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Notifikasi?</AlertDialogTitle>
            <AlertDialogDescription>
              Notifikasi akan dihapus secara permanen dan tidak dapat
              dipulihkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={remove.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {remove.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
