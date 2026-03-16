"use server";

import { API_END_POINTS } from "@/shared/api";
import { AdjustPlanPricingPayload, Plan, ResponseType } from "@/shared/types";

export async function getPlansAction() {
  const { getRequest } = await import("@/shared/fetcher");
  return await getRequest<ResponseType & { data: Plan[] }>(
    API_END_POINTS.PLANS,
  );
}

export async function adjustPlanPricingAction(
  payload: AdjustPlanPricingPayload,
) {
  const { postRequest } = await import("@/shared/fetcher");
  return await postRequest<ResponseType, AdjustPlanPricingPayload>(
    API_END_POINTS.ADJUST_PLAN_PRICING,
    payload,
  );
}

export interface PlanSubscriptionAnalytics {
  planId: string;
  planName: string;
  planCode: string;
  planType: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  pausedSubscriptions: number;
  monthlyBillingCount: number;
  yearlyBillingCount: number;
}

export interface SubscriptionAnalytics {
  totalActiveSubscriptions: number;
  totalCancelledSubscriptions: number;
  totalPausedSubscriptions: number;
  totalSubscriptions: number;
  planCounts: PlanSubscriptionAnalytics[];
}

export interface SubscriptionAnalyticsParams {
  from?: string;
  to?: string;
}

export async function fetchSubscriptionAnalyticsAction(
  params: SubscriptionAnalyticsParams = {},
) {
  const { getRequest } = await import("@/shared/fetcher");
  return await getRequest<
    ResponseType & { data: SubscriptionAnalytics },
    SubscriptionAnalyticsParams
  >(API_END_POINTS.SUBSCRIPTION_ANALYTICS, params);
}
