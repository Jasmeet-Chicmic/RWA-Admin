"use client";

import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import CustomModal from "@/components/molecules/CustomModal/CustomModal";
import { adjustPlanPricingAction } from "@/api/adminPlans";
import { PlanPrice } from "@/shared/types";
import { BILLING_CYCLE } from "@/shared/constants";
import { formatToFixed } from "@/shared/utils/unitUtils";

interface EditPlanPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  price: PlanPrice;
  planName: string;
  onSuccess: () => void;
}

import { formatPrice, getCurrencySymbol } from "@/shared/utils";

const EditPlanPriceModal = ({
  isOpen,
  onClose,
  price,
  planName,
  onSuccess,
}: EditPlanPriceModalProps) => {
  const [percentage, setPercentage] = useState<number | string>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("plans");

  const numericPercentage = useMemo(
    () => (percentage === "" ? 0 : Number(percentage)),
    [percentage],
  );
  const isIncrease = useMemo(() => numericPercentage > 0, [numericPercentage]);
  const isDecrease = useMemo(() => numericPercentage < 0, [numericPercentage]);

  const currentPrice = useMemo(() => price.price, [price.price]);
  const newPrice = useMemo(
    () => currentPrice + (currentPrice * numericPercentage) / 100,
    [currentPrice, numericPercentage],
  );
  const { amount: currentPriceFormatted } = useMemo(
    () => formatPrice(price),
    [price],
  );
  const currencySymbol = useMemo(
    () => getCurrencySymbol(price.currency),
    [price.currency],
  );

  const getBillingCycleLabel = (cycle: number) => {
    switch (cycle) {
      case BILLING_CYCLE.MONTHLY:
        return t("Monthly");
      case BILLING_CYCLE.YEARLY:
        return t("Yearly");
      default:
        return String(cycle) || "—";
    }
  };

  const cycleLabel = useMemo(
    () => getBillingCycleLabel(Number(price.billingCycle)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [price.billingCycle, t],
  );

  const handleSubmit = async () => {
    if (percentage === "" || numericPercentage === 0) {
      toast.error(t("Please enter a non-zero percentage"));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adjustPlanPricingAction({
        planPricingId: price.planPricingId,
        increaseOrDecreasePercentage: numericPercentage,
      });

      if (res.status) {
        toast.success(t("Plan pricing adjusted successfully"));
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || t("Failed to adjust pricing"));
      }
    } catch {
      toast.error(t("An error occurred"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    "w-full px-3 py-2.5 rounded-xl border border-bordercolor1 dark:border-darkbordercolor1 bg-bgwhite dark:bg-darkbgsecondary text-textprimary dark:text-sidebartext text-sm focus:outline-none focus:ring-2 focus:ring-primarycolor/30 dark:focus:ring-secondarycolor/30 transition-all";

  const labelClassName =
    "block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5";

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("Adjust Plan Price")}
      size="md"
    >
      <div className="space-y-5">
        {/* Plan & Price Info */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primarycolor/5 dark:bg-secondarycolor/5 border border-primarycolor/10 dark:border-secondarycolor/10">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-textprimary dark:text-sidebartext">
              {planName}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {cycleLabel} &middot; {t("Current price")}:{" "}
              <span className="font-semibold text-primarycolor dark:text-secondarycolor">
                {currentPriceFormatted}
              </span>
            </p>
          </div>
        </div>

        {/* Percentage Input */}
        <div>
          <label className={labelClassName}>
            {t("Increase / Decrease Percentage")}
          </label>
          <div className="relative">
            <input
              type="number"
              value={percentage}
              onChange={(e) =>
                setPercentage(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              placeholder={t("Percentage placeholder")}
              className={inputClassName}
            />
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
            {t("Percentage positive info")}
          </p>
        </div>

        {/* Preview */}
        {numericPercentage !== 0 && (
          <div
            className={`p-3 rounded-xl border ${
              isIncrease
                ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800/30"
                : isDecrease
                  ? "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800/30"
                  : "bg-gray-50 border-gray-200 dark:bg-gray-800/20 dark:border-gray-700"
            }`}
          >
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              {t("New Price Preview")}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-gray-400 dark:text-gray-500 text-sm line-through">
                {currencySymbol}
                {formatToFixed(currentPrice, 2)}
              </span>
              <span className="text-xl font-bold text-textprimary dark:text-sidebartext">
                {currencySymbol}
                {newPrice < 0 ? "0" : formatToFixed(newPrice, 2)}
              </span>
              <span
                className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                  isIncrease
                    ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                    : "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                }`}
              >
                {isIncrease ? "+" : ""}
                {numericPercentage}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-bordercolor1 dark:border-darkbordercolor1">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-textprimary dark:text-sidebartext bg-gray-100 dark:bg-darkbgsecondary hover:bg-gray-200 dark:hover:bg-darkbordercolor1 transition-all"
        >
          {t("Cancel")}
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || numericPercentage === 0}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-primarycolor dark:bg-secondarycolor dark:text-black hover:bg-primaryhover dark:hover:bg-secondaryhover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t("Applying") : t("Apply Change")}
        </button>
      </div>
    </CustomModal>
  );
};

export default EditPlanPriceModal;
