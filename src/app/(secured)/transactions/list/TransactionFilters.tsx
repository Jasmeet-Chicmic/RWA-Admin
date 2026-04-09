"use client";

import { CalendarDays } from "lucide-react";
import SelectFilter from "@/components/atoms/SelectFilter";
import {
  TableFilterField,
  TableFiltersLayout,
} from "@/components/organisms/TableFilters/TableFiltersLayout";
import { TRANSACTION_STATUS } from "@/constants/transaction";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { TransactionSearchInput } from "./TransactionSearchInput";

type TransactionFiltersProps = {
  variant?: "inline" | "sidebar";
  includeSearch?: boolean;
};

const TransactionFilters = ({
  variant = "inline",
  includeSearch = true,
}: TransactionFiltersProps) => {
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
    <TableFiltersLayout variant={variant}>
      {includeSearch ? (
        <TransactionSearchInput inputId="transaction-search-filter" />
      ) : null}

      <TableFilterField
        label={t("status")}
        htmlFor="status-filter"
        className="min-w-[220px]"
      >
        <SelectFilter
          id="status-filter"
          paramName="status"
          options={statusOptions}
          placeholder={t("selectStatus")}
          className="[&_.react-select__control]:!min-h-[42px] [&_.react-select__control]:!rounded-xl [&_.react-select__control]:!border-bordergray200 dark:[&_.react-select__control]:!border-darkbordercolor1"
        />
      </TableFilterField>

      <TableFilterField
        label={tCommon("fromDate")}
        htmlFor="transaction-from-date-filter"
        className="min-w-[180px]"
      >
        <div className="relative">
          <CalendarDays
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-textparagraph dark:text-textparagraphlight"
          />
          <input
            id="transaction-from-date-filter"
            type="date"
            value={fromDateValue}
            onChange={(e) => handleFromDateChange(e.target.value)}
            max={today}
            className="w-full rounded-xl border border-bordergray200 bg-bgwhite py-2.5 pl-9 pr-3 text-sm text-textprimary transition-all duration-200 focus:border-primarycolor focus:outline-none dark:border-darkbordercolor1 dark:bg-darkbgprimary dark:text-sidebartext"
          />
        </div>
      </TableFilterField>

      <TableFilterField
        label={tCommon("toDate")}
        htmlFor="transaction-to-date-filter"
        className="min-w-[180px]"
      >
        <div className="relative">
          <CalendarDays
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-textparagraph dark:text-textparagraphlight"
          />
          <input
            id="transaction-to-date-filter"
            type="date"
            value={toDateValue}
            onChange={(e) => handleToDateChange(e.target.value)}
            min={fromDateValue || undefined}
            max={today}
            className="w-full rounded-xl border border-bordergray200 bg-bgwhite py-2.5 pl-9 pr-3 text-sm text-textprimary transition-all duration-200 focus:border-primarycolor focus:outline-none dark:border-darkbordercolor1 dark:bg-darkbgprimary dark:text-sidebartext"
          />
        </div>
      </TableFilterField>
    </TableFiltersLayout>
  );
};

export default TransactionFilters;
