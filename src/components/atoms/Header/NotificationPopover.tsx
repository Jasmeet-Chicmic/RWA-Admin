"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import useInfiniteScroll from "react-infinite-scroll-hook";
import {
  getNotificationsAction,
  getNotificationStatsAction,
  markAsReadAction,
} from "@/api/notifications";
import { NotificationItem } from "@/services/notifications/notificationTypes";
import { ROUTES } from "@/shared/routes";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check } from "lucide-react";

interface NotificationPopoverProps {
  onClose: () => void;
}

const NotificationPopover = ({ onClose }: NotificationPopoverProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam = 1 }) =>
      getNotificationsAction({ page: pageParam, pageSize: 10 }),
    getNextPageParam: (lastPage) => {
      if (lastPage.data?.hasMore) {
        return lastPage.data.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const { data: stats } = useQuery({
    queryKey: ["notification-stats"],
    queryFn: () => getNotificationStatsAction(),
  });

  const unreadCount = stats?.data?.unread ?? 0;

  const markAsReadMutation = useMutation({
    mutationFn: (id?: string) => markAsReadAction({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-stats"] });
    },
  });

  const notifications =
    data?.pages.flatMap((page) => page.data?.items || []) || [];

  const [sentryRef] = useInfiniteScroll({
    loading: isFetchingNextPage,
    hasNextPage: !!hasNextPage,
    onLoadMore: fetchNextPage,
    disabled: isError,
    rootMargin: "0px 0px 400px 0px",
  });

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.readAt) {
      await markAsReadMutation.mutateAsync(notification.id);
    }
    onClose();
    if (notification.redirectUrl) {
      router.push(notification.redirectUrl);
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#1A1A1A] rounded-2xl shadow-2xl border border-white/10 z-[100] flex flex-col max-h-[500px] overflow-hidden">
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-primarycolor text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              {unreadCount} NEW
            </span>
          )}
        </div>
        <button
          onClick={() => markAsReadMutation.mutate(undefined)}
          disabled={unreadCount === 0 || markAsReadMutation.isPending}
          className="text-xs text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
        >
          <Check size={14} />
          Mark all as read
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="animate-spin text-primarycolor" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-sidebartext">
            No notifications yet
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 cursor-pointer border-b border-white/5 transition-all relative ${
                  !notification.readAt
                    ? "bg-primarycolor/5 border-l-2 border-l-primarycolor"
                    : "hover:bg-white/5 border-l-2 border-l-transparent"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                    <Bell
                      size={18}
                      className={
                        !notification.readAt
                          ? "text-primarycolor"
                          : "text-gray-500"
                      }
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm truncate ${
                        !notification.readAt
                          ? "font-bold text-white"
                          : "font-medium text-gray-300"
                      }`}
                    >
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {notification.description}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-2">
                      {mounted &&
                        formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                    </p>
                  </div>
                  {!notification.readAt && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primarycolor shadow-[0_0_8px_rgba(199,254,30,0.6)] mt-1.5 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}

            {/* Infinite Scroll Trigger */}
            <div ref={sentryRef} className="p-4 flex justify-center">
              {isFetchingNextPage ? (
                <Loader2 className="animate-spin h-5 w-5 text-primarycolor" />
              ) : null}
            </div>
          </>
        )}
      </div>

      <div className="p-4 bg-[#1A1A1A] border-t border-white/10">
        <button
          onClick={() => {
            onClose();
            router.push(ROUTES.NOTIFICATIONS || "/notifications");
          }}
          className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-colors uppercase tracking-wider"
        >
          View All Notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationPopover;
