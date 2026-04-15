"use client";

import { Bell, Check, Loader2, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { formatDistanceToNow } from "date-fns";
import { NotificationItem } from "@/services/notifications/notificationTypes";
import {
  deleteNotificationsAction,
  markAsReadAction,
} from "@/api/notifications";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getNotificationStatsAction } from "@/api/notifications";
import ConfirmationModal from "@/components/molecules/ConfirmationModal/ConfirmationModal";

interface NotificationsTableProps {
  data: NotificationItem[];
  totalCount: number;
  isLoading?: boolean;
}

const NotificationsTable = ({
  data,
  totalCount,
  isLoading = false,
}: NotificationsTableProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [readingId, setReadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: stats } = useQuery({
    queryKey: ["notification-stats"],
    queryFn: () => getNotificationStatsAction(),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id?: string) => markAsReadAction({ id }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-stats"] });
      if (!variables) {
        toast.success("All notifications marked as read");
      }
      setReadingId(null);
    },
    onError: () => {
      setReadingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ids?: string[]) => deleteNotificationsAction({ ids }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-stats"] });
      if (variables && variables.length === 1) {
        toast.success("Notification deleted");
      } else {
        toast.success("All notifications deleted");
      }
      setShowDeleteConfirm(false);
      setDeletingId(null);
    },
    onError: () => {
      setShowDeleteConfirm(false);
      setDeletingId(null);
    },
  });

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.readAt) {
      try {
        setReadingId(item.id);
        await markAsReadMutation.mutateAsync(item.id);
      } finally {
        setReadingId(null);
      }
    }

    if (item.redirectUrl) {
      router.push(item.redirectUrl);
    }
  };

  const handleDeleteOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    deleteMutation.mutate([id]);
  };

  const unreadCount = stats?.data?.unread ?? 0;

  return (
    <>
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteMutation.mutate(undefined)}
        title="Delete All Notifications"
        message="Are you sure you want to delete all notifications? This action cannot be undone."
        isLoading={deleteMutation.isPending}
        variant="danger"
      />

      <div className="max-w-7xl mx-auto py-10 px-6 min-h-screen">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-3">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold text-sidebartext tracking-tight">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="bg-primarycolor text-black text-xs font-black px-3 py-1 rounded-full uppercase">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Read All Button */}
              <button
                onClick={() => markAsReadMutation.mutate(undefined)}
                disabled={
                  (markAsReadMutation.isPending && !readingId) ||
                  unreadCount === 0
                }
                className="px-5 py-2.5 text-sm font-bold bg-transparent border border-darkbordercolor1 text-sidebartext rounded-xl hover:bg-darkbgsecondary transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {markAsReadMutation.isPending && !readingId ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                Read All
              </button>

              {/* Delete All Button */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleteMutation.isPending || data.length === 0}
                className="px-5 py-2.5 text-sm font-bold bg-transparent border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/5 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleteMutation.isPending && !deletingId ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash size={16} />
                )}
                Delete All
              </button>
            </div>
          </div>

          <p className="text-darktextparagraphlight text-base">
            Stay updated with your investment activities and platform alerts.
          </p>
        </div>

        <div className="w-full h-px bg-darkbordercolor1 mb-8" />

        {/* Notifications List */}
        <div className="border border-darkbordercolor1 rounded-2xl overflow-hidden shadow-xl bg-darkbgprimary/20">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 size={32} className="animate-spin text-primarycolor" />
              <p className="text-darklabelprimary text-sm">
                Loading notifications...
              </p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-16 h-16 rounded-full bg-darkbgsecondary flex items-center justify-center">
                <Bell size={28} className="text-darklabelprimary opacity-50" />
              </div>
              <p className="text-darklabelprimary font-semibold text-lg">
                All caught up!
              </p>
              <p className="text-darklabelprimary opacity-60 text-sm">
                No notifications to show.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-darkbordercolor1">
              {data.map((item) => {
                const isBeingRead =
                  readingId === item.id && markAsReadMutation.isPending;
                const isBeingDeleted =
                  deletingId === item.id && deleteMutation.isPending;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`relative flex items-center gap-5 px-6 py-5 transition-all cursor-pointer group ${
                      !item.readAt
                        ? "bg-primarycolor/[0.03] hover:bg-primarycolor/[0.06]"
                        : "hover:bg-darkbgsecondary/30"
                    } ${isBeingRead || isBeingDeleted ? "opacity-60 pointer-events-none" : ""}`}
                  >
                    {/* Unread left indicator bar */}
                    {!item.readAt && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primarycolor rounded-r-full" />
                    )}

                    {/* Bell Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all ${
                        !item.readAt
                          ? "bg-primarycolor/10 border-primarycolor/20"
                          : "bg-darkbgsecondary border-darkbordercolor1"
                      }`}
                    >
                      {isBeingRead ? (
                        <Loader2
                          size={20}
                          className="animate-spin text-primarycolor"
                        />
                      ) : (
                        <Bell
                          size={20}
                          className={
                            !item.readAt
                              ? "text-primarycolor"
                              : "text-darklabelprimary"
                          }
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1">
                        <h3
                          className={`text-base transition-colors ${
                            !item.readAt
                              ? "font-bold text-sidebartext"
                              : "font-medium text-darklabelprimary"
                          }`}
                        >
                          {item.title}
                        </h3>
                        {!item.readAt && (
                          <div className="w-2 h-2 rounded-full bg-primarycolor flex-shrink-0 shadow-[0_0_8px_rgba(199,254,30,0.5)]" />
                        )}
                      </div>

                      <p className="text-darktextparagraphlight text-sm leading-relaxed line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-4 mt-2.5">
                        <p className="text-xs text-darklabelprimary opacity-70 font-medium">
                          {mounted
                            ? formatDistanceToNow(new Date(item.createdAt), {
                                addSuffix: true,
                              })
                            : ""}
                        </p>
                        {!item.readAt && (
                          <span className="text-[10px] font-black text-primarycolor uppercase tracking-widest">
                            New
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Per-notification delete button */}
                    <button
                      onClick={(e) => handleDeleteOne(e, item.id)}
                      disabled={isBeingDeleted}
                      className="flex-shrink-0 p-2.5 rounded-xl border border-transparent text-darklabelprimary opacity-0 group-hover:opacity-100 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete notification"
                    >
                      {isBeingDeleted ? (
                        <Loader2
                          size={16}
                          className="animate-spin text-red-400"
                        />
                      ) : (
                        <Trash size={16} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {totalCount > data.length && (
          <p className="text-center text-darklabelprimary text-sm mt-6 opacity-60">
            Showing {data.length} of {totalCount} notifications
          </p>
        )}
      </div>
    </>
  );
};

export default NotificationsTable;
