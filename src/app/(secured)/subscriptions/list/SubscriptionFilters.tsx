"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import SelectFilter from "@/components/atoms/SelectFilter";
import {
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_STATUS_LABELS,
  SUBSCRIPTION_OWNER_TYPE,
  SUBSCRIPTION_OWNER_TYPE_LABELS,
  BILLING_CYCLE,
  BILLING_CYCLE_LABELS,
} from "@/shared/constants";

const LABEL_CLASS =
  "block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2";

const SubscriptionFilters = () => {
  const t = useTranslations("subscriptions");

  const ownerTypeOptions = useMemo(
    () => [
      {
        label: t(SUBSCRIPTION_OWNER_TYPE_LABELS[SUBSCRIPTION_OWNER_TYPE.USER]),
        value: String(SUBSCRIPTION_OWNER_TYPE.USER),
      },
      {
        label: t(
          SUBSCRIPTION_OWNER_TYPE_LABELS[SUBSCRIPTION_OWNER_TYPE.ORGANISATION],
        ),
        value: String(SUBSCRIPTION_OWNER_TYPE.ORGANISATION),
      },
    ],
    [t],
  );

  const statusOptions = useMemo(
    () => [
      {
        label: t(SUBSCRIPTION_STATUS_LABELS[SUBSCRIPTION_STATUS.ACTIVE]),
        value: String(SUBSCRIPTION_STATUS.ACTIVE),
      },
      {
        label: t(SUBSCRIPTION_STATUS_LABELS[SUBSCRIPTION_STATUS.PAST_DUE]),
        value: String(SUBSCRIPTION_STATUS.PAST_DUE),
      },
      {
        label: t(SUBSCRIPTION_STATUS_LABELS[SUBSCRIPTION_STATUS.CANCELLED]),
        value: String(SUBSCRIPTION_STATUS.CANCELLED),
      },
      {
        label: t(SUBSCRIPTION_STATUS_LABELS[SUBSCRIPTION_STATUS.TRIALING]),
        value: String(SUBSCRIPTION_STATUS.TRIALING),
      },
      {
        label: t(SUBSCRIPTION_STATUS_LABELS[SUBSCRIPTION_STATUS.INCOMPLETE]),
        value: String(SUBSCRIPTION_STATUS.INCOMPLETE),
      },
      {
        label: t(SUBSCRIPTION_STATUS_LABELS[SUBSCRIPTION_STATUS.PAUSED]),
        value: String(SUBSCRIPTION_STATUS.PAUSED),
      },
    ],
    [t],
  );

  const billingCycleOptions = useMemo(
    () => [
      {
        label: t(BILLING_CYCLE_LABELS[BILLING_CYCLE.MONTHLY]),
        value: String(BILLING_CYCLE.MONTHLY),
      },
      {
        label: t(BILLING_CYCLE_LABELS[BILLING_CYCLE.YEARLY]),
        value: String(BILLING_CYCLE.YEARLY),
      },
    ],
    [t],
  );

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="owner-type-filter" className={LABEL_CLASS}>
          {t("subscriptionOwner")}
        </label>
        <SelectFilter
          id="owner-type-filter"
          paramName="ownerType"
          options={ownerTypeOptions}
          placeholder={t("selectSubscriptionOwner")}
        />
      </div>

      <div>
        <label htmlFor="status-filter" className={LABEL_CLASS}>
          {t("status")}
        </label>
        <SelectFilter
          id="status-filter"
          paramName="status"
          options={statusOptions}
          placeholder={t("selectStatus")}
        />
      </div>

      <div>
        <label htmlFor="billing-cycle-filter" className={LABEL_CLASS}>
          {t("billingCycle")}
        </label>
        <SelectFilter
          id="billing-cycle-filter"
          paramName="billingCycle"
          options={billingCycleOptions}
          placeholder={t("selectBillingCycle")}
        />
      </div>
    </div>
  );
};

export default SubscriptionFilters;
