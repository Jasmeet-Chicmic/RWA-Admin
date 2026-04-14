"use server";

import { API_END_POINTS } from "@/shared/api";
import { getRequest, deleteRequest, patchRequest } from "@/shared/fetcher";
import { ResponseType } from "@/shared/types";
import { NotificationItem } from "@/services/notifications/notificationTypes";

export interface NotificationsResponse extends ResponseType {
  data: {
    page: number;
    pageSize: number;
    totalCount: number;
    hasMore: boolean;
    items: NotificationItem[];
  };
}

export interface NotificationStatsResponse extends ResponseType {
  data: {
    total: number;
    unread: number;
  };
}

export async function getNotificationsAction(params: {
  page: number;
  pageSize: number;
}) {
  return await getRequest<
    NotificationsResponse,
    { page: number; pageSize: number }
  >(API_END_POINTS.NOTIFICATIONS, params);
}

export async function getNotificationStatsAction() {
  return await getRequest<NotificationStatsResponse>(
    API_END_POINTS.NOTIFICATIONS_STATS,
  );
}

export async function deleteNotificationsAction(payload: { ids?: string[] }) {
  return await deleteRequest<ResponseType, { ids?: string[] }>(
    API_END_POINTS.NOTIFICATIONS,
    payload,
  );
}

export async function markAsReadAction(payload: { id?: string }) {
  return await patchRequest<ResponseType, { id?: string }>(
    API_END_POINTS.NOTIFICATIONS_READ,
    payload,
  );
}
