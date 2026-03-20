"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Check, Info, Loader2, X, Eye, FileText } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";

import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { TableColumn } from "@/components/atoms/Table";
import {
  AdminProperty,
  PropertyDocument,
  PropertyStatus,
} from "../helpers/types";
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
  assignAdminPropertyToOrganisationAction,
  uploadAdminPropertyDocumentsAction,
} from "@/api/adminPropertiesActions";

interface PropertiesTableProps {
  data: AdminProperty[];
  totalCount: number;
  mode?: "pending" | "assets" | "disapproved";
}

const ASSIGN_COMPANIES = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Maple Grove Property LLC",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Sunset Villas Holdings LLC",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Downtown Heights SPV LLC",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Greenfield Residential LLC",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    name: "Riverside Apartments Owner LLC",
  },
];

const PropertiesTable = ({
  data,
  totalCount,
  mode = "pending",
}: PropertiesTableProps) => {
  const t = useTranslations("properties");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectPropertyId, setRejectPropertyId] = useState<string | null>(null);

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approvePropertyId, setApprovePropertyId] = useState<string | null>(
    null,
  );
  const [approveReason, setApproveReason] = useState<string>("");

  const [rejectionReasonModalOpen, setRejectionReasonModalOpen] =
    useState(false);
  const [activeRejectionReason, setActiveRejectionReason] =
    useState<string>("");
  const [isApprovalReason, setIsApprovalReason] = useState(false);

  const [activeAdminDocuments, setActiveAdminDocuments] = useState<
    PropertyDocument[]
  >([]);
  type UploadedDocument = { documentUrl: string; fileName: string };

  const [approveDocuments, setApproveDocuments] = useState<UploadedDocument[]>(
    [],
  );
  const [rejectDocuments, setRejectDocuments] = useState<UploadedDocument[]>(
    [],
  );

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignPropertyId, setAssignPropertyId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  );
  const [assigning, setAssigning] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [refreshingActionId, setRefreshingActionId] = useState<string | null>(
    null,
  );
  const [isRefreshing, startRefreshTransition] = useTransition();

  const uploadDocuments = async (
    files: File[],
  ): Promise<UploadedDocument[]> => {
    if (!files.length) return [];

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const result = await uploadAdminPropertyDocumentsAction(formData);

      let uploadedDocuments: UploadedDocument[] = [];

      const isString = (v: unknown): v is string => typeof v === "string";

      const toDocument = (item: unknown): UploadedDocument | null => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;

        const documentUrlRaw =
          record.documentUrl ?? record.url ?? record.filePath;
        if (!isString(documentUrlRaw)) return null;

        const fileNameRaw =
          (isString(record.fileName) ? record.fileName : undefined) ??
          documentUrlRaw.split("/").pop();
        if (!isString(fileNameRaw) || !fileNameRaw) return null;

        return { documentUrl: documentUrlRaw, fileName: fileNameRaw };
      };

      const resultUnknown: unknown = result;

      if (Array.isArray(resultUnknown)) {
        uploadedDocuments = resultUnknown
          .map((item) => toDocument(item))
          .filter((d): d is UploadedDocument => Boolean(d));
      } else if (resultUnknown && typeof resultUnknown === "object") {
        const maybeData = (resultUnknown as { data?: unknown }).data;

        if (Array.isArray(maybeData)) {
          uploadedDocuments = maybeData
            .map((item) => toDocument(item))
            .filter((d): d is UploadedDocument => Boolean(d));
        } else if (maybeData && typeof maybeData === "object") {
          const dataObj = maybeData as {
            urls?: unknown;
            filePaths?: unknown;
          };
          const urlsRaw = Array.isArray(dataObj.urls) ? dataObj.urls : [];
          const filePathsRaw = Array.isArray(dataObj.filePaths)
            ? dataObj.filePaths
            : [];
          const urls = [
            ...urlsRaw.filter(isString),
            ...filePathsRaw.filter(isString),
          ];

          uploadedDocuments = urls
            .map((u) => ({
              documentUrl: u,
              fileName: u.split("/").pop() || "",
            }))
            .filter((d) => Boolean(d.fileName));
        }
      }

      if (!uploadedDocuments.length) {
        toast.error(t("Upload documents failed"));
        return [];
      }

      toast.success(t("Upload documents success"));
      return uploadedDocuments;
    } catch (error) {
      console.error("Batch upload failed", error);
      toast.error(t("Upload documents failed"));
      return [];
    }
  };

  const getDocumentDisplayName = (documentUrl: string) => {
    try {
      const pathname = new URL(documentUrl).pathname;
      const fileName = pathname.split("/").pop();
      return decodeURIComponent(fileName || documentUrl);
    } catch {
      const fallbackName = documentUrl.split("/").pop();
      return decodeURIComponent(fallbackName || documentUrl);
    }
  };

  const getDocumentTitleFromFileName = (fileName: string) => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith(".pdf")) return "Land Registration Papers";
    return "Image";
  };

  useEffect(() => {
    if (!isRefreshing) {
      setRefreshingActionId(null);
    }
  }, [isRefreshing]);

  useEffect(() => {
    if (!assigning) {
      setAssigningId(null);
    }
  }, [assigning]);

  const PropertyDocumentsDropzone = ({
    value,
    onChange,
    disabled,
  }: {
    value: UploadedDocument[];
    onChange: (docs: UploadedDocument[]) => void;
    disabled?: boolean;
  }) => {
    const t = useTranslations("properties");
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length || isUploading || disabled) return;
      setIsUploading(true);
      const uploadedUrls = await uploadDocuments(acceptedFiles);
      if (uploadedUrls.length) {
        onChange([...value, ...uploadedUrls]);
      }
      setIsUploading(false);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      multiple: true,
      accept: {
        "application/pdf": [".pdf"],
      },
      disabled: disabled || isUploading,
    });

    return (
      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-labelprimary dark:text-darklabelprimary">
          {t("Supporting documents label")}
        </label>
        <div
          {...getRootProps()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-bordergray200 bg-bgwhite px-4 py-6 text-center text-xs text-textparagraph transition hover:border-primarycolor hover:bg-gray-50 dark:border-darkbordercolor1 dark:bg-darkbgbase dark:text-textparagraphlight"
        >
          <input {...getInputProps()} />
          <p className="mb-1 font-medium">
            {isDragActive
              ? t("Drop documents here label")
              : t("Upload documents placeholder")}
          </p>
          <p className="text-[11px] text-sidebartext dark:text-gray-500">
            {t("Upload documents helper")}
          </p>
          {isUploading && (
            <div className="mt-2 inline-flex items-center gap-2 text-[11px] text-textparagraph dark:text-textparagraphlight">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>{t("Uploading documents label")}</span>
            </div>
          )}
        </div>

        {value.length > 0 && (
          <ul className="mt-2 max-h-28 space-y-1 overflow-y-scroll pr-1 text-[11px] text-textparagraph dark:text-textparagraphlight">
            {value.map((doc) => (
              <li
                key={doc.documentUrl}
                className="flex items-center justify-between gap-2"
              >
                <span className="truncate" title={doc.documentUrl}>
                  {doc.fileName || getDocumentDisplayName(doc.documentUrl)}
                </span>
                <button
                  type="button"
                  className="text-[11px] font-medium text-red-500 hover:underline"
                  onClick={() =>
                    onChange(
                      value.filter(
                        (existingDoc) =>
                          existingDoc.documentUrl !== doc.documentUrl,
                      ),
                    )
                  }
                  disabled={disabled || isUploading}
                >
                  {t("Remove document label")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 2,
    }).format(Number.isFinite(value) ? value : 0);

  const config: DataTableConfig<AdminProperty> = useMemo(() => {
    const rejectionReasonColumn: TableColumn<AdminProperty> = {
      title: t("Rejection Reason"),
      field: "rejectionReason",
      render: (item: AdminProperty) => {
        if (!item.rejectionReason) return null;
        return (
          <div className="flex items-center gap-2">
            <span className="min-w-0 flex-1">
              <TruncatedText text={item.rejectionReason} maxLength={40} />
            </span>
            <button
              type="button"
              className="inline-flex items-center justify-center text-textparagraph hover:text-primarycolor dark:text-textparagraphlight dark:hover:text-primarycolor transition-colors"
              aria-label={t("View Reason")}
              title={t("View Reason")}
              onClick={() => {
                setIsApprovalReason(false);
                setActiveRejectionReason(item.rejectionReason ?? "");
                setActiveAdminDocuments(item.adminDocuments ?? []);
                setRejectionReasonModalOpen(true);
              }}
            >
              <Info size={16} />
            </button>
          </div>
        );
      },
    };

    const approvalReasonColumn: TableColumn<AdminProperty> = {
      title: t("Approval Reason"),
      field: "rejectionReason",
      render: (item: AdminProperty) => {
        if (!item.rejectionReason) return null;
        return (
          <div className="flex items-center gap-2">
            <span className="min-w-0 flex-1">
              <TruncatedText text={item.rejectionReason} maxLength={40} />
            </span>
            <button
              type="button"
              className="inline-flex items-center justify-center text-textparagraph hover:text-primarycolor dark:text-textparagraphlight dark:hover:text-primarycolor transition-colors"
              aria-label={t("View Reason")}
              title={t("View Reason")}
              onClick={() => {
                setIsApprovalReason(true);
                setActiveRejectionReason(item.rejectionReason ?? "");
                setActiveAdminDocuments(item.adminDocuments ?? []);
                setRejectionReasonModalOpen(true);
              }}
            >
              <Info size={16} />
            </button>
          </div>
        );
      },
    };

    const columns: TableColumn<AdminProperty>[] = [
      {
        title: t("ID"),
        field: "id",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            <TruncatedText text={item.id} maxLength={40} />
          </span>
        ),
      },
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
      ...(mode === "disapproved" ? [rejectionReasonColumn] : []),
      ...(mode === "assets" ? [approvalReasonColumn] : []),
      // Status column is intentionally hidden for Pending Properties view
      // ...(mode === "assets"
      //   ? ([
      //       {
      //         title: t("Status.label"),
      //         field: "status",
      //         render: (item: AdminProperty) => {
      //           const baseClass =
      //             "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border";

      //           let labelKey: string = "Status.PendingApproval";
      //           let className =
      //             "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";

      //           switch (item.status) {
      //             case PropertyStatus.Active:
      //               labelKey = "Status.Active";
      //               className =
      //                 "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
      //               break;
      //             case PropertyStatus.SoldOut:
      //               labelKey = "Status.SoldOut";
      //               className =
      //                 "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700";
      //               break;
      //             case PropertyStatus.Rejected:
      //               labelKey = "Status.Rejected";
      //               className =
      //                 "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
      //               break;
      //             case PropertyStatus.ModificationRequired:
      //               labelKey = "Status.ModificationRequired";
      //               className =
      //                 "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800";
      //               break;
      //             default:
      //               break;
      //           }

      //           return (
      //             <span className={`${baseClass} ${className}`}>
      //               <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      //               {t(labelKey)}
      //             </span>
      //           );
      //         },
      //       },
      //     ] as TableColumn<AdminProperty>[])
      //   : []),
      {
        title: t("Total Value"),
        field: "totalValue",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {formatCurrency(item.totalValue / Math.pow(10, 6))}
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
        render: (item) => (
          <div className="flex items-center justify-end">
            {(() => {
              if (mode === "assets") {
                const isAssetActionLoading =
                  assigningId === item.id ||
                  (isRefreshing && refreshingActionId === item.id);

                return (
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded bg-primarycolor text-black hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isAssetActionLoading}
                    onClick={() => {
                      if (isAssetActionLoading) return;
                      if (!item.id) return;
                      setAssignPropertyId(item.id);
                      setSelectedCompanyId(ASSIGN_COMPANIES[0]?.id ?? null);
                      setAssignModalOpen(true);
                    }}
                  >
                    {isAssetActionLoading && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
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
                        icon:
                          rejectingId === item.id ? (
                            <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                          ) : (
                            <X className="w-4 h-4 text-red-600" />
                          ),
                      },
                    ]
                  : [
                      {
                        label: t("Approve"),
                        value: 1,
                        icon:
                          approvingId === item.id ? (
                            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ),
                      },
                      {
                        label: t("Disapprove"),
                        value: 2,
                        icon:
                          rejectingId === item.id ? (
                            <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                          ) : (
                            <X className="w-4 h-4 text-red-600" />
                          ),
                      },
                    ];

              return (
                <DropdownMenu
                  options={options}
                  isLoading={
                    approvingId === item.id ||
                    rejectingId === item.id ||
                    (isRefreshing && refreshingActionId === item.id)
                  }
                  onSelect={(value) => {
                    if (value === 1) {
                      if (!item.id || approvingId === item.id) return;
                      setApprovePropertyId(item.id);
                      setApproveReason("");
                      setApproveDocuments([]);
                      setApproveModalOpen(true);
                    } else if (value === 2) {
                      // Open disapprove modal
                      if (!item.id) return;
                      setRejectPropertyId(item.id);
                      setRejectReason("");
                      setRejectDocuments([]);
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
  }, [
    t,
    mode,
    approvingId,
    rejectingId,
    assigningId,
    isRefreshing,
    refreshingActionId,
  ]);

  console.log("approveDocuments::", data);
  return (
    <>
      <DataTable data={data} totalCount={totalCount} config={config} />

      {rejectionReasonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-bgwhite p-6 shadow-lg dark:bg-darkbgprimary">
            <h2 className={`mb-2 text-lg font-semibold ${TEXT_PRIMARY}`}>
              {isApprovalReason ? t("Approval Reason") : t("Rejection Reason")}
            </h2>
            <div className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-lg border border-bordergray200 bg-bgwhite px-3 py-2 text-sm text-textprimary dark:border-darkbordercolor1 dark:bg-darkbgbase dark:text-white">
              {activeRejectionReason}
            </div>
            <div className="mt-3">
              <h3 className="mb-2 text-sm font-semibold text-textprimary dark:text-textparagraphlight">
                {t("Official Document from Admin")}
              </h3>

              {activeAdminDocuments.length ? (
                <div className="space-y-2 h-[150px] overflow-y-auto">
                  {activeAdminDocuments.map((doc) => (
                    <div
                      key={doc.documentUrl}
                      className="flex items-center justify-between gap-3 rounded-lg border border-bordergray200 bg-bgwhite p-3 dark:border-darkbordercolor1 dark:bg-darkbgbase"
                    >
                      <div
                        className="flex items-center justify-center w-10 h-10 flex-none bg-white/5 
                      border border-[#292929] rounded-md"
                      >
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-white">
                          {doc.fileName}
                        </div>
                        <div className="truncate text-xs text-textparagraph dark:text-textparagraphlight">
                          {doc.title}
                        </div>
                      </div>

                      <a
                        href={doc.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs border border-white/30 px-3 py-2 rounded-md hover:bg-white/5 transition-colors flex-shrink-0 text-white"
                      >
                        <Eye className="w-4 h-4" />
                        {tCommon("View")}
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-textparagraph dark:text-textparagraphlight">
                  {t("No Official Documents")}
                </p>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="rounded-lg border border-bordergray200 px-4 py-2 text-sm font-medium text-textprimary hover:bg-gray-50 dark:border-darkbordercolor1 dark:text-darklabelprimary dark:hover:bg-darkbgbase"
                onClick={() => {
                  setRejectionReasonModalOpen(false);
                  setActiveRejectionReason("");
                  setActiveAdminDocuments([]);
                  setIsApprovalReason(false);
                }}
              >
                {t("Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {approveModalOpen && approvePropertyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-bgwhite p-6 shadow-lg dark:bg-darkbgprimary">
            <h2 className={`mb-2 text-lg font-semibold ${TEXT_PRIMARY}`}>
              {t("Approve Modal Title")}
            </h2>
            <p className="mb-4 text-sm text-textparagraph dark:text-textparagraphlight">
              {t("Approve Modal Description")}
            </p>
            <label className="mb-1 block text-xs font-medium text-labelprimary dark:text-darklabelprimary">
              {t("Reason Optional Label")}
            </label>
            <textarea
              className="mb-4 h-24 w-full resize-none rounded-lg border border-bordergray200 bg-bgwhite px-3 py-2 text-sm text-textprimary focus:outline-none focus:ring-1 focus:ring-primarycolor dark:border-darkbordercolor1 dark:bg-darkbgbase dark:text-white"
              value={approveReason}
              onChange={(e) => setApproveReason(e.target.value)}
              placeholder=""
            />

            <PropertyDocumentsDropzone
              value={approveDocuments}
              onChange={setApproveDocuments}
              disabled={!!approvingId}
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-bordergray200 px-4 py-2 text-sm font-medium text-textprimary hover:bg-gray-50 dark:border-darkbordercolor1 dark:text-darklabelprimary dark:hover:bg-darkbgbase"
                onClick={() => {
                  if (approvingId) return;
                  setApproveModalOpen(false);
                  setApprovePropertyId(null);
                  setApproveReason("");
                  setApproveDocuments([]);
                }}
              >
                {t("Cancel")}
              </button>
              <button
                type="button"
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
                disabled={!!approvingId}
                onClick={() => {
                  if (!approvePropertyId || approvingId) return;
                  void (async () => {
                    const currentApprovePropertyId = approvePropertyId;
                    try {
                      setApprovingId(approvePropertyId);
                      await approveAdminPropertyAction(approvePropertyId, {
                        reason: approveReason,
                        documents: approveDocuments.map((d) => ({
                          title: getDocumentTitleFromFileName(d.fileName),
                          fileName: d.fileName,
                          documentUrl: d.documentUrl,
                        })),
                      });
                      setApproveModalOpen(false);
                      setApprovePropertyId(null);
                      setApproveReason("");
                      setApproveDocuments([]);
                      setRefreshingActionId(currentApprovePropertyId);
                      startRefreshTransition(() => {
                        router.refresh();
                      });
                    } finally {
                      setApprovingId(null);
                    }
                  })();
                }}
              >
                <span className="inline-flex items-center gap-2">
                  {approvingId === approvePropertyId && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {t("Confirm Approve")}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

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
            <PropertyDocumentsDropzone
              value={rejectDocuments}
              onChange={setRejectDocuments}
              disabled={!!rejectingId}
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
                  setRejectDocuments([]);
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
                    const currentRejectPropertyId = rejectPropertyId;
                    try {
                      setRejectingId(rejectPropertyId);
                      await rejectAdminPropertyAction(
                        rejectPropertyId,
                        rejectReason,
                        rejectDocuments.map((d) => ({
                          title: getDocumentTitleFromFileName(d.fileName),
                          fileName: d.fileName,
                          documentUrl: d.documentUrl,
                        })),
                      );
                      setRejectModalOpen(false);
                      setRejectPropertyId(null);
                      setRejectReason("");
                      setRejectDocuments([]);
                      setRefreshingActionId(currentRejectPropertyId);
                      startRefreshTransition(() => {
                        router.refresh();
                      });
                    } finally {
                      setRejectingId(null);
                    }
                  })();
                }}
              >
                <span className="inline-flex items-center gap-2">
                  {rejectingId === rejectPropertyId && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {t("Confirm Disapprove")}
                </span>
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
              {ASSIGN_COMPANIES.map((c) => (
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
                  if (assigning) return;
                  setAssignModalOpen(false);
                  setAssignPropertyId(null);
                  setSelectedCompanyId(null);
                }}
              >
                {t("Cancel")}
              </button>
              <button
                type="button"
                className="rounded-lg bg-primarycolor px-4 py-2 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-60"
                disabled={!selectedCompanyId || assigning}
                onClick={() => {
                  if (!selectedCompanyId || !assignPropertyId || assigning)
                    return;
                  void (async () => {
                    const currentAssignPropertyId = assignPropertyId;
                    try {
                      setAssigning(true);
                      setAssigningId(assignPropertyId);
                      console.log("Assigning Property ID::", assignPropertyId);
                      console.log("Selected Company ID::", selectedCompanyId);
                      await assignAdminPropertyToOrganisationAction(
                        assignPropertyId,
                        selectedCompanyId,
                      );
                      setAssignModalOpen(false);
                      setAssignPropertyId(null);
                      setSelectedCompanyId(null);
                      setRefreshingActionId(currentAssignPropertyId);
                      startRefreshTransition(() => {
                        router.refresh();
                      });
                    } finally {
                      setAssigning(false);
                    }
                  })();
                }}
              >
                <span className="inline-flex items-center gap-2">
                  {assigning && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("Assign")}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertiesTable;
