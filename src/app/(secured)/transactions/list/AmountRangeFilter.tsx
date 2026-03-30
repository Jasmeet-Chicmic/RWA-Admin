"use client";

import { useTranslations } from "next-intl";
import NumericRangeFilter from "@/components/atoms/NumericRangeFilter";

const AmountRangeFilter = () => {
  const t = useTranslations("transactions");
  return (
    <NumericRangeFilter
      label={t("amountRange")}
      minParamName="minAmount"
      maxParamName="maxAmount"
      placeholderMin={t("min")}
      placeholderMax={t("max")}
    />
  );
};

export default AmountRangeFilter;
