import React from "react";
import {
  BookCheck,
  CheckCircle,
  Clock4,
  CreditCard,
  DollarSign,
  Link,
  RussianRuble,
  ShoppingCart,
  Ticket,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { GRAPHICS_TYPES } from "@/components/molecules/ListingCard/helpers/types";
import {
  AnalyticsApiResponse,
  AverageSalesApiResponse,
  SalesOverviewApiResponse,
  EarningsReportApiResponse,
  SupportTicketsApiResponse,
  SalesByCountryApiResponse,
  TotalEarningsApiResponse,
  TopTransactionsApiResponse,
} from "../types/api";
import {
  formatMsToReadableDuration,
  formatNumberValue,
  getTransactionSourceDetails,
} from "../utils";
import { TRANSACTION_SOURCE_TYPES, TRANSACTION_TYPES } from "../constants";

export const transformWebSiteAnalyticsData = (data: AnalyticsApiResponse) => {
  const dataArray = [
    {
      title: "Traffic",
      img: "/images/dummy/graphic-illustration-1.png",
      details: {
        Sessions: formatNumberValue(data.data.totalSessions),
        "Page Views": formatNumberValue(data.data.totalViews),
        Leads: formatNumberValue(data.data.totalLeads),
        Conversions: formatNumberValue(data.data.totalConversions),
      },
    },
    {
      title: "Spending",
      img: "/images/dummy/graphic-illustration-2.png",
      details: {
        Spend: `$${data.data.totalSpend.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        Orders: formatNumberValue(data.data.totalOrders),
        "Avg Order": formatNumberValue(data.data.averageItems),
        Items: formatNumberValue(data.data.totalItems),
      },
    },
    {
      title: "Revenue Sources",
      img: "/images/dummy/graphic-illustration-3.png",
      details: {
        Direct: formatNumberValue(data.data.directRevenue),
        Organic: formatNumberValue(data.data.organicRevenue),
        Referral: formatNumberValue(data.data.referralRevenue),
        Campaign: formatNumberValue(data.data.campaignRevenue),
      },
    },
  ];
  return dataArray;
};

export const transformAverageSalesData = (data: AverageSalesApiResponse) => ({
  title: "Average Daily Sales",
  subtitle: "Total Sales This Month",
  changeColor: "text-red-600",
  color: "#22c55e",
  series: [{ data: data.data.monthData.map((item) => item.averageSales) }],
  totalValue: `$${data.data.totalSales ? data.data.totalSales.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0.00"}`,
});

export const transformSalesOverviewData = (data: SalesOverviewApiResponse) => ({
  title: "Sales Overview",
  changeInPercent: data.data.salesIncreasePercentage,
  totalValue: `$${formatNumberValue(data.data.currentMonthOrderAmount)}`,
  series: [
    {
      label: "Order",
      icon: (
        <div className="bg-cyan-100 p-1 rounded-md">
          <ShoppingCart size={18} className="text-cyan-500" />
        </div>
      ),
      percent: data.data.ordersIncreasePercentage,
      value: data.data.currentMonthOrders,
      color: "bg-cyan-500",
    },
    {
      label: "Visits",
      icon: (
        <div className="bg-violet-100 p-1 rounded-md">
          <Link size={18} className="text-violet-500" />
        </div>
      ),
      percent: data.data.visitsIncreasePercentage,
      value: data.data.currentMonthVisits,
      color: "bg-violet-500",
    },
  ],
});

// Earning Report
export const transformEarningsReportData = (
  data: EarningsReportApiResponse,
) => ({
  title: "Earning Reports",
  subtitle: "Weekly Earnings Overview",
  stats: [
    {
      label: "Earnings",
      value: `$${formatNumberValue(data.data.currentWeekRevenue)}`,
      icon: <DollarSign size={16} />,
      color: "text-violet-500 bg-lightpurple bg-opacity-30",
      barColor: "bg-violet-500",
    },
    {
      label: "Profit",
      value: `$${formatNumberValue(data.data.currentWeekProfit)}`,
      icon: <TrendingUp size={16} />,
      color: "text-cyan-500 bg-lightgreen bg-opacity-30",
      barColor: "bg-cyan-500",
    },
    {
      label: "Expense",
      value: `$${formatNumberValue(data.data.currentWeekExpenses)}`,
      icon: <Wallet size={16} />,
      color: "text-rose-500 bg-lightred bg-opacity-30",
      barColor: "bg-rose-500",
    },
  ],
  series: [
    {
      name: "Earnings",
      data: data.data.weeklyEarnings.map((item) => item.earnings),
    },
  ],
});

// Support Tracker
export const transformSupportTicketsData = (
  data: SupportTicketsApiResponse,
) => ({
  title: "Support Tracker",
  subtitle: "Last 7 Days",
  totalCount: `${formatNumberValue(data.data.totalTickets)}`,
  progressPercent: data.data.completedPercentage,
  stats: [
    {
      icon: <Ticket size={20} />,
      label: "New Tickets",
      value: formatNumberValue(data.data.newTickets),
      colorClass: "text-violet-500 bg-lightpurple bg-opacity-30",
    },
    {
      icon: <CheckCircle size={20} />,
      label: "Open Tickets",
      value: formatNumberValue(data.data.openTickets),
      colorClass: "text-cyan-500 bg-lightgreen bg-opacity-30",
    },
    {
      icon: <Clock4 size={20} />,
      label: "Response Time",
      value: formatMsToReadableDuration(data.data.responseTime),
      colorClass: "text-orange-400 bg-lightred bg-opacity-30",
    },
  ],
});

// Sales By Country
export const transformSalesByCountryData = (
  data: SalesByCountryApiResponse,
) => ({
  items: data.data.map((item) => ({
    name: `$${formatNumberValue(item.totalSales)}`,
    subTitle: item.country,
    price: formatNumberValue(item.salesIncreasePercentage),
    isNegative: !item.isPositive,
    imgSrc: `https://flagcdn.com/${item.countryCode.toLowerCase()}.svg`,
    display: GRAPHICS_TYPES.IMAGE,
  })),
});

// Total Earning
export const transformTotalEarningsData = (data: TotalEarningsApiResponse) => ({
  percentage: data.data.earningsIncreasePercentage.toFixed(2),
  change: data.data.earningsIncreasePercentage.toFixed(2),
  series: [
    {
      name: "Current",
      data: data.data.periodData.map((item) => item.revenue),
    },
    {
      name: "Previous",
      data: data.data.periodData.map((item) => item.sales),
    },
  ],
  stats: [
    {
      icon: <CreditCard className="text-violet-500" size={18} />,
      label: "Total Revenue",
      subLabel: "Client Payment",
      value: `$+${formatNumberValue(data.data.totalRevenue)}`,
      valueColor: "text-green-500",
      bgColor: "bg-violet-100",
    },
    {
      icon: <DollarSign className="bordercolor1" size={18} />,
      label: "Total Sales",
      subLabel: "Refund",
      value: `$+${formatNumberValue(data.data.totalSales)}`,
      valueColor: "text-green-500",
      bgColor: "bg-gray-100",
    },
  ],
});

// Top Transactions
export const transformTopTransactionsData = (
  data: TopTransactionsApiResponse,
) => ({
  total: data.data.count,
  transactions: data.data.data.map((item) => {
    const source = getTransactionSourceDetails(item.sourceType);
    const icons = {
      [TRANSACTION_SOURCE_TYPES.WALLET]: (
        <div className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-[0.875] font-medium text-purple-500 ring-1 ring-purple-500/10 ring-inset">
          <Wallet size={24} />
        </div>
      ),
      [TRANSACTION_SOURCE_TYPES.BANK_TRANSFER]: (
        <div className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-[0.875] font-medium text-green-500 ring-1 ring-green-500/10 ring-inset">
          <BookCheck size={24} />
        </div>
      ),
      [TRANSACTION_SOURCE_TYPES.PAYPAL]: (
        <div className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-[0.875] font-medium text-red-500 ring-1 ring-red-500/10 ring-inset">
          <RussianRuble size={24} />
        </div>
      ),
      [TRANSACTION_SOURCE_TYPES.CARD]: (
        <div className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-[0.875] font-medium text-gray-500 ring-1 ring-gray-500/10 ring-inset">
          <CreditCard size={24} />
        </div>
      ),
      [TRANSACTION_SOURCE_TYPES.BANK_TRANSACTION]: (
        <div className="inline-flex items-center rounded-md bg-sky-50 px-2 py-1 text-[0.875] font-medium text-sky-500 ring-1 ring-sky-500/10 ring-inset">
          <DollarSign size={24} />
        </div>
      ),
    };
    return {
      name: source,
      subTitle: item.description,
      price: `$${formatNumberValue(item.amount)}`,
      isNegative: item.type === TRANSACTION_TYPES.DEBIT,
      icon: icons[item.sourceType as unknown as keyof typeof icons],
      display: GRAPHICS_TYPES.ICON,
    };
  }),
});
