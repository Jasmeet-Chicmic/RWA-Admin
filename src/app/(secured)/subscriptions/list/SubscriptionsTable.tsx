"use client";

import { useMemo, useState } from "react";
import { Menu, RotateCcw } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import SearchToolbar from "@/components/atoms/SearchToolbar";
import { TableColumn } from "@/components/atoms/Table";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import FilterSidebar from "@/components/molecules/FilterSidebar";
import EditSubscriptionModal from "@/components/molecules/subscription/EditSubscriptionModal";
import { Subscription } from "@/shared/types";
import {
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_STATUS_LABELS,
  SUBSCRIPTION_OWNER_TYPE,
  SUBSCRIPTION_OWNER_TYPE_LABELS,
  BILLING_CYCLE,
  BILLING_CYCLE_LABELS,
} from "@/shared/constants";
import FormattedDate from "@/components/atoms/FormattedDate";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import { TableHeaderWithInfo } from "@/components/atoms/TableHeaderWithInfo";
import SubscriptionFilters from "./SubscriptionFilters";

const STATUS_BADGE_STYLES: Record<number, string> = {
  [SUBSCRIPTION_STATUS.ACTIVE]:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  [SUBSCRIPTION_STATUS.PAST_DUE]:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  [SUBSCRIPTION_STATUS.CANCELLED]:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  [SUBSCRIPTION_STATUS.TRIALING]:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  [SUBSCRIPTION_STATUS.INCOMPLETE]:
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  [SUBSCRIPTION_STATUS.PAUSED]:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

const DEFAULT_BADGE_STYLE =
  "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";

const CYCLE_BADGE_STYLES: Record<number, string> = {
  [BILLING_CYCLE.MONTHLY]: "text-primarycolor bg-primarycolor/10",
  [BILLING_CYCLE.YEARLY]: "text-white bg-secondarycolor/50",
};

interface SubscriptionsTableProps {
  data: Subscription[];
  totalCount: number;
  searchText: string;
}

const SubscriptionsTable = ({
  data,
  totalCount,
  searchText,
}: SubscriptionsTableProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const t = useTranslations("subscriptions");

  const config: DataTableConfig<Subscription> = useMemo(() => {
    const columns: TableColumn<Subscription>[] = [
      {
        title: t("Customer Name"),
        field: "customerName",
        render: (item: Subscription) => (
          <div>
            <p className={`font-medium ${TEXT_PRIMARY}`}>
              {item.customerName || "—"}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {item.customerEmail}
            </p>
          </div>
        ),
      },
      {
        title: t("Subscription Owner"),
        field: "ownerType",
        render: (item: Subscription) => {
          const label =
            item.ownerTypeDisplay ||
            SUBSCRIPTION_OWNER_TYPE_LABELS[
              item.ownerType as SUBSCRIPTION_OWNER_TYPE
            ];
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                item.ownerType === SUBSCRIPTION_OWNER_TYPE.ORGANISATION
                  ? "bg-primarycolor text-white"
                  : "bg-secondarycolor text-white"
              }`}
            >
              {label ? t(label) : "—"}
            </span>
          );
        },
      },
      {
        title: t("Plan Name"),
        field: "planName",
        render: (item: Subscription) => (
          <div>
            <span className={`font-medium ${TEXT_PRIMARY}`}>
              {item.planName}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1.5">
              ({item.planCode})
            </span>
          </div>
        ),
      },
      {
        title: (
          <TableHeaderWithInfo
            label={t("Subscription Status")}
            options={[
              t("Active"),
              t("Past Due"),
              t("Cancelled"),
              t("Trialing"),
              t("Incomplete"),
              t("Paused"),
              t("Unknown"),
            ]}
          />
        ),
        field: "status",
        render: (item: Subscription) => {
          const badgeStyle =
            STATUS_BADGE_STYLES[item.status] || DEFAULT_BADGE_STYLE;
          const label =
            item.statusDisplay ||
            SUBSCRIPTION_STATUS_LABELS[item.status as SUBSCRIPTION_STATUS];
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badgeStyle}`}
            >
              {label ? t(label) : t("Unknown")}
            </span>
          );
        },
      },
      {
        title: (
          <TableHeaderWithInfo
            label={t("Billing Cycle")}
            options={[t("Monthly"), t("Yearly")]}
          />
        ),
        field: "billingCycle",
        render: (item: Subscription) => {
          const cycleStyle =
            CYCLE_BADGE_STYLES[item.billingCycle] || DEFAULT_BADGE_STYLE;
          const label =
            item.billingCycleDisplay ||
            BILLING_CYCLE_LABELS[item.billingCycle as BILLING_CYCLE];
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cycleStyle}`}
            >
              {label ? t(label) : "—"}
            </span>
          );
        },
      },
      {
        title: t("Seat Count"),
        field: "seatCount",
        render: (item: Subscription) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.seatCount}
          </span>
        ),
      },
      {
        title: t("Subscription Start Date"),
        field: "startDate",
        render: (item: Subscription) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.startDate ? <FormattedDate date={item.startDate} /> : "—"}
          </span>
        ),
        sortable: true,
        sortKey: "startDate",
      },
      {
        title: t("Subscription End Date"),
        field: "endDate",
        render: (item: Subscription) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.endDate ? <FormattedDate date={item.endDate} /> : "—"}
          </span>
        ),
        sortable: true,
        sortKey: "endDate",
      },
      // {
      //   title: t("Created"),
      //   field: "createdOn",
      //   render: (item: Subscription) => (
      //     <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
      //       {item.createdOn ? formatDate(item.createdOn) : "—"}
      //     </span>
      //   ),
      //   sortable: true,
      //   sortKey: "createdOn",
      // },
      // {
      //   title: t("Actions"),
      //   field: "subscriptionId",
      //   render: (item: Subscription) => (
      //     <button
      //       onClick={() => setEditingSubscription(item)}
      //       className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primarycolor dark:text-secondarycolor bg-primarycolor/10 dark:bg-secondarycolor/10 hover:bg-primarycolor/20 dark:hover:bg-secondarycolor/20 transition-all"
      //     >
      //       <Pencil className="w-3.5 h-3.5" />
      //       {t("Edit")}
      //     </button>
      //   ),
      // },
    ];

    return {
      columns,
      keyExtractor: (item) => item.subscriptionId,
      paginationTitle: t("Subscriptions").toLowerCase(),
      hideSelectCol: true,
      emptyMessage: t("No subscriptions found"),
      queryConfig: {
        defaultSortKey: "createdOn",
        defaultSortDirection: "DESC",
      },
      header: (
        <div className="bg-bgwhite dark:bg-darkbgprimary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2
                className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
              >
                {t("Subscriptions")}
              </h2>
              <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                {t("All subscription plans")}
              </p>
            </div>
            <div className="flex items-initial space-x-4">
              <SearchToolbar
                initialQuery={searchText}
                placeholder={t("Search Subscriptions")}
                queryParamName="searchText"
              />
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 transition-all duration-200 focus:outline-none focus:ring-0 font-medium bg-primarycolor text-bgwhite dark:bg-secondarycolor dark:text-white hover:bg-primaryhover dark:hover:bg-secondaryhover rounded-lg"
              >
                <Menu size={18} />
                <span>{t("Filters")}</span>
              </button>
            </div>
          </div>
        </div>
      ),
    };
  }, [searchText, t]);

  return (
    <>
      <DataTable<Subscription>
        data={data}
        totalCount={totalCount}
        config={config}
      />
      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title={t("Subscription Filters")}
        footer={
          <button
            onClick={() => {
              router.push(pathname);
              setIsFilterOpen(false);
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 dark:bg-darkbgprimary text-labelprimary dark:text-darklabelprimary rounded-xl hover:bg-gray-200 dark:hover:bg-labelprimary transition-all border bordergray200 dark:border-labelprimary font-medium"
          >
            <RotateCcw size={18} />
            <span>{t("Clear All Filters")}</span>
          </button>
        }
      >
        <SubscriptionFilters />
      </FilterSidebar>

      {editingSubscription && (
        <EditSubscriptionModal
          isOpen={!!editingSubscription}
          onClose={() => setEditingSubscription(null)}
          subscription={editingSubscription}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  );
};

export default SubscriptionsTable;
