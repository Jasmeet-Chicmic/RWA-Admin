export interface AnalyticsApiResponse {
  data: {
    totalSessions: number;
    totalViews: number;
    totalLeads: number;
    totalConversions: number;
    totalOrders: number;
    totalSpend: number;
    totalItems: number;
    averageItems: number;
    directRevenue: number;
    organicRevenue: number;
    referralRevenue: number;
    campaignRevenue: number;
  };
}

export interface AverageSalesApiResponse {
  data: {
    totalSales: number;
    monthData: { day: number; averageSales: number }[];
  };
}

export interface SalesOverviewApiResponse {
  data: {
    currentMonthOrderAmount: number;
    currentMonthOrders: number;
    currentMonthSales: number;
    currentMonthVisits: number;
    lastMonthOrders: number;
    lastMonthSales: number;
    lastMonthVisits: number;
    orderAmountIncreasePercentage: number;
    ordersIncreasePercentage: number;
    salesIncreasePercentage: number;
    visitsIncreasePercentage: number;
  };
}

export interface EarningsReportApiResponse {
  data: {
    currentWeekExpenses: number;
    currentWeekProfit: number;
    currentWeekRevenue: number;
    lastWeekExpenses: number;
    lastWeekProfit: number;
    lastWeekRevenue: number;
    revenueIncreasePercentage: number;
    weeklyEarnings: {
      day: number;
      earnings: number;
    }[];
  };
}

export interface SupportTicketsApiResponse {
  data: {
    completedPercentage: number;
    newTickets: number;
    openTickets: number;
    responseTime: number;
    totalTickets: number;
  };
}

export interface SalesByCountryApiResponse {
  data: {
    country: string;
    isPositive: boolean;
    countryCode: string;
    salesIncreasePercentage: number;
    totalSales: number;
  }[];
}

export interface TotalEarningsApiResponse {
  data: {
    earningsIncreasePercentage: number;
    isEarningsIncreasePositive: boolean;

    earningsLast2PeriodIncreasePercentage: number;
    isEarningsLast2PeriodIncreasePositive: boolean;

    totalRevenue: number;
    isTotalRevenuePositive: boolean;

    totalSales: number;
    isTotalSalesPositive: boolean;

    periodData: {
      day: number;
      revenue: number;
      sales: number;
    }[];
  };
}

export interface TopTransactionsApiResponse {
  data: {
    count: number;
    data: {
      amount: number;
      description: string;
      paymentType: number;
      sourceType: number;
      type: number;
      _id: string;
    }[];
  };
}
