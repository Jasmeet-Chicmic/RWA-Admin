"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { TableColumn } from "@/components/atoms/Table";
import { AdminProperty, PropertyStatus } from "../helpers/types";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
// import { createSortableColumn } from "@/shared/utils";
import TruncatedText from "@/components/atoms/TruncatedText/TruncatedText";
import DropdownMenu from "@/components/atoms/DropdownMenu/DropdownMenu";
import {
  approveAdminPropertyAction,
  rejectAdminPropertyAction,
} from "@/api/adminPropertiesActions";

interface PropertiesTableProps {
  data: AdminProperty[];
  totalCount: number;
  mode?: "pending" | "assets";
}

const PropertiesTable = ({
  data,
  totalCount,
  mode = "pending",
}: PropertiesTableProps) => {
  const t = useTranslations("properties");
  const router = useRouter();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectPropertyId, setRejectPropertyId] = useState<string | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignPropertyId, setAssignPropertyId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  );

  const assignCompanies = [
    { id: "llc-1", name: "Maple Grove Property LLC" },
    { id: "llc-2", name: "Sunset Villas Holdings LLC" },
    { id: "llc-3", name: "Downtown Heights SPV LLC" },
    { id: "llc-4", name: "Greenfield Residential LLC" },
    { id: "llc-5", name: "Riverside Apartments Owner LLC" },
  ];

  const config: DataTableConfig<AdminProperty> = useMemo(() => {
    const columns: TableColumn<AdminProperty>[] = [
      {
        title: t("Property Name"),
        field: "name",
        render: (item) => (
          <span
            className={`font-medium line-clamp-2 ${TEXT_PRIMARY}`}
            title={item.name}
          >
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
      // Status column is intentionally hidden for Pending Properties view
      ...(mode === "assets"
        ? ([
            {
              title: t("Status.label"),
              field: "status",
              render: (item: AdminProperty) => {
                const baseClass =
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border";

                let labelKey: string = "Status.PendingApproval";
                let className =
                  "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";

                switch (item.status) {
                  case PropertyStatus.Active:
                    labelKey = "Status.Active";
                    className =
                      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
                    break;
                  case PropertyStatus.SoldOut:
                    labelKey = "Status.SoldOut";
                    className =
                      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700";
                    break;
                  case PropertyStatus.Rejected:
                    labelKey = "Status.Rejected";
                    className =
                      "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
                    break;
                  case PropertyStatus.ModificationRequired:
                    labelKey = "Status.ModificationRequired";
                    className =
                      "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800";
                    break;
                  default:
                    break;
                }

                return (
                  <span className={`${baseClass} ${className}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                    {t(labelKey)}
                  </span>
                );
              },
            },
          ] as TableColumn<AdminProperty>[])
        : []),
      {
        title: t("Total Value"),
        field: "totalValue",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.totalValue.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </span>
        ),
      },
      {
        title: t("Total Units"),
        field: "totalUnits",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.totalUnits.toLocaleString()}
          </span>
        ),
      },
      {
        title: t("Available Units"),
        field: "availableUnits",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.availableUnits.toLocaleString()}
          </span>
        ),
      },
      {
        title: t("Price Per Unit"),
        field: "pricePerUnit",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.pricePerUnit.toFixed(2)}
          </span>
        ),
      },
      {
        title: t("Annual Yield"),
        field: "annualYieldPercent",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.annualYieldPercent.toFixed(2)}%
          </span>
        ),
      },
      {
        title: t("Risk Score"),
        field: "riskScore",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.riskScore}
          </span>
        ),
      },
      {
        title: t("Actions"),
        field: "",
        render: (item) => (
          <div className="flex items-center justify-end">
            {(() => {
              if (mode === "assets") {
                return (
                  <button
                    type="button"
                    className="px-3 py-1 text-xs font-semibold rounded bg-primarycolor text-white hover:opacity-90"
                    onClick={() => {
                      if (!item.id) return;
                      setAssignPropertyId(item.id);
                      setSelectedCompanyId(assignCompanies[0]?.id ?? null);
                      setAssignModalOpen(true);
                    }}
                  >
                    {t("Assign to LLC")}
                  </button>
                );
              }

              const options =
                item.status === PropertyStatus.Active
                  ? [
                      {
                        label: t("Disapprove"),
                        value: 2,
                        icon: <X className="w-4 h-4 text-red-600" />,
                      },
                    ]
                  : [
                      {
                        label: t("Approve"),
                        value: 1,
                        icon: <Check className="w-4 h-4 text-emerald-600" />,
                      },
                      {
                        label: t("Disapprove"),
                        value: 2,
                        icon: <X className="w-4 h-4 text-red-600" />,
                      },
                    ];

              return (
                <DropdownMenu
                  options={options}
                  onSelect={(value) => {
                    if (value === 1) {
                      // Approve
                      if (!item.id || approvingId === item.id) return;
                      void (async () => {
                        try {
                          setApprovingId(item.id);
                          await approveAdminPropertyAction(item.id);
                          router.refresh();
                        } finally {
                          setApprovingId(null);
                        }
                      })();
                    } else if (value === 2) {
                      // Open disapprove modal
                      if (!item.id) return;
                      setRejectPropertyId(item.id);
                      setRejectReason("");
                      setRejectModalOpen(true);
                    }
                  }}
                />
              );
            })()}
          </div>
        ),
      },
    ];

    return {
      columns,
      keyExtractor: (item) => item.id,
      paginationTitle: "properties",
      hideSelectCol: true,
      emptyMessage: t("No properties found"),
      searchPlaceholder: t("Search Properties"),
      queryConfig: {
        defaultSortKey: "name",
      },
      header: (
        <div className="bg-bgwhite dark:bg-darkbgprimary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2
                className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
              >
                {t("Properties")}
              </h2>
              <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                {t("Manage and view all properties")}
              </p>
            </div>
          </div>
        </div>
      ),
    };
  }, [t]);

  return (
    <>
      <DataTable data={data} totalCount={totalCount} config={config} />

      {rejectModalOpen && rejectPropertyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-bgwhite p-6 shadow-lg dark:bg-darkbgprimary">
            <h2 className={`mb-2 text-lg font-semibold ${TEXT_PRIMARY}`}>
              {t("Disapprove Modal Title")}
            </h2>
            <p className="mb-4 text-sm text-textparagraph dark:text-textparagraphlight">
              {t("Disapprove Modal Description")}
            </p>
            <label className="mb-1 block text-xs font-medium text-labelprimary dark:text-darklabelprimary">
              {t("Reason Optional Label")}
            </label>
            <textarea
              className="mb-4 h-24 w-full resize-none rounded-lg border border-bordergray200 bg-bgwhite px-3 py-2 text-sm text-textprimary focus:outline-none focus:ring-1 focus:ring-primarycolor dark:border-darkbordercolor1 dark:bg-darkbgbase dark:text-white"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder=""
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-bordergray200 px-4 py-2 text-sm font-medium text-textprimary hover:bg-gray-50 dark:border-darkbordercolor1 dark:text-darklabelprimary dark:hover:bg-darkbgbase"
                onClick={() => {
                  if (rejectingId) return;
                  setRejectModalOpen(false);
                  setRejectPropertyId(null);
                  setRejectReason("");
                }}
              >
                {t("Cancel")}
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
                disabled={!!rejectingId}
                onClick={() => {
                  if (!rejectPropertyId || rejectingId) return;
                  void (async () => {
                    try {
                      setRejectingId(rejectPropertyId);
                      await rejectAdminPropertyAction(
                        rejectPropertyId,
                        rejectReason,
                      );
                      setRejectModalOpen(false);
                      setRejectPropertyId(null);
                      setRejectReason("");
                      router.refresh();
                    } finally {
                      setRejectingId(null);
                    }
                  })();
                }}
              >
                {t("Confirm Disapprove")}
              </button>
            </div>
          </div>
        </div>
      )}

      {assignModalOpen && assignPropertyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-bgwhite p-6 shadow-lg dark:bg-darkbgprimary">
            <h2 className={`mb-2 text-lg font-semibold ${TEXT_PRIMARY}`}>
              {t("Assign Modal Title")}
            </h2>
            <p className="mb-4 text-sm text-textparagraph dark:text-textparagraphlight">
              {t("Assign Modal Description")}
            </p>

            <label className="mb-1 block text-xs font-medium text-labelprimary dark:text-darklabelprimary">
              {t("Assign Company Label")}
            </label>

            <select
              className="mb-4 w-full rounded-lg border border-bordergray200 bg-bgwhite px-3 py-2 text-sm text-textprimary focus:outline-none focus:ring-1 focus:ring-primarycolor dark:border-darkbordercolor1 dark:bg-darkbgbase dark:text-white"
              value={selectedCompanyId ?? ""}
              onChange={(e) => setSelectedCompanyId(e.target.value || null)}
            >
              {assignCompanies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-bordergray200 px-4 py-2 text-sm font-medium text-textprimary hover:bg-gray-50 dark:border-darkbordercolor1 dark:text-darklabelprimary dark:hover:bg-darkbgbase"
                onClick={() => {
                  setAssignModalOpen(false);
                  setAssignPropertyId(null);
                  setSelectedCompanyId(null);
                }}
              >
                {t("Cancel")}
              </button>
              <button
                type="button"
                className="rounded-lg bg-primarycolor px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                disabled={!selectedCompanyId}
                onClick={() => {
                  if (!selectedCompanyId) return;
                  // TODO: Wire assign API when available
                  console.log("Assign property to company", {
                    propertyId: assignPropertyId,
                    companyId: selectedCompanyId,
                  });
                  setAssignModalOpen(false);
                  setAssignPropertyId(null);
                  setSelectedCompanyId(null);
                }}
              >
                {t("Assign")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertiesTable;
