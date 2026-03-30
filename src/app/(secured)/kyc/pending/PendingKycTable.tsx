"use client";

import { Check, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { approveAdminKycAction, rejectAdminKycAction } from "@/api/adminKyc";
import { PendingKycItem } from "@/api/adminKyc.types";
import { TableColumn } from "@/components/atoms/Table";
import TableActions, {
  TableActionDisplayMode,
} from "@/components/atoms/TableActions";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { TEXT_PRIMARY_DARK as TEXT_PRIMARY } from "@/shared/styles";

type PendingKycTableRow = PendingKycItem;

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
};

const PendingKycTable = ({
  data,
  totalCount,
}: {
  data: PendingKycTableRow[];
  totalCount: number;
}) => {
  const t = useTranslations("kyc");
  const common = useTranslations("common");
  const router = useRouter();
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectKycId, setRejectKycId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const actionsDisplayMode: TableActionDisplayMode = "inline";

  const config: DataTableConfig<PendingKycTableRow> = useMemo(() => {
    const columns: TableColumn<PendingKycTableRow>[] = [
      {
        field: "fullName",
        title: t("fullName"),
        render: (item) => (
          <span className={`${TEXT_PRIMARY} font-medium`}>{item.fullName}</span>
        ),
      },
      {
        field: "userId",
        title: t("userId"),
        render: (item) => <span className={TEXT_PRIMARY}>{item.userId}</span>,
      },
      {
        field: "kycId",
        title: t("kycId"),
        render: (item) => <span className={TEXT_PRIMARY}>{item.kycId}</span>,
      },
      {
        field: "createdAt",
        title: t("createdAt"),
        render: (item) => (
          <span className={TEXT_PRIMARY}>{formatDateTime(item.createdAt)}</span>
        ),
      },
      // {
      //   field: "status",
      //   title: common("Status"),
      //   render: () => (
      //     <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
      //       <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      //       {t("pending")}
      //     </span>
      //   ),
      // },
      {
        field: "",
        title: common("Actions"),
        render: (item) => (
          <TableActions
            displayMode={actionsDisplayMode}
            actions={(() => {
              const isLoading = actionLoadingId === item.kycId;
              return [
                {
                  id: "approve",
                  label: common("Approve"),
                  disabled: isLoading,
                  className:
                    "inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-600 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed",
                  icon: isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  ),
                  onClick: () => {
                    if (isLoading || !item.kycId) return;
                    void (async () => {
                      try {
                        setActionLoadingId(item.kycId);
                        await approveAdminKycAction(item.kycId);
                        router.refresh();
                      } finally {
                        setActionLoadingId(null);
                      }
                    })();
                  },
                },
                {
                  id: "reject",
                  label: t("disapprove"),
                  disabled: isLoading,
                  className:
                    "inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded bg-red-50 text-red-600 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed",
                  icon: isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  ),
                  onClick: () => {
                    if (isLoading || !item.kycId) return;
                    setRejectKycId(item.kycId);
                    setRejectReason("");
                    setRejectModalOpen(true);
                  },
                },
              ];
            })()}
          />
        ),
      },
    ];

    return {
      columns,
      keyExtractor: (item) => item.kycId,
      paginationTitle: t("pendingKycTitle"),
      hideSelectCol: true,
      emptyMessage: t("noPendingKyc"),
      header: (
        <div className="bg-bgwhite dark:bg-darkbgprimary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2
                className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
              >
                {t("pendingKycTitle")}
              </h2>
              <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                {t("pendingKycSubtitle")}
              </p>
            </div>
          </div>
        </div>
      ),
    };
  }, [actionLoadingId, common, router, t]);

  return (
    <>
      <DataTable data={data} totalCount={totalCount} config={config} />

      {rejectModalOpen && rejectKycId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-bgwhite p-6 shadow-lg dark:bg-darkbgprimary">
            <h2 className={`mb-2 text-lg font-semibold ${TEXT_PRIMARY}`}>
              {t("disapproveModalTitle")}
            </h2>
            <p className="mb-4 text-sm text-textparagraph dark:text-textparagraphlight">
              {t("disapproveModalDescription")}
            </p>

            <label className="mb-1 block text-xs font-medium text-labelprimary dark:text-darklabelprimary">
              {t("reasonOptionalLabel")}
            </label>
            <textarea
              className="mb-4 h-24 w-full resize-none rounded-lg border border-bordergray200 bg-bgwhite px-3 py-2 text-sm text-textprimary focus:outline-none focus:ring-1 focus:ring-primarycolor dark:border-darkbordercolor1 dark:bg-darkbgbase dark:text-white"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t("reasonPlaceholder")}
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-bordergray200 px-4 py-2 text-sm font-medium text-textprimary hover:bg-gray-50 dark:border-darkbordercolor1 dark:text-darklabelprimary dark:hover:bg-darkbgbase"
                onClick={() => {
                  if (actionLoadingId) return;
                  setRejectModalOpen(false);
                  setRejectKycId(null);
                  setRejectReason("");
                }}
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
                disabled={!!actionLoadingId}
                onClick={() => {
                  if (!rejectKycId || actionLoadingId) return;
                  void (async () => {
                    try {
                      setActionLoadingId(rejectKycId);
                      await rejectAdminKycAction(rejectKycId, rejectReason);
                      setRejectModalOpen(false);
                      setRejectKycId(null);
                      setRejectReason("");
                      router.refresh();
                    } finally {
                      setActionLoadingId(null);
                    }
                  })();
                }}
              >
                {t("confirmDisapprove")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PendingKycTable;
