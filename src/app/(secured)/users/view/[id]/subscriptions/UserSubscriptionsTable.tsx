"use client";

import { useState } from "react";
import {
  CreditCard,
  Calendar,
  Users,
  RefreshCw,
  Clock,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Subscription } from "@/shared/types";
import {
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_OWNER_TYPE,
} from "@/shared/constants";
import FormattedDate from "@/components/atoms/FormattedDate";
import EditSubscriptionModal from "@/components/molecules/subscription/EditSubscriptionModal";

const STATUS_CONFIG: Record<
  number,
  { label: string; bg: string; dot: string }
> = {
  [SUBSCRIPTION_STATUS.ACTIVE]: {
    label: "Active",
    bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    dot: "bg-green-500",
  },
  [SUBSCRIPTION_STATUS.PAST_DUE]: {
    label: "Past Due",
    bg: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
    dot: "bg-orange-500",
  },
  [SUBSCRIPTION_STATUS.CANCELLED]: {
    label: "Cancelled",
    bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    dot: "bg-red-500",
  },
  [SUBSCRIPTION_STATUS.TRIALING]: {
    label: "Trialing",
    bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    dot: "bg-blue-500",
  },
  [SUBSCRIPTION_STATUS.INCOMPLETE]: {
    label: "Incomplete",
    bg: "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700",
    dot: "bg-gray-400",
  },
  [SUBSCRIPTION_STATUS.PAUSED]: {
    label: "Paused",
    bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    dot: "bg-yellow-500",
  },
};

const DEFAULT_STATUS_CONFIG = {
  label: "Unknown",
  bg: "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700",
  dot: "bg-gray-400",
};

interface UserSubscriptionCardProps {
  subscriptions: Subscription[];
}

const InfoItem = ({
  icon: Icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | React.ReactNode;
  valueClassName?: string;
}) => (
  <div className="flex items-start gap-3 px-0 py-2 sm:p-3 rounded-xl bg-gray-50 dark:bg-darkbgsecondary/50">
    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primarycolor/10 dark:bg-secondarycolor/10 flex items-center justify-center">
      <Icon className="w-4 h-4 text-primarycolor dark:text-secondarycolor" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        {label}
      </p>
      <p
        className={`text-sm font-semibold text-textprimary dark:text-sidebartext mt-0.5 ${valueClassName || ""}`}
      >
        {value}
      </p>
    </div>
  </div>
);

const UserSubscriptionCard = ({ subscriptions }: UserSubscriptionCardProps) => {
  const subscription = subscriptions?.[0];
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const t = useTranslations("users");

  if (!subscription) {
    return (
      <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-10 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-darkbgsecondary flex items-center justify-center">
          <CreditCard className="w-8 h-8 text-gray-300 dark:text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-textprimary dark:text-sidebartext mb-1">
          {t("noActiveSubscription")}
        </h3>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          {t("userHasNoSubscription")}
        </p>
      </div>
    );
  }

  const statusConfig =
    STATUS_CONFIG[subscription.status] || DEFAULT_STATUS_CONFIG;
  const autoRenew = subscription.cancelAtPeriodEnd === false;

  return (
    <>
      <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-bordercolor1 dark:border-darkbordercolor1">
          <div className="flex gap-2 sm:items-center justify-between flex-col sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-primarycolor to-primarycolor/70 dark:from-secondarycolor dark:to-secondarycolor/70 flex items-center justify-center shadow-lg shadow-primarycolor/20 dark:shadow-secondarycolor/20">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-textprimary dark:text-sidebartext">
                  {t("subscription")}
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {t("currentPlanDetails")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Edit Button */}
              {/* <button
                onClick={() => setIsEditOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium text-primarycolor dark:text-secondarycolor bg-primarycolor/10 dark:bg-secondarycolor/10 hover:bg-primarycolor/20 dark:hover:bg-secondarycolor/20 transition-all"
              >
                <Pencil className="w-3.5 h-3.5" />
                {t("edit")}
              </button> */}

              {/* Status Badge */}
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-sm font-semibold ${statusConfig.bg}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${statusConfig.dot} animate-pulse`}
                />
                {subscription.statusDisplay || statusConfig.label}
              </div>
            </div>
          </div>
        </div>

        {/* Plan Banner */}
        <div className="px-6 py-5 bg-gradient-to-r from-primarycolor/5 to-transparent dark:from-secondarycolor/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                {t("currentPlan")}
              </p>
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] md:text-2xl font-bold text-textprimary dark:text-sidebartext">
                  {subscription.planName}
                </h2>
                <span className="text-[12px] md:text-sm font-medium text-primarycolor dark:text-secondarycolor bg-primarycolor/10 dark:bg-secondarycolor/10 px-2 py-0.5 rounded-md">
                  {subscription.planCode}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  subscription.billingCycle === 2
                    ? "bg-sidebarlinkcolor text-white"
                    : "bg-sidebarlinkcolor text-white"
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {subscription.billingCycleDisplay || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <InfoItem
              icon={Calendar}
              label={t("startDate")}
              value={
                subscription.startDate ? (
                  <FormattedDate date={subscription.startDate} />
                ) : (
                  "—"
                )
              }
            />
            <InfoItem
              icon={Calendar}
              label={t("endDate")}
              value={
                subscription.endDate ? (
                  <FormattedDate date={subscription.endDate} />
                ) : (
                  "—"
                )
              }
            />
            <InfoItem
              icon={Users}
              label={t("seats")}
              value={String(subscription.seatCount)}
            />
            <InfoItem
              icon={Zap}
              label={t("ownerType")}
              value={
                subscription.ownerTypeDisplay ||
                (subscription.ownerType === SUBSCRIPTION_OWNER_TYPE.ORGANISATION
                  ? t("organisation")
                  : t("user"))
              }
            />
            <InfoItem
              icon={RefreshCw}
              label={t("autoRenew")}
              value={
                <span
                  className={`inline-flex items-center gap-1 ${autoRenew ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}
                >
                  {autoRenew ? t("yes") : t("no")}
                </span>
              }
            />
            <InfoItem
              icon={Clock}
              label={t("joinedOn")}
              value={
                subscription.createdOn ? (
                  <FormattedDate date={subscription.createdOn} />
                ) : (
                  "—"
                )
              }
            />
          </div>
        </div>

        {/* Footer — Stripe Details */}
        {(subscription.customerEmail || subscription.stripeSubscriptionId) && (
          <div className="px-6 py-4 border-t border-bordercolor1 dark:border-darkbordercolor1 bg-gray-50/50 dark:bg-darkbgsecondary/30">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-400 dark:text-gray-500">
              {subscription.customerEmail && (
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-[12px] sm:text-xs">
                    Email:
                  </span>
                  <span className="text-textprimary dark:text-sidebartext font-medium text-[12px] sm:text-xs">
                    {subscription.customerEmail}
                  </span>
                </div>
              )}
              {subscription.stripeSubscriptionId && (
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-[12px] sm:text-xs">
                    Stripe ID:
                  </span>
                  <span className="font-mono text-textprimary dark:text-sidebartext text-[12px] sm:text-xs">
                    {subscription.stripeSubscriptionId}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditSubscriptionModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        subscription={subscription}
        onSuccess={() => router.refresh()}
      />
    </>
  );
};

export default UserSubscriptionCard;
