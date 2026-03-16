"use client";

import { useState } from "react";
import {
  Check,
  Crown,
  Building2,
  Briefcase,
  Sparkles,
  Pencil,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Plan, PlanPrice } from "@/shared/types";
import {
  PlanType,
  BILLING_CYCLE,
  BILLING_CYCLE_LABELS,
} from "@/shared/constants";
import { TEXT_PRIMARY_DARK as TEXT_PRIMARY } from "@/shared/styles";
import EditPlanPriceModal from "@/components/molecules/plans/EditPlanPriceModal";
import { formatPrice } from "@/shared/utils";

const PLAN_GRADIENT_MAP: Record<number, string> = {
  [PlanType.INDIVIDUAL]: "from-primarycolor/10 to-primarycolor/5",
  [PlanType.ORGANISATION]: "from-primarycolor/15 to-primarycolor/5",
  [PlanType.ENTERPRISE]: "from-primarycolor/20 to-primarycolor/8",
};

const PLAN_ACCENT = "text-primarycolor dark:text-white";

const PLAN_BADGE_MAP: Record<number, string> = {
  [PlanType.INDIVIDUAL]:
    "w-10 h-10 rounded-xl flex items-center justify-center bg-primarycolor/10 text-primarycolor dark:bg-secondarycolor/15 dark:text-primarycolor",
  [PlanType.ORGANISATION]:
    "bg-primarycolor/15 text-primarycolor dark:bg-secondarycolor/20 dark:text-primarycolor",
  [PlanType.ENTERPRISE]:
    "bg-primarycolor/20 text-primarycolor dark:bg-secondarycolor/25 dark:text-primarycolor",
};

const PLAN_CHECK =
  "w-10 h-10 rounded-xl flex items-center justify-center bg-primarycolor/10 text-primarycolor dark:bg-secondarycolor/15 dark:text-primarycolor";

const PLAN_ICON_MAP: Record<number, typeof Crown> = {
  [PlanType.INDIVIDUAL]: Sparkles,
  [PlanType.ORGANISATION]: Building2,
  [PlanType.ENTERPRISE]: Briefcase,
};

const PLAN_BORDER_MAP: Record<number, string> = {
  [PlanType.INDIVIDUAL]: "border-bordercolor1 dark:border-darkbordercolor1",
  [PlanType.ORGANISATION]:
    "border-primarycolor/30 dark:border-secondarycolor/30",
  [PlanType.ENTERPRISE]: "border-primarycolor/40 dark:border-secondarycolor/40",
};

interface EditingPrice {
  price: PlanPrice;
  planName: string;
}

interface PlansViewProps {
  plans: Plan[];
}

const PlansView = ({ plans }: PlansViewProps) => {
  const router = useRouter();
  const [editingPrice, setEditingPrice] = useState<EditingPrice | null>(null);
  const t = useTranslations("plans");

  const getFeatureLabel = (
    displayName: string,
    defaultValue: number | null,
  ): string => {
    if (defaultValue === null) return `${displayName} (${t("unlimited")})`;
    return `${displayName} (${defaultValue})`;
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primarycolor to-primarycolor/70 dark:from-secondarycolor dark:to-secondarycolor/70 flex items-center justify-center shadow-lg shadow-primarycolor/20 dark:shadow-secondarycolor/20">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2
              className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
            >
              {t("Plans")}
            </h2>
            <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
              {t("All available subscription plans")}
            </p>
          </div>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {plans.map((plan) => {
          const planType = plan.planType;
          const gradient =
            PLAN_GRADIENT_MAP[planType] ||
            PLAN_GRADIENT_MAP[PlanType.INDIVIDUAL];
          const badgeStyle =
            PLAN_BADGE_MAP[planType] || PLAN_BADGE_MAP[PlanType.INDIVIDUAL];
          const borderStyle =
            PLAN_BORDER_MAP[planType] || PLAN_BORDER_MAP[PlanType.INDIVIDUAL];
          const IconComponent = PLAN_ICON_MAP[planType] || Sparkles;
          const defaultPrice =
            plan.prices.find((p) => p.isDefault) || plan.prices[0];
          const isFreePlan = defaultPrice?.price === 0;
          const hasMultiplePrices = plan.prices.length > 1;

          return (
            <div
              key={plan.id}
              className={`bg-bgwhite dark:bg-darkbgprimary rounded-2xl border overflow-hidden flex flex-col hover:shadow-lg hover:shadow-primarycolor/5 dark:hover:shadow-secondarycolor/5 transition-all duration-300 ${borderStyle}`}
            >
              {/* Card Header */}
              <div
                className={`p-4 3xl:px-5 3xl:pt-5 3xl:pb-4 bg-gradient-to-br ${gradient}`}
              >
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${badgeStyle}`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* {plan.isEnterprise && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primarycolor/15 text-primarycolor dark:bg-primarycolor/20 dark:text-white">
                        {t("Enterprise")}
                      </span>
                    )}
                    {!plan.isSelfServe && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-white">
                        {t("Contact Sales")}
                      </span>
                    )} */}
                    {plan.prices.length > 0 && !isFreePlan && (
                      <button
                        onClick={() =>
                          setEditingPrice({
                            price: defaultPrice || plan.prices[0],
                            planName: plan.name,
                          })
                        }
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-primarycolor dark:hover:text-secondarycolor hover:bg-primarycolor/10 dark:hover:bg-secondarycolor/10 transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-textprimary dark:text-sidebartext">
                  {plan.name}
                </h3>
                <span
                  className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md mt-1 ${badgeStyle}`}
                >
                  {plan.code}
                </span>
              </div>

              {/* Pricing Section */}
              <div className="p-4 3xl:px-5 3xl:py-4 border-b border-bordercolor1 dark:border-darkbordercolor1">
                {defaultPrice ? (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-3xl font-extrabold ${PLAN_ACCENT}`}
                      >
                        {formatPrice(defaultPrice).amount}
                      </span>
                      <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                        {formatPrice(defaultPrice).cycle}
                      </span>
                    </div>
                    {hasMultiplePrices && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {plan.prices.map((p) => {
                          const priceInfo = formatPrice(p);
                          const cycleLabel =
                            BILLING_CYCLE_LABELS[
                              p.billingCycle as BILLING_CYCLE
                            ] || t("Other");
                          return (
                            <span
                              key={p.planPricingId}
                              className={`text-[11px] font-medium px-2 py-0.5 rounded-md !w-auto !h-auto ${
                                p.isDefault
                                  ? badgeStyle
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                              }`}
                            >
                              {cycleLabel}: {priceInfo.amount}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <span className={`text-3xl font-extrabold ${PLAN_ACCENT}`}>
                      —
                    </span>
                  </div>
                )}
              </div>

              {/* Features List */}
              <div className="p-4 3xl:px-5 3xl:py-4 flex-1">
                <p className="text-[12px] font-semibold text-gray-400 dark:text-white uppercase tracking-wider mb-3">
                  {t("Features", { count: plan.features.length })}
                </p>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature.id} className="flex items-start gap-2.5">
                      <span
                        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${PLAN_CHECK}`}
                      >
                        <Check className="w-3 h-3" />
                      </span>
                      <span className="text-sm text-textprimary dark:text-sidebartext/80 leading-snug">
                        {getFeatureLabel(
                          feature.displayName,
                          feature.defaultValue,
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {plans.length === 0 && (
        <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-darkbgsecondary flex items-center justify-center">
            <Crown className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-textprimary dark:text-sidebartext mb-1">
            {t("No Plans Found")}
          </h3>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {t("No plans available message")}
          </p>
        </div>
      )}

      {/* Edit Price Modal */}
      {editingPrice && (
        <EditPlanPriceModal
          isOpen={!!editingPrice}
          onClose={() => setEditingPrice(null)}
          price={editingPrice.price}
          planName={editingPrice.planName}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
};

export default PlansView;
