"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { TableColumn } from "@/components/atoms/Table";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import TruncatedText from "@/components/atoms/TruncatedText/TruncatedText";
import { AdminProperty, PropertyStatus } from "../../helpers/types";
import { TokenizationModal } from "./TokenizationModal";
import { PropertyItem } from "../../helpers/allPropertiesTypes";
import {
  PROPERTY_STATUS_BADGE_CLASSES,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
} from "../../helpers/propertiesConstants";
import { formatDisplayCurrency, fromBaseUnits } from "@/shared/utils/unitUtils";

type PropertyData = PropertyItem | AdminProperty;

const OrganisationPropertiesTable = ({
  data,
  totalCount,
  organisationId,
  hideActions = false,
}: {
  data: PropertyData[];
  totalCount: number;
  organisationId: string;
  hideActions?: boolean;
}) => {
  const t = useTranslations("properties");

  const [tokenizationModalOpen, setTokenizationModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] =
    useState<AdminProperty | null>(null);
  const [distributedPropertyIds, setDistributedPropertyIds] = useState<
    Record<string, boolean>
  >({});

  const openTokenization = (property: PropertyData) => {
    console.log("property data from api", property);
    setSelectedProperty(property as AdminProperty);
    setTokenizationModalOpen(true);
  };

  const closeTokenization = () => {
    setTokenizationModalOpen(false);
    setSelectedProperty(null);
  };

  const handleDistribute = useCallback(
    (propertyId: string) => {
      setDistributedPropertyIds((prev) => ({
        ...prev,
        [propertyId]: true,
      }));
      toast.success(t("Distributed success"));
    },
    [t],
  );

  const formatCurrency = (value: number) =>
    formatDisplayCurrency(value, { maximumFractionDigits: 2 });

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const config: DataTableConfig<PropertyData> = useMemo(() => {
    const columns: TableColumn<PropertyData>[] = [
      {
        title: t("Property Name"),
        field: "name",
        render: (item) => (
          <span className={`font-medium line-clamp-2 ${TEXT_PRIMARY}`}>
            <TruncatedText text={item.name} maxLength={40} />
          </span>
        ),
      },
      {
        title: t("Location"),
        field: "location",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            <TruncatedText text={item.location} maxLength={40} />
          </span>
        ),
      },
      {
        title: t("Property Type"),
        field: "propertyType",
        render: (item) => {
          const typeLabel =
            typeof item.propertyType === "number"
              ? PROPERTY_TYPE_LABELS[
                  item.propertyType as keyof typeof PROPERTY_TYPE_LABELS
                ]
              : item.propertyType;
          return (
            <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
              {typeLabel || "—"}
            </span>
          );
        },
      },
      {
        title: t("Status.label"),
        field: "status",
        render: (item) => {
          const baseClass =
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border";
          const status = item.status as keyof typeof PROPERTY_STATUS_LABELS;
          const className =
            PROPERTY_STATUS_BADGE_CLASSES[status] ||
            "bg-gray-100 text-gray-700 border-gray-200";
          const statusLabel =
            PROPERTY_STATUS_LABELS[status] ?? String(item.status);

          return (
            <span className={`${baseClass} ${className}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
              {statusLabel}
            </span>
          );
        },
      },
      {
        title: t("Total Value"),
        field: "",
        render: (item) => {
          const value =
            (item as PropertyItem).approvedValuation ??
            (item as AdminProperty).totalValue;
          return (
            <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
              {formatCurrency(fromBaseUnits(value))}
            </span>
          );
        },
      },
      {
        title: t("Annual Yield"),
        field: "",
        render: (item) => {
          const yieldVal =
            (item as PropertyItem).annualYieldPercentage ??
            (item as AdminProperty).annualYieldPercent;
          return (
            <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
              {yieldVal !== null && yieldVal !== undefined
                ? `${yieldVal}%`
                : "—"}
            </span>
          );
        },
      },
      {
        title: t("Price Per Share"),
        field: "",
        render: (item) => {
          const price = (item as PropertyItem).pricePerShare;
          return (
            <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
              {price !== null && price !== undefined
                ? formatCurrency(price)
                : "—"}
            </span>
          );
        },
      },
      {
        title: t("Created At"),
        field: "",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {formatDate((item as PropertyItem).createdAt)}
          </span>
        ),
      },
    ];

    if (!hideActions) {
      columns.push({
        title: t("Actions"),
        field: "",
        render: (item) => {
          const isActiveProperty = item.status === PropertyStatus.Active;
          const canTokenize =
            item.status === PropertyStatus.OrganizationAssigned;
          const isDistributed = !!distributedPropertyIds[item.id];
          const shouldDisable =
            isDistributed || (!isActiveProperty && !canTokenize);

          return (
            <div className="flex items-center justify-end">
              <button
                type="button"
                className={`px-3 py-1 text-xs font-semibold rounded text-white ${
                  shouldDisable
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primarycolor hover:opacity-90 !text-black"
                }`}
                disabled={shouldDisable}
                onClick={() => {
                  if (isActiveProperty) {
                    handleDistribute(item.id);
                    return;
                  }
                  if (canTokenize) openTokenization(item);
                }}
              >
                {isActiveProperty
                  ? isDistributed
                    ? t("Distributed")
                    : t("Distribute")
                  : t("Tokenization")}
              </button>
            </div>
          );
        },
      });
    }

    return {
      columns,
      keyExtractor: (item) => item.id,
      paginationTitle: t("Organisation Properties Title"),
      hideSelectCol: true,
      emptyMessage: t("No properties found"),
    };
  }, [distributedPropertyIds, t, handleDistribute, hideActions]);

  return (
    <>
      <DataTable data={data} totalCount={totalCount} config={config} />
      <TokenizationModal
        open={tokenizationModalOpen}
        onClose={closeTokenization}
        property={selectedProperty}
        organisationId={organisationId}
      />
    </>
  );
};

export default OrganisationPropertiesTable;
