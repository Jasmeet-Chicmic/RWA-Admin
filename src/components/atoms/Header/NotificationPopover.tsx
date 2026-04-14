"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { getNotificationsAction, markAsReadAction } from "@/api/notifications";
import { NotificationItem } from "@/services/notifications/notificationTypes";
import { ROUTES } from "@/shared/routes";
import { formatDistanceToNow } from "date-fns";

interface NotificationPopoverProps {
  onClose: () => void;
}

const NotificationPopover = ({ onClose }: NotificationPopoverProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

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

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => markAsReadAction({ id }),
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
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-bgwhite rounded-lg shadow-xl border border-gray-200 z-[100] dark:bg-darkbgprimary dark:border-labelprimary flex flex-col max-h-[500px]">
      <div className="p-4 border-b border-gray-200 dark:border-labelprimary flex justify-between items-center">
        <h3 className="font-semibold text-gray-900 dark:text-bgwhite">
          Notifications
        </h3>
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
                className={`p-4 hover:bg-gray-50 dark:hover:bg-labelprimary cursor-pointer border-b border-gray-100 dark:border-labelprimary/50 transition-colors ${
                  !notification.readAt
                    ? "bg-blue-50/50 dark:bg-primarycolor/10"
                    : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      !notification.readAt ? "bg-blue-500" : "bg-transparent"
                    }`}
                  />
                  <div className="flex-1">
                    <p
                      className={`text-sm ${!notification.readAt ? "font-bold text-gray-900 dark:text-bgwhite" : "font-medium text-gray-700 dark:text-gray-300"}`}
                    >
                      {notification.title}
                    </p>
                    <p className="text-xs text-sidebartext mt-1 line-clamp-2 dark:text-gray-400">
                      {notification.description}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Infinite Scroll Trigger */}
            <div ref={sentryRef} className="p-4 flex justify-center">
              {isFetchingNextPage ? (
                <Loader2 className="animate-spin h-5 w-5 text-primarycolor" />
              ) : !hasNextPage && notifications.length > 0 ? (
                <span className="text-xs text-gray-400">List has ended</span>
              ) : null}
            </div>
          </>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-labelprimary text-center">
        <button
          onClick={() => {
            onClose();
            router.push(ROUTES.NOTIFICATIONS || "/notifications");
          }}
          className="text-sm font-semibold text-primarycolor hover:underline"
        >
          View All Notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationPopover;
