"use server";

import { API_END_POINTS } from "@/shared/api";
import {
  deleteRequest,
  getRequest,
  postRequest,
  putRequest,
} from "@/shared/fetcher";
import { GetParamsType, ResponseType, SubscriptionPlan } from "@/shared/types";

export async function addSubscriptionAction(payload: SubscriptionPlan) {
  return await postRequest<ResponseType, SubscriptionPlan>(
    API_END_POINTS.SUBSCRIPTION_PLANS,
    payload,
  );
}

export async function updateSubscriptionAction(
  payload: SubscriptionPlan & { subscriptionPlanId: string },
) {
  return await putRequest<
    ResponseType,
    SubscriptionPlan & { subscriptionPlanId: string }
  >(API_END_POINTS.SUBSCRIPTION_PLANS, payload);
}

export async function deleteSubscriptionAction(payload: {
  subscriptionPlanIds: string[];
}) {
  return await deleteRequest<ResponseType, { subscriptionPlanIds: string[] }>(
    API_END_POINTS.SUBSCRIPTION_PLANS,
    payload,
  );
}

export async function getSubscriptionPlansAction(payload: GetParamsType) {
  return await getRequest<ResponseType, GetParamsType>(
    API_END_POINTS.SUBSCRIPTION_PLANS,
    payload,
  );
}
