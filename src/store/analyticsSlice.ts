import {
  AdminPropertiesDetails,
  analyticsService,
  SubscriptionAnalytics,
  UserRetentionData,
} from "@/services/analytics-service";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

type AnalyticsState = {
  retentionData: UserRetentionData;
  subscriptionAnalytics: SubscriptionAnalytics;
  propertiesDetails: AdminPropertiesDetails;
  isLoading: boolean;
  error: string | null;
};

const initialState: AnalyticsState = {
  retentionData: {
    totalUsers: 0,
    activeUsers: 0,
    usersLoggedInMoreThan3TimesThisWeek: 0,
    avgSessionsPerUser: 0,
    avgSessionDurationMinutes: 0,
    avgTimeBetweenVisitsHours: 0,
  },
  subscriptionAnalytics: {
    totalActiveSubscriptions: 0,
    totalCancelledSubscriptions: 0,
    totalPausedSubscriptions: 0,
    totalSubscriptions: 0,
    planCounts: [],
  },
  propertiesDetails: {
    totalAssetValue: 0,
    totalInvestors: 0,
    tokensIssued: 0,
    pendingKyc: 0,
    platformRevenue: 0,
    pendingPropertyApprovals: 0,
  },
  isLoading: false,
  error: null,
};

export const fetchAnalyticsSummary = createAsyncThunk<
  {
    retentionData: UserRetentionData;
    subscriptionAnalytics: SubscriptionAnalytics;
    propertiesDetails: AdminPropertiesDetails;
  },
  { fromDate: string; toDate: string },
  { rejectValue: string }
>("analytics/fetchSummary", async (params, { rejectWithValue }) => {
  try {
    const [retentionData, subscriptionAnalytics, propertiesDetails] =
      await Promise.all([
        analyticsService.getUserRetention(),
        analyticsService.getSubscriptionAnalytics({
          from: params.fromDate,
          to: params.toDate,
        }),
        analyticsService.getPropertiesDetails(),
      ]);
    return {
      retentionData,
      subscriptionAnalytics,
      propertiesDetails,
    };
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch analytics",
    );
  }
});

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalyticsSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.retentionData = action.payload.retentionData;
        state.subscriptionAnalytics = action.payload.subscriptionAnalytics;
        state.propertiesDetails = action.payload.propertiesDetails;
      })
      .addCase(fetchAnalyticsSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to fetch analytics";
      });
  },
});

export default analyticsSlice.reducer;
