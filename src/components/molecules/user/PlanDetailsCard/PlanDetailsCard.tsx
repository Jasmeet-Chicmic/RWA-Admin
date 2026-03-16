import { differenceInDays } from "date-fns";

import { API_END_POINTS } from "@/shared/api";
import { SUBSCRIPTION_PURCHASE_TYPE } from "@/shared/constants";
import { getRequest } from "@/shared/fetcher";
import { SubscriptionPlan, User, UserSubscription } from "@/shared/types";

import PlanUpgradeModal from "./PlanUpgradeModal";

const PlanDetailsCard = async ({
  currentSubscription,
}: {
  userData: User;
  currentSubscription?: UserSubscription;
}) => {
  const {
    data: { data: subscriptionPlans },
  } = await getRequest<{
    data: {
      data: SubscriptionPlan[];
      count: number;
    };
  }>(API_END_POINTS.SUBSCRIPTION_PLANS);
  console.log(currentSubscription, "ajsndjkansdjk");
  return (
    <div
      className="border border-indigo-400 rounded-lg p-6 shadow-sm space-y-4 bg-bgwhite mt-3 dark:bg-darkbgprimary dark:border-darkbordercolor1"
      style={{
        width: "100%",
        borderColor: currentSubscription?.subscriptionPlan.color,
      }}
    >
      <span
        className="text-[0.875] font-medium bg-indigo-100 text-indigo-600 px-2 py-1 rounded dark:bg-darkbgprimary dark:text-sidebartext"
        style={{
          backgroundColor: currentSubscription?.subscriptionPlan.color + "30",
          color: currentSubscription?.subscriptionPlan.color,
        }}
      >
        {currentSubscription?.subscriptionPlan.name}
      </span>

      <div
        className="text-indigo-600 text-4xl font-bold text-end dark:text-sidebartext"
        style={{
          color: currentSubscription?.subscriptionPlan.color,
        }}
      >
        $
        {currentSubscription?.subscriptionPurchaseType ===
        SUBSCRIPTION_PURCHASE_TYPE.MONTHLY
          ? currentSubscription?.subscriptionPlan.monthlyPrice
          : currentSubscription?.subscriptionPlan.yearlyPrice}
        <span className="text-base text-gray-600 font-medium dark:text-sidebartext">
          /
          {currentSubscription?.subscriptionPurchaseType ===
          SUBSCRIPTION_PURCHASE_TYPE.MONTHLY
            ? "month"
            : "year"}
        </span>
      </div>

      <ul className="text-sm text-labelprimary space-y-1 dark:text-sidebartext">
        {currentSubscription?.subscriptionPlan.features.map((feature) => (
          <li className="flex items-center gap-2" key={feature}>
            <span className="h-2 w-2 bg-gray-400 rounded-full"></span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-4 text-sm text-gray-600 dark:text-sidebartext">
        <div className="flex justify-between mb-1 font-medium">
          <span>Days</span>
          <span>
            {differenceInDays(
              new Date(currentSubscription?.endDate || ""),
              new Date(),
            )}{" "}
            of{" "}
            {differenceInDays(
              new Date(currentSubscription?.endDate || ""),
              new Date(currentSubscription?.startDate || ""),
            )}{" "}
            Days
          </span>
        </div>

        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="bg-indigo-500 h-full w-[86.66%]"
            style={{
              width: `${
                (differenceInDays(
                  new Date(currentSubscription?.endDate || ""),
                  new Date(),
                ) /
                  differenceInDays(
                    new Date(currentSubscription?.endDate || ""),
                    new Date(currentSubscription?.startDate || ""),
                  )) *
                100
              }%`,
              backgroundColor: currentSubscription?.subscriptionPlan.color,
            }}
          ></div>
        </div>

        <p className="mt-1 text-[0.875rem] text-sidebartext dark:text-sidebartext">
          {differenceInDays(
            new Date(currentSubscription?.endDate || ""),
            new Date(),
          )}{" "}
          days remaining
        </p>
      </div>
      <PlanUpgradeModal
        currentPlan={currentSubscription}
        subscriptionPlans={subscriptionPlans}
      />
    </div>
  );
};
export default PlanDetailsCard;
