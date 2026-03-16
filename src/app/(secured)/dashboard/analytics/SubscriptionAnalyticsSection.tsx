"use client";

import { CreditCard, PauseCircle, Users, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import StatCard from "@/components/atoms/StatCard";
import type { SubscriptionAnalytics } from "@/api/adminPlans";

interface SubscriptionAnalyticsSectionProps {
  subscriptionAnalytics: SubscriptionAnalytics;
}

const SubscriptionAnalyticsSection = ({
  subscriptionAnalytics,
}: SubscriptionAnalyticsSectionProps) => {
  const t = useTranslations("dashboard");

  return (
    <div className="space-y-4">
      {/* Subscription Analytics Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("totalSubscriptions")}
          value={subscriptionAnalytics.totalSubscriptions.toLocaleString()}
          icon={
            <CreditCard className="w-6 h-6 text-bgwhite dark:text-white/80" />
          }
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("activeSubscriptions")}
          value={subscriptionAnalytics.totalActiveSubscriptions.toLocaleString()}
          icon={<Users className="w-6 h-6 text-bgwhite dark:text-white/80" />}
          color="bg-primarycolor dark:bg-secondarycolor"
        />
        <StatCard
          title={t("cancelledSubscriptions")}
          value={subscriptionAnalytics.totalCancelledSubscriptions.toLocaleString()}
          icon={<XCircle className="w-6 h-6 text-bgwhite dark:text-white/80" />}
          color="bg-red-500"
        />
        <StatCard
          title={t("pausedSubscriptions")}
          value={subscriptionAnalytics.totalPausedSubscriptions.toLocaleString()}
          icon={
            <PauseCircle className="w-6 h-6 text-bgwhite dark:text-white/80" />
          }
          color="bg-amber-500"
        />
      </div>

      {/* Subscriptions by Plan */}
      <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-textprimary dark:text-sidebartext">
              {t("subscriptionsByPlan")}
            </h3>
            <p className="mt-1 text-xs text-textparagraph dark:text-textparagraphlight">
              {t("subscriptionsByPlanSubtitle")}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-bordercolor1 dark:border-darkbordercolor1 px-3 py-1 text-[11px] font-medium text-textparagraph dark:text-textparagraphlight bg-bglight dark:bg-darkbgbase">
            {t("total")}{" "}
            <span className="font-semibold">
              {subscriptionAnalytics.totalSubscriptions.toLocaleString()}
            </span>
          </span>
        </div>

        {subscriptionAnalytics.planCounts.length === 0 ? (
          <p className="text-xs text-textparagraph dark:text-textparagraphlight">
            {t("noData")}
          </p>
        ) : (
          <div className="space-y-3">
            {subscriptionAnalytics.planCounts.map((plan) => (
              <div
                key={plan.planId}
                className="flex flex-col gap-2 rounded-xl border border-bordercolor1 dark:border-darkbordercolor1 p-3 bg-bglight dark:bg-darkbgbase/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-textprimary dark:text-sidebartext truncate">
                      {plan.planName}{" "}
                      <span className="text-[11px] text-textparagraph dark:text-textparagraphlight">
                        ({plan.planCode})
                      </span>
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full w-10 h-10 rounded-xl flex items-center justify-center bg-primarycolor/10 text-primarycolor dark:bg-secondarycolor/15 dark:text-primarycolor">
                    {plan.totalSubscriptions.toLocaleString()}{" "}
                    {t("subscriptionsShort")}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {t("activeShort")}{" "}
                    {plan.activeSubscriptions.toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {t("cancelledShort")}{" "}
                    {plan.cancelledSubscriptions.toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {t("pausedShort")}{" "}
                    {plan.pausedSubscriptions.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-[11px] text-textparagraph dark:text-textparagraphlight">
                  <span>
                    {t("monthlyBilling")}:{" "}
                    <span className="font-semibold">
                      {plan.monthlyBillingCount.toLocaleString()}
                    </span>
                  </span>
                  <span>
                    {t("yearlyBilling")}:{" "}
                    <span className="font-semibold">
                      {plan.yearlyBillingCount.toLocaleString()}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionAnalyticsSection;
