"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import CustomModal from "@/components/molecules/CustomModal/CustomModal";
import { adjustSubscriptionAction } from "@/api/adminSubscriptions";
import { Subscription } from "@/shared/types";
import {
  SUBSCRIPTION_STATUS_OPTIONS,
  BILLING_CYCLE_OPTIONS,
  SUBSCRIPTION_OWNER_TYPE,
  MIN_ORGANISATION_SEATS,
  DEFAULT_USER_SEATS,
} from "@/shared/constants";

interface EditSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription;
  onSuccess: () => void;
}

const EditSubscriptionModal = ({
  isOpen,
  onClose,
  subscription,
  onSuccess,
}: EditSubscriptionModalProps) => {
  const t = useTranslations("subscriptions");
  const isOrganisation =
    subscription.ownerType === SUBSCRIPTION_OWNER_TYPE.ORGANISATION;

  const [status, setStatus] = useState(subscription.status);
  const [billingCycle, setBillingCycle] = useState(subscription.billingCycle);
  const [endDate, setEndDate] = useState(
    subscription.endDate ? subscription.endDate.split("T")[0] : "",
  );
  const [seatCount, setSeatCount] = useState<number | string>(
    isOrganisation
      ? Math.max(subscription.seatCount, MIN_ORGANISATION_SEATS)
      : DEFAULT_USER_SEATS,
  );
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSeatCountInvalid =
    isOrganisation &&
    (seatCount === "" || Number(seatCount) < MIN_ORGANISATION_SEATS);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error(t("Please provide a reason for this adjustment"));
      return;
    }

    if (isSeatCountInvalid) {
      toast.error(
        t("Seat count error", {
          min: MIN_ORGANISATION_SEATS,
        }),
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adjustSubscriptionAction({
        subscriptionId: subscription.subscriptionId,
        newStatus: status,
        newBillingCycle: billingCycle,
        newEndDate: endDate ? new Date(endDate).toISOString() : undefined,
        newSeatCount: isOrganisation ? Number(seatCount) : DEFAULT_USER_SEATS,
        reason: reason.trim(),
      });

      if (res.status) {
        toast.success(t("Subscription adjusted successfully"));
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || t("Failed to adjust subscription"));
      }
    } catch {
      toast.error(t("An unexpected error occurred"));
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
      title={t("Edit Subscription")}
      size="lg"
    >
      <div className="space-y-5 overflow-y-auto max-h-[60vh] pr-1">
        {/* Plan Info Banner */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primarycolor/5 dark:bg-secondarycolor/5 border border-primarycolor/10 dark:border-secondarycolor/10">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-textprimary dark:text-sidebartext">
              {subscription.planName}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {subscription.customerEmail} · {subscription.planCode}
            </p>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className={labelClassName}>{t("Status")}</label>
          <select
            value={status}
            onChange={(e) => setStatus(Number(e.target.value))}
            className={inputClassName}
          >
            {SUBSCRIPTION_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.label)}
              </option>
            ))}
          </select>
        </div>

        {/* Billing Cycle */}
        <div>
          <label className={labelClassName}>{t("Billing Cycle")}</label>
          <select
            value={billingCycle}
            onChange={(e) => setBillingCycle(Number(e.target.value))}
            className={inputClassName}
          >
            {BILLING_CYCLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.label)}
              </option>
            ))}
          </select>
        </div>

        {/* End Date */}
        <div>
          <label className={labelClassName}>{t("End Date")}</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClassName}
          />
        </div>

        {/* Seat Count — Organisation only */}
        {isOrganisation ? (
          <div>
            <label className={labelClassName}>{t("Seat Count")}</label>
            <input
              type="number"
              min={MIN_ORGANISATION_SEATS}
              value={seatCount}
              onChange={(e) =>
                setSeatCount(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className={`${inputClassName} ${isSeatCountInvalid ? "border-red-400 dark:border-red-500 focus:ring-red-300 dark:focus:ring-red-500/30" : ""}`}
            />
            {isSeatCountInvalid ? (
              <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">
                {t("Seat count error", {
                  min: MIN_ORGANISATION_SEATS,
                })}
              </p>
            ) : (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                {t("Minimum organisation seats info", {
                  min: MIN_ORGANISATION_SEATS,
                })}
              </p>
            )}
          </div>
        ) : (
          <div>
            <label className={labelClassName}>{t("Seat Count")}</label>
            <input
              type="number"
              value={DEFAULT_USER_SEATS}
              disabled
              className={`${inputClassName} opacity-50 cursor-not-allowed`}
            />
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
              {t("Seat editing organisation only info")}
            </p>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className={labelClassName}>
            {t("Reason")} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("Enter reason for this adjustment")}
            rows={3}
            className={`${inputClassName} resize-none`}
          />
        </div>
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
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-primarycolor dark:bg-secondarycolor dark:text-black hover:bg-primaryhover dark:hover:bg-secondaryhover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t("Saving") : t("Save Changes")}
        </button>
      </div>
    </CustomModal>
  );
};

export default EditSubscriptionModal;
