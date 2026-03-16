"use server";

// src/api/dashboard.ts
import { API_END_POINTS } from "@/shared/api";
import { getRequest } from "@/shared/fetcher";
import { ResponseType } from "@/shared/types";
import { REPORT_FILTER_TYPE, REPORT_GROUP_BY } from "@/shared/constants";
import {
  transformAverageSalesData,
  transformSalesOverviewData,
  // ... (omitted for brevity, will use specific replacement below)
  transformWebSiteAnalyticsData,
  transformEarningsReportData,
  transformSupportTicketsData,
  transformSalesByCountryData,
  transformTotalEarningsData,
  transformTopTransactionsData,
} from "@/shared/transformers/dashboard";

// Website Analytics
export const fetchDashboardAnalytics = async (
  params: { filterType?: string } = {},
) => {
  return await getRequest(API_END_POINTS.WEBSITE_ANALYTICS, params, {
    transformer: transformWebSiteAnalyticsData,
  });
};

// Daily Sales
export const fetchAverageDailySales = async (params = {}) => {
  return await getRequest(API_END_POINTS.AVERAGE_DAILY_SALES, params, {
    transformer: transformAverageSalesData,
  });
};

// Sales Overview
export const fetchSalesOverview = async (params = {}) => {
  return await getRequest(API_END_POINTS.SALES_OVERVIEW, params, {
    transformer: transformSalesOverviewData,
  });
};

// Earning Report
export const fetchEarningsReport = async (params = {}) => {
  return await getRequest(API_END_POINTS.EARNINGS_REPORT, params, {
    transformer: transformEarningsReportData,
  });
};

// Support Tracker
export const fetchSupportTickets = async (params = {}) => {
  return await getRequest(API_END_POINTS.SUPPORT_TICKETS, params, {
    transformer: transformSupportTicketsData,
  });
};

// Sales By Country
export const fetchSalesByCountry = async (params = {}) => {
  return await getRequest(API_END_POINTS.SALES_BY_COUNTRY, params, {
    transformer: transformSalesByCountryData,
  });
};

// Total Earning
export const fetchTotalEarnings = async (params = {}) => {
  return await getRequest(API_END_POINTS.TOTAL_EARNINGS, params, {
    transformer: transformTotalEarningsData,
  });
};

// Top Transactions
export const fetchTopTransactions = async (params = {}) => {
  return await getRequest(API_END_POINTS.TRANSACTIONS, params, {
    transformer: transformTopTransactionsData,
  });
};

export interface RevenuePerGameItem {
  gameType: number;
  grossGamingRevenue: number;
}

export interface RevenuePerGameData {
  revenuePerGame: RevenuePerGameItem[];
}

export const fetchRevenuePerGameAction = async (currency: number) => {
  return await getRequest<
    ResponseType & { data: RevenuePerGameData },
    { currency: number }
  >(API_END_POINTS.REVENUE_PER_GAME, { currency });
};

export interface CompanyCreatedData {
  period: string;
  count: number;
  date: string;
}

export interface UserRetentionData {
  totalUsers: number;
  activeUsers: number;
  usersLoggedInMoreThan3TimesThisWeek: number;
  avgSessionsPerUser: number;
  avgSessionDurationMinutes: number;
  avgTimeBetweenVisitsHours: number;
}

export interface CompanyFollowerData {
  period: string;
  count: number;
  date: string;
}

export interface GroupCreatedData {
  period: string;
  count: number;
  date: string;
}

export interface GroupJoinedData {
  period: string;
  count: number;
  date: string;
}

export interface ConversionRateItem {
  period: string;
  date: string;
  totalViewers: number;
  totalConversions: number;
  viewsWithoutConversion: number;
  conversionRate: number;
}

export interface EntityConversionData {
  totalViewers: number;
  totalConversions: number;
  overallConversionRate: number;
  totalViewsWithoutConversion: number;
  data: ConversionRateItem[];
}

export interface ConversionRateData {
  groups: EntityConversionData;
  companies: EntityConversionData;
  events: EntityConversionData;
}

export interface EventCreatedData {
  period: string;
  count: number;
  date: string;
}

export interface EventAttendeeData {
  period: string;
  count: number;
  date: string;
}

export interface EngagementMetricItem {
  period: string;
  date: string;
  uniqueUsers: number;
  repeatUsers: number;
  totalActions: number;
  averageActionsPerUser: number;
}

export interface EngagementAnalyticsData {
  companies: EngagementMetricItem[];
  groups: EngagementMetricItem[];
  events: EngagementMetricItem[];
}

export const fetchCompanyCreatedAction = async (params: {
  filterType: REPORT_FILTER_TYPE;
  groupBy: REPORT_GROUP_BY;
  startDate?: string;
  endDate?: string;
}) => {
  return await getRequest<
    ResponseType & { data: CompanyCreatedData[] },
    {
      filterType: REPORT_FILTER_TYPE;
      groupBy: REPORT_GROUP_BY;
      startDate?: string;
      endDate?: string;
    }
  >(API_END_POINTS.REPORTS_COMPANY_CREATED, params);
};

export const fetchUserRetentionAction = async () => {
  return await getRequest<ResponseType & { data: UserRetentionData }>(
    API_END_POINTS.REPORTS_USER_RETENTION,
  );
};

export const fetchCompanyFollowerAction = async (params: {
  filterType: REPORT_FILTER_TYPE;
  groupBy: REPORT_GROUP_BY;
  startDate?: string;
  endDate?: string;
}) => {
  return await getRequest<
    ResponseType & { data: CompanyFollowerData[] },
    {
      filterType: REPORT_FILTER_TYPE;
      groupBy: REPORT_GROUP_BY;
      startDate?: string;
      endDate?: string;
    }
  >(API_END_POINTS.REPORTS_COMPANY_FOLLOWER, params);
};

export const fetchGroupCreatedAction = async (params: {
  filterType: REPORT_FILTER_TYPE;
  groupBy: REPORT_GROUP_BY;
  startDate?: string;
  endDate?: string;
}) => {
  return await getRequest<
    ResponseType & { data: GroupCreatedData[] },
    {
      filterType: REPORT_FILTER_TYPE;
      groupBy: REPORT_GROUP_BY;
      startDate?: string;
      endDate?: string;
    }
  >(API_END_POINTS.REPORTS_GROUP_CREATED, params);
};

export const fetchGroupJoinedAction = async (params: {
  filterType: REPORT_FILTER_TYPE;
  groupBy: REPORT_GROUP_BY;
  startDate?: string;
  endDate?: string;
}) => {
  return await getRequest<
    ResponseType & { data: GroupJoinedData[] },
    {
      filterType: REPORT_FILTER_TYPE;
      groupBy: REPORT_GROUP_BY;
      startDate?: string;
      endDate?: string;
    }
  >(API_END_POINTS.REPORTS_GROUP_JOINED, params);
};

export const fetchConversionRateAction = async (params: {
  filterType: REPORT_FILTER_TYPE;
  groupBy: REPORT_GROUP_BY;
  startDate?: string;
  endDate?: string;
}) => {
  return await getRequest<
    ResponseType & { data: ConversionRateData },
    {
      filterType: REPORT_FILTER_TYPE;
      groupBy: REPORT_GROUP_BY;
      startDate?: string;
      endDate?: string;
    }
  >(API_END_POINTS.REPORTS_CONVERSION_RATE, params);
};

export const fetchEventCreatedAction = async (params: {
  filterType: REPORT_FILTER_TYPE;
  groupBy: REPORT_GROUP_BY;
  startDate?: string;
  endDate?: string;
}) => {
  return await getRequest<
    ResponseType & { data: EventCreatedData[] },
    {
      filterType: REPORT_FILTER_TYPE;
      groupBy: REPORT_GROUP_BY;
      startDate?: string;
      endDate?: string;
    }
  >(API_END_POINTS.REPORTS_EVENT_CREATED, params);
};

export const fetchEventAttendeeAction = async (params: {
  filterType: REPORT_FILTER_TYPE;
  groupBy: REPORT_GROUP_BY;
  startDate?: string;
  endDate?: string;
}) => {
  return await getRequest<
    ResponseType & { data: EventAttendeeData[] },
    {
      filterType: REPORT_FILTER_TYPE;
      groupBy: REPORT_GROUP_BY;
      startDate?: string;
      endDate?: string;
    }
  >(API_END_POINTS.REPORTS_EVENT_ATTENDEE, params);
};

export const fetchEngagementAnalyticsAction = async (params: {
  filterType: REPORT_FILTER_TYPE;
  groupBy: REPORT_GROUP_BY;
  startDate?: string;
  endDate?: string;
}) => {
  return await getRequest<
    ResponseType & { data: EngagementAnalyticsData },
    {
      filterType: REPORT_FILTER_TYPE;
      groupBy: REPORT_GROUP_BY;
      startDate?: string;
      endDate?: string;
    }
  >(API_END_POINTS.REPORTS_ENGAGEMENT_ANALYTICS, params);
};
