"use client";

import SelectFilter from "@/components/atoms/SelectFilter";
import {
  TableFilterField,
  TableFiltersLayout,
} from "@/components/organisms/TableFilters/TableFiltersLayout";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

type UsersListFiltersProps = {
  variant?: "inline" | "sidebar";
};

export const UsersListFilters = ({
  variant = "inline",
}: UsersListFiltersProps) => {
  const t = useTranslations("users");

  const kycOptions = useMemo(
    () => [
      { label: t("kyc.notStarted"), value: "0" },
      { label: t("kyc.pending"), value: "1" },
      { label: t("kyc.approved"), value: "2" },
      { label: t("kyc.rejected"), value: "3" },
    ],
    [t],
  );

  return (
    <TableFiltersLayout variant={variant}>
      <TableFilterField
        label={t("kycStatus")}
        htmlFor="users-kyc-status-filter"
        className="min-w-[220px]"
      >
        <SelectFilter
          id="users-kyc-status-filter"
          paramName="kycStatus"
          options={kycOptions}
          placeholder={t("selectKycStatus")}
          className="[&_.react-select__control]:!min-h-[42px] [&_.react-select__control]:!rounded-xl [&_.react-select__control]:!border-bordergray200 dark:[&_.react-select__control]:!border-darkbordercolor1"
        />
      </TableFilterField>
    </TableFiltersLayout>
  );
};
