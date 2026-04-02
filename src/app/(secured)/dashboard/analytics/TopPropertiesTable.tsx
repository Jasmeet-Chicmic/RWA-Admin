"use client";

import { PROPERTY_TYPE_LABELS } from "@/constants/properties";
import {
  InDemandPropertyItem,
  analyticsService,
} from "@/services/analytics-service";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { TableColumn } from "@/components/atoms/Table";
import Table from "@/components/atoms/Table";
import TruncatedText from "@/components/atoms/TruncatedText/TruncatedText";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import { formatDisplayCurrency, fromBaseUnits } from "@/shared/utils/unitUtils";
type TopPropertyRow = InDemandPropertyItem;

const formatCurrencyCompact = (value: number) =>
  formatDisplayCurrency(value, { maximumFractionDigits: 0 });

const TopPropertiesTable = () => {
  const t = useTranslations("properties");
  const [rows, setRows] = useState<TopPropertyRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadTopProperties = async () => {
      setIsLoading(true);
      try {
        const payload = await analyticsService.getInDemandProperties({
          skip: 0,
          limit: 10,
        });
        if (isCancelled) return;
        setRows(payload.items);
      } catch {
        if (isCancelled) return;
        setRows([]);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    void loadTopProperties();

    return () => {
      isCancelled = true;
    };
  }, []);

  const columns: TableColumn<TopPropertyRow>[] = useMemo(() => {
    return [
      {
        title: t("propertyName"),
        field: "name",
        render: (item) => (
          <div className="flex flex-col">
            <span className={`font-medium ${TEXT_PRIMARY}`} title={item.name}>
              <TruncatedText text={item.name} maxLength={40} />
            </span>
            <span className={`${TEXT_SIZE_SM} text-textparagraph`}>
              <TruncatedText text={item.location} maxLength={40} />
            </span>
          </div>
        ),
      },
      {
        title: t("propertyType"),
        field: "propertyType",
        render: (item) => {
          const propertyTypeLabel =
            PROPERTY_TYPE_LABELS[
              item.propertyType as keyof typeof PROPERTY_TYPE_LABELS
            ] ?? String(item.propertyType);
          return (
            <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
              {propertyTypeLabel}
            </span>
          );
        },
      },
      {
        title: t("totalValue"),
        field: "approvedValuation",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {formatCurrencyCompact(fromBaseUnits(item.approvedValuation))}
          </span>
        ),
      },
      // {
      //   title: t("annualYield"),
      //   field: "annualYieldPercent",
      //   render: (item) => (
      //     <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
      //       {item.annualYieldPercent.toFixed(2)}%
      //     </span>
      //   ),
      // },
      // {
      //   title: t("riskScore"),
      //   field: "riskScore",
      //   render: (item) => (
      //     <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
      //       {item.riskScore.toFixed(1)}
      //     </span>
      //   ),
      // },
    ];
  }, [t]);

  return (
    <div className="bg-bgwhite rounded-[20px] border border-bordergray200 p-3 lg:p-6 dark:bg-darkbgprimary dark:border-darkbordercolor1">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2
            className={`text-[1.125rem] lg:text-[1.25rem] font-bold ${TEXT_PRIMARY}`}
          >
            {t("topProperties")}
          </h2>
          <p className="text-[13px] font-medium text-textparagraph dark:text-textparagraphlight">
            {t("topPropertiesSubtitle")}
          </p>
        </div>
      </div>
      <Table
        data={rows}
        isLoading={isLoading}
        columns={columns}
        keyExtractor={(item) => item.propertyId}
        emptyMessage={t("noPropertiesFound")}
      />
    </div>
  );
};

export default TopPropertiesTable;
