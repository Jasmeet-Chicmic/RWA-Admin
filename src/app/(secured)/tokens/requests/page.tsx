"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";

import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { TableColumn } from "@/components/atoms/Table";
import DropdownMenu from "@/components/atoms/DropdownMenu/DropdownMenu";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import {
  getAdminTokenRequestsAction,
  reviewAdminTokenRequestAction,
  TokenRequest,
} from "@/api/adminTokens";

type TokenRequestRow = TokenRequest;

const TokenRequestsPage = () => {
  const t = useTranslations("common");
  const [data, setData] = useState<TokenRequestRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getAdminTokenRequestsAction();
        console.log("Token Requests", res);
        setData(res || []);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleReview = async (requestId: string, approve: boolean) => {
    try {
      setActionLoadingId(requestId);
      await reviewAdminTokenRequestAction({
        requestId,
        approve,
        rejectionReason: null,
      });

      // Refresh list after action
      const updated = await getAdminTokenRequestsAction();
      setData(updated || []);
    } finally {
      setActionLoadingId(null);
    }
  };

  const config: DataTableConfig<TokenRequestRow> = {
    columns: [
      {
        field: "userId",
        title: t("userId"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.userId}
          </span>
        ),
      },
      {
        field: "requestedAmount",
        title: t("requestedAmount"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.requestedAmount}
          </span>
        ),
      },
      {
        field: "createdAt",
        title: t("tokenRequestsDate"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {new Date(item.createdAt).toLocaleString()}
          </span>
        ),
      },
      {
        field: "status",
        title: t("status"),
        render: (item) => {
          const isPending = item.status === 0;
          const isApproved = item.status === 1;

          const colorClasses = isApproved
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
            : isPending
              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";

          const labelKey = isApproved
            ? "statusApproved"
            : isPending
              ? "statusPending"
              : "statusRejected";

          return (
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${colorClasses}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
              {t(labelKey)}
            </span>
          );
        },
      },
      {
        field: "actions",
        title: t("actions"),
        render: (item) => (
          <div className="flex items-center justify-end">
            <DropdownMenu
              options={[
                {
                  label: t("approve"),
                  value: 1,
                  icon: <Check className="w-4 h-4 text-emerald-600" />,
                },
                {
                  label: t("reject"),
                  value: 2,
                  icon: <X className="w-4 h-4 text-red-600" />,
                },
              ]}
              onSelect={(value) => {
                if (actionLoadingId === item.requestId) return;
                if (value === 1) {
                  void handleReview(item.requestId, true);
                } else if (value === 2) {
                  void handleReview(item.requestId, false);
                }
              }}
            />
          </div>
        ),
      },
    ] as TableColumn<TokenRequestRow>[],
    keyExtractor: (item) => item.requestId,
    paginationTitle: "Token Requests",
    hideSelectCol: true,
    emptyMessage: t("noTokenRequests"),
    queryConfig: {
      defaultSortKey: "createdAt",
    },
    header: (
      <div className="bg-bgwhite dark:bg-darkbgprimary">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2
              className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
            >
              {t("tokenRequestsTitle")}
            </h2>
            <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
              {t("tokenRequestsSubtitle")}
            </p>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
      {loading ? (
        <div className="bg-bgwhite dark:bg-darkbgprimary rounded-[12px] p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-6 w-56 rounded bg-gray-200 dark:bg-darkbgbase" />
            <div className="h-4 w-96 max-w-full rounded bg-gray-200 dark:bg-darkbgbase" />
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="h-10 w-full rounded bg-gray-200 dark:bg-darkbgbase"
              />
            ))}
          </div>
        </div>
      ) : (
        <DataTable data={data} totalCount={data.length} config={config} />
      )}
    </div>
  );
};

export default TokenRequestsPage;
