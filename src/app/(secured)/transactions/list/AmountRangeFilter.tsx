"use client";

import { useTranslations } from "next-intl";
import NumericRangeFilter from "@/components/atoms/NumericRangeFilter";

const AmountRangeFilter = () => {
  const t = useTranslations("transactions");
  return (
    <NumericRangeFilter
      label={t("Amount Range")}
      minParamName="minAmount"
      maxParamName="maxAmount"
      placeholderMin={t("Min")}
      placeholderMax={t("Max")}
    />
  );
};

export default AmountRangeFilter;
