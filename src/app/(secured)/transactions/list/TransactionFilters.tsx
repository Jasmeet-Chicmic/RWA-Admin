"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import SelectFilter from "@/components/atoms/SelectFilter";
import { PAYMENT_STATUS, SUBSCRIPTION_OWNER_TYPE } from "@/shared/constants";
import AmountRangeFilter from "./AmountRangeFilter";

const TransactionFilters = () => {
  const t = useTranslations("transactions");

  const ownerTypeOptions = useMemo(
    () => [
      {
        label: t("User"),
        value: String(SUBSCRIPTION_OWNER_TYPE.USER),
      },
      {
        label: t("Organisation"),
        value: String(SUBSCRIPTION_OWNER_TYPE.ORGANISATION),
      },
    ],
    [t],
  );

  const statusOptions = useMemo(
    () => [
      {
        label: t("Initiated"),
        value: String(PAYMENT_STATUS.INITIATED),
      },
      {
        label: t("Success"),
        value: String(PAYMENT_STATUS.SUCCESS),
      },
      {
        label: t("Failed"),
        value: String(PAYMENT_STATUS.FAILED),
      },
      {
        label: t("Refunded"),
        value: String(PAYMENT_STATUS.REFUNDED),
      },
    ],
    [t],
  );

  const refundsOnlyOptions = useMemo(
    () => [
      { label: t("Yes"), value: "true" },
      { label: t("No"), value: "false" },
    ],
    [t],
  );

  const creditsOnlyOptions = useMemo(
    () => [
      { label: t("Yes"), value: "true" },
      { label: t("No"), value: "false" },
    ],
    [t],
  );

  const LABEL_CLASS =
    "block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2";

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="owner-type-filter" className={LABEL_CLASS}>
          {t("Owner Type")}
        </label>
        <SelectFilter
          id="owner-type-filter"
          paramName="ownerType"
          options={ownerTypeOptions}
          placeholder={t("Select Owner Type")}
        />
      </div>

      <div>
        <label htmlFor="status-filter" className={LABEL_CLASS}>
          {t("Status")}
        </label>
        <SelectFilter
          id="status-filter"
          paramName="status"
          options={statusOptions}
          placeholder={t("Select Status")}
        />
      </div>

      <AmountRangeFilter />

      <div>
        <label htmlFor="refunds-only-filter" className={LABEL_CLASS}>
          {t("Refunds Only")}
        </label>
        <SelectFilter
          id="refunds-only-filter"
          paramName="refundsOnly"
          options={refundsOnlyOptions}
          placeholder={t("Select")}
        />
      </div>

      <div>
        <label htmlFor="credits-only-filter" className={LABEL_CLASS}>
          {t("Credits Only")}
        </label>
        <SelectFilter
          id="credits-only-filter"
          paramName="creditsOnly"
          options={creditsOnlyOptions}
          placeholder={t("Select")}
        />
      </div>
    </div>
  );
};

export default TransactionFilters;
