"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import DecideKycModal from "./modals/DecideKycModal";
import SearchToolbar from "@/components/atoms/SearchToolbar";
import SelectFilter from "@/components/atoms/SelectFilter";
import { TableColumn } from "@/components/atoms/Table";
import TableActions, {
  TableActionDisplayMode,
} from "@/components/atoms/TableActions";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import {
  KYC_LEVEL_FILTER_OPTIONS,
  KYC_LEVEL_LABELS,
  KYC_VERIFICATION_STATUSES,
  KYC_VERIFICATION_STATUS_BADGE_CLASSES,
  KYC_VERIFICATION_STATUS_LABELS,
  KycLevel,
  KycVerificationStatus,
} from "@/constants/kyc";
import { TEXT_PRIMARY_DARK as TEXT_PRIMARY } from "@/shared/styles";
import { KycReviewListItem } from "@/api/adminKyc.types";

const formatDateTime = (iso: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
};

const getStatusLabel = (status: number): string =>
  KYC_VERIFICATION_STATUS_LABELS[status as KycVerificationStatus] ??
  String(status);

const getStatusBadgeClass = (status: number): string =>
  KYC_VERIFICATION_STATUS_BADGE_CLASSES[status as KycVerificationStatus] ??
  "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";

const getLevelLabel = (level: number): string =>
  KYC_LEVEL_LABELS[level as KycLevel] ?? String(level);

interface KycReviewTableProps {
  data: KycReviewListItem[];
  totalCount: number;
  searchString: string;
}

const KycReviewTable = ({
  data,
  totalCount,
  searchString,
}: KycReviewTableProps) => {
  const t = useTranslations("kyc");
  const common = useTranslations("common");
  const router = useRouter();
  const actionsDisplayMode: TableActionDisplayMode = "inline";

  const [decideTarget, setDecideTarget] = useState<{
    item: KycReviewListItem;
    decision: "approve" | "reject";
  } | null>(null);

  const refresh = () => router.refresh();

  const config: DataTableConfig<KycReviewListItem> = useMemo(() => {
    const columns: TableColumn<KycReviewListItem>[] = [
      {
        field: "userProfile",
        title: t("fullName"),
        render: (item) => (
          <span className={`${TEXT_PRIMARY} font-medium`}>
            {item.userProfile?.name || "-"}
          </span>
        ),
      },
      {
        field: "userProfile",
        title: common("email"),
        render: (item) => (
          <span className={TEXT_PRIMARY}>{item.userProfile?.email || "-"}</span>
        ),
      },
      {
        field: "kycLevel",
        title: t("kycLevel"),
        render: (item) => (
          <span className={TEXT_PRIMARY}>{getLevelLabel(item.kycLevel)}</span>
        ),
      },
      {
        field: "status",
        title: common("status"),
        render: (item) => (
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(item.status)}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {getStatusLabel(item.status)}
          </span>
        ),
      },
      {
        field: "createdAt",
        title: t("createdAt"),
        render: (item) => (
          <span className={TEXT_PRIMARY}>{formatDateTime(item.createdAt)}</span>
        ),
      },
      {
        field: "",
        title: common("actions"),
        render: (item) => {
          const isPending = item.status === KYC_VERIFICATION_STATUSES.PENDING;

          const actions = [
            {
              id: `view-${item.id}`,
              label: t("viewDetails"),
              onClick: () => router.push(`/kyc/${item.id}`),
            },
            ...(isPending
              ? [
                  {
                    id: `approve-${item.id}`,
                    label: common("approve"),
                    className:
                      "inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-600 hover:opacity-90",
                    onClick: () =>
                      setDecideTarget({ item, decision: "approve" }),
                  },
                  {
                    id: `reject-${item.id}`,
                    label: t("reject"),
                    className:
                      "inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded bg-red-50 text-red-600 hover:opacity-90",
                    onClick: () =>
                      setDecideTarget({ item, decision: "reject" }),
                  },
                ]
              : []),
          ];

          return (
            <TableActions displayMode={actionsDisplayMode} actions={actions} />
          );
        },
      },
    ];

    return {
      columns,
      keyExtractor: (item) => item.id,
      paginationTitle: t("kycReviewTitle"),
      hideSelectCol: true,
      emptyMessage: t("noPendingKyc"),
      header: (
        <div className="bg-bgwhite dark:bg-darkbgprimary w-full">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2
                className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
              >
                {t("kycReviewTitle")}
              </h2>
              <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                {t("kycReviewSubtitle")}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <SelectFilter
                id="kyc-level-filter"
                paramName="level"
                options={KYC_LEVEL_FILTER_OPTIONS}
                placeholder={t("levelFilterLabel")}
              />
              <SearchToolbar
                initialQuery={searchString}
                placeholder={t("searchPlaceholder")}
                queryParamName="searchString"
              />
            </div>
          </div>
        </div>
      ),
    };
  }, [actionsDisplayMode, common, router, searchString, t]);

  return (
    <>
      <DataTable data={data} totalCount={totalCount} config={config} />

      {decideTarget && (
        <DecideKycModal
          kycVerificationId={decideTarget.item.id}
          investorName={decideTarget.item.userProfile?.name || ""}
          decision={decideTarget.decision}
          isOpen
          onClose={() => setDecideTarget(null)}
          onSuccess={refresh}
        />
      )}
    </>
  );
};

export default KycReviewTable;
