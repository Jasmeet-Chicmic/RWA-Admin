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
import { formatDisplayCurrency, fromBaseUnits } from "@/shared/utils/unitUtils";
import TruncatedText from "@/components/atoms/TruncatedText/TruncatedText";

import { AdminProperty, PropertyStatus } from "../../helpers/types";
import {
  PROPERTY_STATUS_LABEL_MAP,
  getPropertyStatusBadgeClassName,
} from "../../helpers/propertyStatusUtils";
import { TokenizationModal } from "./TokenizationModal";

const OrganisationPropertiesTable = ({
  data,
  totalCount,
  organisationId,
}: {
  data: AdminProperty[];
  totalCount: number;
  organisationId: string;
}) => {
  const t = useTranslations("properties");

  const [tokenizationModalOpen, setTokenizationModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] =
    useState<AdminProperty | null>(null);
  const [distributedPropertyIds, setDistributedPropertyIds] = useState<
    Record<string, boolean>
  >({});

  const openTokenization = (property: AdminProperty) => {
    console.log("property data from api", property);
    setSelectedProperty(property);
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

  const config: DataTableConfig<AdminProperty> = useMemo(() => {
    const columns: TableColumn<AdminProperty>[] = [
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
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.propertyType || "—"}
          </span>
        ),
      },
      {
        title: t("Status.label"),
        field: "status",
        render: (item) => {
          const baseClass =
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border";
          const className = getPropertyStatusBadgeClassName(item.status);
          const statusLabel =
            PROPERTY_STATUS_LABEL_MAP[item.status] ?? String(item.status);

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
        field: "totalValue",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {formatCurrency(fromBaseUnits(item.totalValue))}
          </span>
        ),
      },
      {
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
      },
    ];

    return {
      columns,
      keyExtractor: (item) => item.id,
      paginationTitle: t("Organisation Properties Title"),
      hideSelectCol: true,
      emptyMessage: t("No properties found"),
    };
  }, [distributedPropertyIds, t, handleDistribute]);

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
