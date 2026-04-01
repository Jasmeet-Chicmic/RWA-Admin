"use client";

import SelectFilter from "@/components/atoms/SelectFilter";
import { TRANSACTION_STATUS } from "@/constants/transaction";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

const TransactionFilters = () => {
  const t = useTranslations("transactions");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();

  const statusOptions = useMemo(
    () => [
      {
        label: t("pending"),
        value: String(TRANSACTION_STATUS.PENDING),
      },
      {
        label: t("success"),
        value: String(TRANSACTION_STATUS.SUCCESS),
      },
      {
        label: t("failed"),
        value: String(TRANSACTION_STATUS.FAILED),
      },
    ],
    [t],
  );

  const LABEL_CLASS =
    "block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2";

  const fromDateParam = searchParams.get("fromDate");
  const toDateParam = searchParams.get("toDate");
  const fromDateValue = fromDateParam ? fromDateParam.split("T")[0] : "";
  const toDateValue = toDateParam ? toDateParam.split("T")[0] : "";
  const today = new Date().toISOString().split("T")[0];

  const handleFromDateChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("skip");

    if (value) {
      params.set("fromDate", value);
    } else {
      params.delete("fromDate");
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleToDateChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("skip");

    if (value) {
      params.set("toDate", value);
    } else {
      params.delete("toDate");
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-end justify-end gap-3">
      <div className="min-w-[220px]">
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

      <div className="min-w-[180px]">
        <label htmlFor="transaction-from-date-filter" className={LABEL_CLASS}>
          {tCommon("fromDate")}
        </label>
        <input
          id="transaction-from-date-filter"
          type="date"
          value={fromDateValue}
          onChange={(e) => handleFromDateChange(e.target.value)}
          max={today}
          className="w-full px-3 py-2.5 border-2 border-primarycolor rounded-lg focus:ring-0 transition-all duration-200 dark:bg-darkbgprimary dark:border-darkbordercolor1 dark:text-sidebartext"
        />
      </div>

      <div className="min-w-[180px]">
        <label htmlFor="transaction-to-date-filter" className={LABEL_CLASS}>
          {tCommon("toDate")}
        </label>
        <input
          id="transaction-to-date-filter"
          type="date"
          value={toDateValue}
          onChange={(e) => handleToDateChange(e.target.value)}
          min={fromDateValue || undefined}
          max={today}
          className="w-full px-3 py-2.5 border-2 border-primarycolor rounded-lg focus:ring-0 transition-all duration-200 dark:bg-darkbgprimary dark:border-darkbordercolor1 dark:text-sidebartext"
        />
      </div>
    </div>
  );
};

export default TransactionFilters;
