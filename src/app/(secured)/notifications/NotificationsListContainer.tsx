"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { getNotificationsAction } from "@/api/notifications";
import NotificationsTable from "./NotificationsTable";

const DEFAULT_PAGE_SIZE = 10;

const NotificationsListContainer = () => {
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE;

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", page, pageSize],
    queryFn: () => getNotificationsAction({ page, pageSize }),
  });

  const notifications = data?.data?.items || [];
  const totalCount = data?.data?.totalCount || 0;

  return (
    <div className="space-y-4 mt-[20px] bg-bgwhite dark:bg-darkbgprimary p-4 rounded-xl shadow-sm">
      <NotificationsTable
        data={notifications}
        totalCount={totalCount}
        isLoading={isLoading}
      />
    </div>
  );
};

export default NotificationsListContainer;
