import type { AdminPropertiesDetails } from "@/api/adminProperties.types";
import { API_END_POINTS } from "@/shared/api";
import { ResponseType } from "@/shared/types";
import { getRequest } from "./fetcher";
import { propertiesService } from "./properties-service";
export type { AdminPropertiesDetails } from "@/api/adminProperties.types";

export interface UserRetentionData {
  totalUsers: number;
  activeUsers: number;
  usersLoggedInMoreThan3TimesThisWeek: number;
  avgSessionsPerUser: number;
  avgSessionDurationMinutes: number;
  avgTimeBetweenVisitsHours: number;
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

export interface DashboardAnalyticsData {
  totalUsers: number;
  totalOrganizations: number;
  totalProperties: number;
  totalInvestments: number;
}

export interface UserSignupGraphPoint {
  createdAt: string;
  total: number;
}

type WithData<T> = ResponseType & { data?: T };

export const analyticsService = {
  async getUserRetention(): Promise<UserRetentionData> {
    const payload = await getRequest<WithData<UserRetentionData>>(
      API_END_POINTS.REPORTS_USER_RETENTION,
    );
    return (
      payload.data ?? {
        totalUsers: 0,
        activeUsers: 0,
        usersLoggedInMoreThan3TimesThisWeek: 0,
        avgSessionsPerUser: 0,
        avgSessionDurationMinutes: 0,
        avgTimeBetweenVisitsHours: 0,
      }
    );
  },

  async getSubscriptionAnalytics(
    params: SubscriptionAnalyticsParams,
  ): Promise<SubscriptionAnalytics> {
    const payload = await getRequest<WithData<SubscriptionAnalytics>>(
      API_END_POINTS.SUBSCRIPTION_ANALYTICS,
      params,
    );
    return (
      payload.data ?? {
        totalActiveSubscriptions: 0,
        totalCancelledSubscriptions: 0,
        totalPausedSubscriptions: 0,
        totalSubscriptions: 0,
        planCounts: [],
      }
    );
  },

  /**
   * Dashboard property stat cards: `GET /admin/properties/{propertyId}` is for a single property only.
   * Aggregate totals use `propertiesService.getAdminDashboardSummary()` (list + pending count).
   */
  async getPropertiesDetails(): Promise<AdminPropertiesDetails> {
    return await propertiesService.getAdminDashboardSummary();
  },

  async getDashboardAnalytics(): Promise<DashboardAnalyticsData> {
    const payload = await getRequest<WithData<DashboardAnalyticsData>>(
      API_END_POINTS.DASHBOARD_ANALYTICS,
    );
    return (
      payload.data ?? {
        totalUsers: 0,
        totalOrganizations: 0,
        totalProperties: 0,
        totalInvestments: 0,
      }
    );
  },

  async getUserSignupGraph(): Promise<UserSignupGraphPoint[]> {
    const payload = await getRequest<WithData<UserSignupGraphPoint[]>>(
      API_END_POINTS.DASHBOARD_USER_GRAPH,
    );
    return payload.data ?? [];
  },
};
