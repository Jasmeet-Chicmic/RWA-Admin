"use client";

import { CheckCheck, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";

import { TableColumn } from "@/components/atoms/Table";
import TableActions from "@/components/atoms/TableActions";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { NotificationItem } from "@/services/notifications/notificationTypes";
import {
  deleteNotificationsAction,
  markAsReadAction,
} from "@/api/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

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

  const markAsReadMutation = useMutation({
    mutationFn: (id?: string) => markAsReadAction({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-stats"] });
      toast.success("Notifications marked as read");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (ids?: string[]) => deleteNotificationsAction({ ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-stats"] });
      toast.success("Notifications deleted");
    },
  });

  const config: DataTableConfig<NotificationItem> = useMemo(() => {
    const columns: TableColumn<NotificationItem>[] = [
      {
        field: "title",
        title: "Notification",
        render: (item) => (
          <div
            className={`flex flex-col cursor-pointer ${!item.readAt ? "font-bold" : ""}`}
            onClick={() => {
              if (!item.readAt) markAsReadMutation.mutate(item.id);
              if (item.redirectUrl) router.push(item.redirectUrl);
            }}
          >
            <span className="text-sm dark:text-bgwhite">{item.title}</span>
            <span className="text-xs text-gray-500 dark:text-sidebartext line-clamp-1">
              {item.description}
            </span>
          </div>
        ),
      },
      {
        field: "createdAt",
        title: "Date",
        render: (item) => (
          <span className="text-sm text-gray-600 dark:text-sidebartext">
            {format(new Date(item.createdAt), "MMM dd, yyyy HH:mm")}
          </span>
        ),
      },
      {
        field: "readAt",
        title: "Status",
        render: (item) => (
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              item.readAt
                ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            }`}
          >
            {item.readAt ? "Read" : "Unread"}
          </span>
        ),
      },
      {
        field: "",
        title: "Actions",
        render: (item) => (
          <TableActions
            displayMode="inline"
            actions={[
              {
                id: "mark_read",
                label: "Mark Read",
                onClick: () => markAsReadMutation.mutate(item.id),
                icon: <CheckCheck className="w-4 h-4" />,
                disabled: !!item.readAt,
              },
              {
                id: "delete",
                label: "Delete",
                onClick: () => deleteMutation.mutate([item.id]),
                icon: <Trash2 className="w-4 h-4 text-red-500" />,
              },
            ]}
          />
        ),
      },
    ];

    return {
      columns,
      keyExtractor: (item) => item.id,
      paginationTitle: "notifications",
      hideSelectCol: true,
      emptyMessage: "No notifications found",
      header: (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between py-4">
          <div>
            <h2 className="text-xl font-bold dark:text-bgwhite">
              Notification History
            </h2>
            <p className="text-sm text-gray-500">
              Manage your account notifications
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => markAsReadMutation.mutate(undefined)}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-labelprimary dark:text-bgwhite dark:hover:bg-labelprimary flex items-center gap-2"
            >
              <CheckCheck size={16} /> Mark All Read
            </button>
            <button
              onClick={() => deleteMutation.mutate(undefined)}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 flex items-center gap-2"
            >
              <Trash2 size={16} /> Delete All
            </button>
          </div>
        </div>
      ),
    };
  }, [markAsReadMutation, deleteMutation, router]);

  return (
    <DataTable
      data={data}
      totalCount={totalCount}
      isLoading={isLoading}
      config={config}
    />
  );
};

export default NotificationsTable;
