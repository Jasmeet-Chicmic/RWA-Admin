"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "react-toastify";

import {
  cancelUserSubscriptionAction,
  upgradeUserPlanAction,
} from "@/api/user";
import Button from "@/components/atoms/Button";
import {
  SUBSCRIPTION_PURCHASE_TYPE,
  SUBSCRIPTION_PURCHASE_TYPE_NAMES,
} from "@/shared/constants";
import { SubscriptionPlan, UserSubscription } from "@/shared/types";

import CustomModal from "../../CustomModal";

const PlanUpgradeModal = ({
  currentPlan,
  subscriptionPlans,
}: {
  currentPlan?: UserSubscription;
  subscriptionPlans: SubscriptionPlan[];
}) => {
  console.log(currentPlan, "currentPlan");
  const router = useRouter();
  const [isLoading, startTransition] = useTransition();
  const [subType, setSubType] = useState<SUBSCRIPTION_PURCHASE_TYPE>(
    SUBSCRIPTION_PURCHASE_TYPE.MONTHLY,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(currentPlan?._id);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSelectedPlan(e.target.value);

  const handlePlanUpgrade = () => {
    startTransition(async () => {
      const res = await upgradeUserPlanAction({
        userId: currentPlan?.userId || "",
        subscriptionPlanId: selectedPlan || "",
        subscriptionPurchaseType: subType,
      });
      if (res.status) {
        toast.success("Plan upgraded successfully");
        handleClose();
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleCancelSubscription = () => {
    startTransition(async () => {
      const res = await cancelUserSubscriptionAction({
        userId: currentPlan?.userId || "",
      });
      if (res.status) {
        toast.success("Subscription cancelled successfully");
        handleClose();
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div>
      <Button variant="primary" type="button" onClick={handleOpen}>
        Upgrade Plan
      </Button>
      <CustomModal isOpen={isOpen} onClose={handleClose}>
        <div className="p-8 min-w-[400px] max-w-[500px]">
          <h1 className="text-3xl font-bold text-center mb-2 dark:text-sidebartext">
            Upgrade Plan
          </h1>
          <p className="text-center bordercolor1 mb-6 dark:text-sidebartext">
            Choose the best plan for user.
          </p>
          <div className="mb-6">
            <label
              htmlFor="plan-select"
              className="block text-sm font-medium mb-2 dark:text-sidebartext"
            >
              Choose Plan
            </label>
            <div>
              <input
                type="radio"
                name="subType"
                id="monthly"
                checked={subType === SUBSCRIPTION_PURCHASE_TYPE.MONTHLY}
                onChange={() => setSubType(SUBSCRIPTION_PURCHASE_TYPE.MONTHLY)}
              />
              <label htmlFor="monthly" className="dark:text-sidebartext">
                Monthly
              </label>
            </div>
            <div>
              <input
                type="radio"
                name="subType"
                id="yearly"
                checked={subType === SUBSCRIPTION_PURCHASE_TYPE.YEARLY}
                onChange={() => setSubType(SUBSCRIPTION_PURCHASE_TYPE.YEARLY)}
              />
              <label htmlFor="yearly" className="dark:text-sidebartext">
                Yearly
              </label>
            </div>
            <div className="flex gap-3 items-center">
              <select
                id="plan-select"
                className="border rounded px-3 py-2 min-w-[250px] dark:bg-darkbgprimary dark:border-darkbordercolor1 dark:text-sidebartext"
                value={selectedPlan}
                onChange={handlePlanChange}
              >
                {subscriptionPlans.map((plan) => (
                  <option key={plan._id} value={plan._id}>
                    {plan.name} -{" "}
                    {`($${subType === SUBSCRIPTION_PURCHASE_TYPE.MONTHLY ? plan.monthlyPrice : plan.yearlyPrice} / ${SUBSCRIPTION_PURCHASE_TYPE_NAMES[subType]})`}
                  </option>
                ))}
              </select>
              <Button
                variant="primary"
                type="button"
                onClick={handlePlanUpgrade}
                isLoading={isLoading}
              >
                Upgrade
              </Button>
            </div>
          </div>
          <hr className="my-6" />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-500 mb-1 dark:text-sidebartext">
                User current plan is {currentPlan?.subscriptionPlan.name} plan
              </div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-indigo-600">
                  $
                  {currentPlan?.subscriptionPurchaseType ===
                  SUBSCRIPTION_PURCHASE_TYPE.MONTHLY
                    ? currentPlan?.subscriptionPlan.monthlyPrice
                    : currentPlan?.subscriptionPlan.yearlyPrice}
                </span>
                <span className="bordercolor1 mb-1 dark:text-sidebartext">
                  /month
                </span>
              </div>
            </div>
            <Button
              variant="danger"
              type="button"
              className="bg-red-100 text-red-500 hover:bg-red-200 px-6 py-2 dark:bg-red-600 dark:text-sidebartext"
              isLoading={isLoading}
              onClick={handleCancelSubscription}
            >
              Cancel Subscription
            </Button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default PlanUpgradeModal;
