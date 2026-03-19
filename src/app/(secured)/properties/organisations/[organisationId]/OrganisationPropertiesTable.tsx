"use client";

import { useMemo, useState } from "react";
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
    setSelectedProperty(property);
    setTokenizationModalOpen(true);
  };

  const closeTokenization = () => {
    setTokenizationModalOpen(false);
    setSelectedProperty(null);
  };

  const handleDistribute = (propertyId: string) => {
    setDistributedPropertyIds((prev) => ({
      ...prev,
      [propertyId]: true,
    }));
    toast.success(t("Distributed success"));
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 2,
    }).format(Number.isFinite(value) ? value : 0);

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
      // {
      //   title: t("Status.label"),
      //   field: "status",
      //   render: (item) => {
      //     const baseClass =
      //       "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border";

      //     let labelKey: string = "Status.PendingApproval";
      //     let className =
      //       "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";

      //     switch (item.status) {
      //       case PropertyStatus.Active:
      //         labelKey = "Status.Active";
      //         className =
      //           "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
      //         break;
      //       case PropertyStatus.Draft:
      //         labelKey = "Status.Draft";
      //         className =
      //           "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-300 dark:border-zinc-700";
      //         break;
      //       case PropertyStatus.AdminApproved:
      //         labelKey = "Status.AdminApproved";
      //         className =
      //           "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800";
      //         break;
      //       case PropertyStatus.OrganizationAssigned:
      //         labelKey = "Status.OrganizationAssigned";
      //         className =
      //           "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800";
      //         break;
      //       case PropertyStatus.SoldOut:
      //         labelKey = "Status.SoldOut";
      //         className =
      //           "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700";
      //         break;
      //       case PropertyStatus.Rejected:
      //         labelKey = "Status.Rejected";
      //         className =
      //           "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
      //         break;
      //       case PropertyStatus.ModificationRequired:
      //         labelKey = "Status.ModificationRequired";
      //         className =
      //           "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800";
      //         break;
      //       default:
      //         break;
      //     }

      //     return (
      //       <span className={`${baseClass} ${className}`}>
      //         <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      //         {t(labelKey)}
      //       </span>
      //     );
      //   },
      // },
      {
        title: t("Total Value"),
        field: "totalValue",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {formatCurrency(item.totalValue)}
          </span>
        ),
      },
      // {
      //   title: t("Total Units"),
      //   field: "totalUnits",
      //   render: (item) => (
      //     <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
      //       {item.totalUnits.toLocaleString()}
      //     </span>
      //   ),
      // },
      // {
      //   title: t("Available Units"),
      //   field: "availableUnits",
      //   render: (item) => (
      //     <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
      //       {item.availableUnits.toLocaleString()}
      //     </span>
      //   ),
      // },
      // {
      //   title: t("Price Per Unit"),
      //   field: "pricePerUnit",
      //   render: (item) => (
      //     <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
      //       {item.pricePerUnit.toFixed(2)}
      //     </span>
      //   ),
      // },
      // {
      //   title: t("Annual Yield"),
      //   field: "annualYieldPercent",
      //   render: (item) => (
      //     <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
      //       {item.annualYieldPercent.toFixed(2)}%
      //     </span>
      //   ),
      // },
      // {
      //   title: t("Risk Score"),
      //   field: "riskScore",
      //   render: (item) => (
      //     <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
      //       {item.riskScore}
      //     </span>
      //   ),
      // },
      {
        title: t("Actions"),
        field: "",
        render: (item) => {
          const isActiveProperty = item.status === PropertyStatus.Active;
          const isDistributed = !!distributedPropertyIds[item.id];

          return (
            <div className="flex items-center justify-end">
              <button
                type="button"
                className={`px-3 py-1 text-xs font-semibold rounded text-white ${
                  isDistributed
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primarycolor hover:opacity-90"
                }`}
                disabled={isDistributed}
                onClick={() => {
                  if (isActiveProperty) {
                    handleDistribute(item.id);
                    return;
                  }
                  openTokenization(item);
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
  }, [distributedPropertyIds, t]);

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
