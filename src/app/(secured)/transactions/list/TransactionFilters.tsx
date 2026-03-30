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
        label: t("user"),
        value: String(SUBSCRIPTION_OWNER_TYPE.USER),
      },
      {
        label: t("organisation"),
        value: String(SUBSCRIPTION_OWNER_TYPE.ORGANISATION),
      },
    ],
    [t],
  );

  const statusOptions = useMemo(
    () => [
      {
        label: t("initiated"),
        value: String(PAYMENT_STATUS.INITIATED),
      },
      {
        label: t("success"),
        value: String(PAYMENT_STATUS.SUCCESS),
      },
      {
        label: t("failed"),
        value: String(PAYMENT_STATUS.FAILED),
      },
      {
        label: t("refunded"),
        value: String(PAYMENT_STATUS.REFUNDED),
      },
    ],
    [t],
  );

  const refundsOnlyOptions = useMemo(
    () => [
      { label: t("yes"), value: "true" },
      { label: t("no"), value: "false" },
    ],
    [t],
  );

  const creditsOnlyOptions = useMemo(
    () => [
      { label: t("yes"), value: "true" },
      { label: t("no"), value: "false" },
    ],
    [t],
  );

  const LABEL_CLASS =
    "block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2";

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="owner-type-filter" className={LABEL_CLASS}>
          {t("ownerType")}
        </label>
        <SelectFilter
          id="owner-type-filter"
          paramName="ownerType"
          options={ownerTypeOptions}
          placeholder={t("selectOwnerType")}
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

      <AmountRangeFilter />

      <div>
        <label htmlFor="refunds-only-filter" className={LABEL_CLASS}>
          {t("refundsOnly")}
        </label>
        <SelectFilter
          id="refunds-only-filter"
          paramName="refundsOnly"
          options={refundsOnlyOptions}
          placeholder={t("select")}
        />
      </div>

      <div>
        <label htmlFor="credits-only-filter" className={LABEL_CLASS}>
          {t("creditsOnly")}
        </label>
        <SelectFilter
          id="credits-only-filter"
          paramName="creditsOnly"
          options={creditsOnlyOptions}
          placeholder={t("select")}
        />
      </div>
    </div>
  );
};

export default TransactionFilters;
