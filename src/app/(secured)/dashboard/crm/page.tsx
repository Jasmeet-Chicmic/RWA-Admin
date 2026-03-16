import React from "react";
import { CreditCard } from "lucide-react";

import AreaChart from "@/components/molecules/Charts/AreaChart";
import ListingCard from "@/components/molecules/ListingCard";
import RadarChart from "@/components/molecules/Charts/RadarChart";
import CardStatsVertical from "@/components/molecules/CardStatics/CardStatsVertical";
import EarningReportCard from "@/components/molecules/EarningReport/EarningReportChart";
import ProjectStatusCard from "@/components/molecules/Dashboard/ProjectStatus";

import {
  fetchAverageDailySales,
  fetchEarningsReport,
  fetchSalesByCountry,
  fetchTopTransactions,
} from "@/api/dashboard";
import { LISTING_CARD_TYPES } from "@/components/molecules/ListingCard/helpers/types";
import {
  LISTING_OPTION_VALUES,
  LISTING_OPTIONS,
} from "@/components/molecules/PopularProducts/helpers/types";
interface CrmPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getFirstParam<T>(param: T | T[] | undefined, defaultValue: T): T {
  if (Array.isArray(param)) return param[0];
  if (param !== undefined) return param;
  return defaultValue;
}

const Crm = async ({ searchParams }: CrmPageProps) => {
  const searchParamsObj = await searchParams;
  const topTransactionsFilter = getFirstParam(
    searchParamsObj?.topTransactions,
    String(LISTING_OPTION_VALUES.THIS_WEEK),
  );

  const topTransactionDuration = (() => {
    switch (topTransactionsFilter) {
      case String(LISTING_OPTION_VALUES.THIS_WEEK):
        return "Week";
      case String(LISTING_OPTION_VALUES.LAST_MONTH):
        return "Last Month";
      case String(LISTING_OPTION_VALUES.LAST_YEAR):
        return "Last Year";
      default:
        return "Week";
    }
  })();

  // Fetch all dashboard data
  const [dailySales, earningsReport, salesByCountry, topTransactions] =
    await Promise.all([
      fetchAverageDailySales(),
      fetchEarningsReport(),
      fetchSalesByCountry(),
      fetchTopTransactions({
        filterType: topTransactionsFilter,
        skip: 0,
        limit: 7,
      }),
    ]);

  return (
    <div className="p-0 mt-[20px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-h-fit">
        {/* Area Charts */}
        <AreaChart
          config={{
            title: "Orders",
            subtitle: "Last Year",
            value: "1,500",
            change: "+12.5%",
            changeColor: "text-green-600",
            color: "#3b82f6",
            series: dailySales.series,
          }}
        />
        <AreaChart
          config={{
            title: "Sales",
            subtitle: "Last 6 Months",
            value: "₹175K",
            change: "-17.3%",
            changeColor: "text-red-600",
            color: "#22c55e",
            series: dailySales.series,
          }}
        />
        {/* Stats Cards */}
        <CardStatsVertical
          stats="1.28k"
          title="Total Profit"
          subtitle="Last week"
          chipText="-12.2%"
          avatarIcon={<CreditCard />}
          avatarColor="bg-red-100 text-red-600"
          chipColor="bg-red-100 text-red-600"
        />
        <CardStatsVertical
          stats="2.15k"
          title="Total Revenue"
          subtitle="Last week"
          chipText="+18.4%"
          avatarIcon={<CreditCard />}
          avatarColor="bg-green-100 text-green-600"
          chipColor="bg-green-100 text-green-600"
        />

        <div className="col-span-full md:col-span-2 h-full">
          <EarningReportCard
            title="Revenue Growth"
            subtitle="Weekly Report"
            series={earningsReport.series}
            type="crm"
          />
        </div>

        <div className="col-span-full md:col-span-2 h-full">
          <ProjectStatusCard />
        </div>

        <div className="col-span-full grid grid-cols-full md:grid-cols-2 xl:grid-cols-3 gap-6 mb-[10px]">
          <ListingCard
            title="Sales by Countries"
            subtitle="Monthly Sales Overview"
            data={salesByCountry.items}
            menuOptions={LISTING_OPTIONS}
            listingCardType={LISTING_CARD_TYPES.SALES}
            filterKeyName="salesByCountry"
          />

          {/* Radar Chart */}
          <RadarChart
            config={{
              title: "Sales",
              subtitle: "Last 6 Months",
              series: [
                { name: "Sales", data: [32, 27, 27, 30, 25, 25] },
                { name: "Visits", data: [25, 35, 20, 20, 20, 20] },
              ],
              labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
              color: "#3b82f6",
              secondaryColor: "#06b6d4",
            }}
          />

          <ListingCard
            title="Top Transactions"
            subtitle={`Total ${topTransactions.total || 0} Transactions done in this ${topTransactionDuration}`}
            data={
              Array.isArray(topTransactions?.transactions)
                ? topTransactions.transactions
                : []
            }
            menuOptions={LISTING_OPTIONS}
            listingCardType={LISTING_CARD_TYPES.TRANSACTION}
            filterKeyName="topTransactions"
          />
        </div>
      </div>
    </div>
  );
};

export default Crm;
