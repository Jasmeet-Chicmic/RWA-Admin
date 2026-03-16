"use server";

import { API_END_POINTS } from "@/shared/api";
import {
  AdjustSubscriptionPayload,
  GetAdminSubscriptionsParams,
  PaginatedDataType,
  ResponseType,
  Subscription,
} from "@/shared/types";

export async function getAdminSubscriptionsAction(
  params: GetAdminSubscriptionsParams,
) {
  const { getRequest } = await import("@/shared/fetcher");
  return await getRequest<
    ResponseType & { data: PaginatedDataType<Subscription> },
    GetAdminSubscriptionsParams
  >(API_END_POINTS.ADMIN_SUBSCRIPTIONS, params);
}

export async function adjustSubscriptionAction(
  payload: AdjustSubscriptionPayload,
) {
  const { putRequest } = await import("@/shared/fetcher");
  return await putRequest<ResponseType, AdjustSubscriptionPayload>(
    API_END_POINTS.ADJUST_SUBSCRIPTION,
    payload,
  );
}
