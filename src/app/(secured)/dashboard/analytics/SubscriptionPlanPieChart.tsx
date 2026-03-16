"use client";

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { SubscriptionAnalytics } from "@/api/adminPlans";
import { getPieChartOptions } from "./chartOptions";
import Select from "@/components/atoms/Select";

const ReactApexCharts = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface SubscriptionPlanPieChartProps {
  subscriptionAnalytics: SubscriptionAnalytics;
}

interface PlanOption {
  label: string;
  value: string;
}

const SubscriptionPlanPieChart = ({
  subscriptionAnalytics,
}: SubscriptionPlanPieChartProps) => {
  const t = useTranslations("dashboard");
  const { resolvedTheme } = useTheme();

  const [selectedPlanId, setSelectedPlanId] = useState<string>("");

  useEffect(() => {
    if (subscriptionAnalytics.planCounts.length > 0 && !selectedPlanId) {
      setSelectedPlanId(subscriptionAnalytics.planCounts[0]?.planId);
    }
  }, [subscriptionAnalytics.planCounts, selectedPlanId]);

  const selectedPlan = useMemo(
    () =>
      subscriptionAnalytics.planCounts.find(
        (plan) => plan.planId === selectedPlanId,
      ),
    [subscriptionAnalytics.planCounts, selectedPlanId],
  );

  const planOptions = useMemo(
    () =>
      subscriptionAnalytics.planCounts.map((plan) => ({
        label: plan.planName,
        value: plan.planId,
      })),
    [subscriptionAnalytics.planCounts],
  );

  const series = useMemo(() => {
    if (!selectedPlan) return [];
    return [
      selectedPlan.activeSubscriptions,
      selectedPlan.cancelledSubscriptions,
      selectedPlan.pausedSubscriptions,
    ];
  }, [selectedPlan]);

  const hasData = useMemo(() => series.some((val) => val > 0), [series]);

  const labels = useMemo(
    () => [t("activeShort"), t("cancelledShort"), t("pausedShort")],
    [t],
  );

  const chartOptions: ApexOptions = useMemo(
    () => ({
      ...getPieChartOptions(
        false,
        resolvedTheme,
        selectedPlan?.totalSubscriptions.toLocaleString() || "0",
      ),
      labels,
      colors: ["#c97254", "#623022", "#262626"], // Emerald-500, Red-500, Amber-500
      plotOptions: {
        pie: {
          donut: {
            labels: {
              total: {
                label: selectedPlan?.planName || t("total"),
              },
            },
          },
        },
      },
      noData: {
        text: t("noData"),
        align: "center",
        verticalAlign: "middle",
        style: {
          color: resolvedTheme === "dark" ? "#99a1af" : "#000",
          fontSize: "14px",
        },
      },
    }),
    [labels, resolvedTheme, t, selectedPlan],
  );

  return (
    <div className="bg-bgwhite rounded-[20px] border border-bordergray200 p-3 lg:p-6 dark:bg-darkbgprimary dark:border-darkbordercolor1 h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-[1.25rem] lg:text-[1.5rem] font-bold text-textprimary dark:text-bgwhite">
            {t("subscriptionsByPlan")}
          </h3>
          {selectedPlan && (
            <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
              {selectedPlan.planCode}
            </p>
          )}
        </div>

        <div className="w-full sm:w-56">
          <Select<PlanOption>
            value={planOptions.find((opt) => opt.value === selectedPlanId)}
            onChange={(option) => setSelectedPlanId(option?.value || "")}
            options={planOptions}
            isClearable={false}
          />
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[300px]">
        {subscriptionAnalytics.planCounts.length > 0 && hasData ? (
          <div className="w-full">
            <ReactApexCharts
              options={chartOptions}
              series={series}
              type="donut"
              height={350}
            />
          </div>
        ) : (
          <p className="text-sm font-medium text-textparagraph dark:text-textparagraphlight">
            {t("noData")}
          </p>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlanPieChart;
