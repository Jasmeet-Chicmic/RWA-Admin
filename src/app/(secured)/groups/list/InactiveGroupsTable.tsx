"use client";

import { useCallback, useMemo, useState } from "react";
import { Eye, Mail, Menu, RotateCcw } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { TableColumn } from "@/components/atoms/Table";
import SearchToolbar from "@/components/atoms/SearchToolbar";
import ConfirmationModal from "@/components/molecules/ConfirmationModal/ConfirmationModal";
import FilterSidebar from "@/components/molecules/FilterSidebar";
import EventParticipantItem from "@/components/molecules/event/EventParticipantItem";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { InactiveGroup } from "@/app/(secured)/groups/helpers/types";
import { sendInactiveGroupAlertAction } from "@/api/groups";
import FormattedDate from "@/components/atoms/FormattedDate";
import { PRIVATE_ROUTES } from "@/shared/routes";
import { SORT_DIRECTIONS } from "@/shared/types";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import GroupFilters from "./GroupFilters";

interface InactiveGroupsTableProps {
  data: InactiveGroup[];
  totalCount: number;
  searchText: string;
}

const InactiveGroupsTable = ({
  data,
  totalCount,
  searchText,
}: InactiveGroupsTableProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("groups");
  const [sendEmailModal, setSendEmailModal] = useState<{
    open: boolean;
    group: InactiveGroup | null;
  }>({ open: false, group: null });
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSendEmail = useCallback(
    async (groupId: string) => {
      if (!groupId) return;
      setSendingId(groupId);
      try {
        const res = await sendInactiveGroupAlertAction(groupId);
        if (res?.status) {
          toast.success(res.message || t("emailSentSuccessfully"));
          setSendEmailModal({ open: false, group: null });
          router.refresh();
        } else {
          toast.error(res?.message || t("failedToSendEmail"));
        }
      } catch (error) {
        console.error("Send inactive group email failed", error);
        toast.error(t("failedToSendEmail"));
      } finally {
        setSendingId(null);
      }
    },
    [router, t],
  );

  const config: DataTableConfig<InactiveGroup> = useMemo(() => {
    const columns: TableColumn<InactiveGroup>[] = [
      {
        title: t("groupName"),
        field: "groupName",
        render: (item) => (
          <span
            className={`font-medium ${TEXT_PRIMARY}`}
            title={item.groupName}
          >
            {item.groupName || "—"}
          </span>
        ),
      },
      // {
      //   title: t("adminContactEmail"),
      //   field: "contactEmail",
      //   render: (item) => (
      //     <span className={TEXT_SIZE_SM}>
      //       {item.contactEmail?.trim() || "—"}
      //     </span>
      //   ),
      // },
      {
        title: t("owner"),
        field: "ownerId",
        render: (item) => (
          <EventParticipantItem
            userId={item.ownerId}
            name={item.ownerName}
            email={item.ownerEmail}
            userProfilePicture={item.ownerProfilePicture}
            avatarSize="w-8 h-8"
            showEmail={true}
            fallbackName={t("unknownUser")}
          />
        ),
      },
      {
        title: t("dateCreated"),
        field: "createdOn",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            <FormattedDate date={item.createdOn} />
          </span>
        ),
      },
      {
        title: t("daysWithoutActivity"),
        field: "daysSinceLastActivity",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.daysSinceLastActivity ?? "—"}
          </span>
        ),
      },
      {
        title: t("actions"),
        field: "",
        fixed: "right",
        render: (item) => (
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`${PRIVATE_ROUTES.GROUPS_VIEW}/${item.groupId}`);
              }}
              className="text-gray-500 hover:text-primarycolor dark:hover:text-secondarycolor transition-colors dark:text-sidebartext"
              title={t("viewGroup")}
            >
              <Eye size={18} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSendEmailModal({ open: true, group: item });
              }}
              disabled={!!sendingId}
              className="text-gray-500 hover:text-primarycolor dark:hover:text-secondarycolor transition-colors dark:text-sidebartext disabled:opacity-50"
              title={t("sendEmail")}
            >
              <Mail size={18} />
            </button>
          </div>
        ),
      },
    ];

    return {
      columns,
      keyExtractor: (item) => item.groupId,
      paginationTitle: "inactive groups",
      hideSelectCol: true,
      emptyMessage: t("noInactiveGroupsFound"),
      queryConfig: {
        defaultSortKey: "DaysSinceLastActivity",
        defaultSortDirection: SORT_DIRECTIONS.DESC,
      },
      header: (
        <div className="bg-bgwhite dark:bg-darkbgprimary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2
                className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
              >
                {t("inactiveGroups")}
              </h2>
              <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                {t("inactiveGroupsSubtitle")}
              </p>
            </div>
            <div className="flex items-initial space-x-4">
              <SearchToolbar
                initialQuery={searchText}
                placeholder={t("searchGroups")}
                queryParamName="searchText"
              />
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 transition-all duration-200 focus:outline-none focus:ring-0 font-medium bg-primarycolor text-bgwhite dark:bg-secondarycolor dark:text-white hover:bg-primaryhover dark:hover:bg-secondaryhover rounded-lg"
              >
                <Menu size={18} />
                <span>{t("filters")}</span>
              </button>
            </div>
          </div>
        </div>
      ),
    };
  }, [t, router, sendingId, searchText]);

  return (
    <>
      <DataTable<InactiveGroup>
        data={data}
        totalCount={totalCount}
        config={config}
      />
      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title={t("groupFilters")}
        footer={
          <button
            onClick={() => {
              router.push(pathname);
              setIsFilterOpen(false);
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 dark:bg-darkbgprimary text-labelprimary dark:text-darklabelprimary rounded-xl hover:bg-gray-200 dark:hover:bg-labelprimary transition-all border bordergray200 dark:border-labelprimary font-medium"
          >
            <RotateCcw size={18} />
            <span>{t("clearAllFilters")}</span>
          </button>
        }
      >
        <GroupFilters />
      </FilterSidebar>
      <ConfirmationModal
        isOpen={sendEmailModal.open}
        onClose={() => {
          if (!sendingId) setSendEmailModal({ open: false, group: null });
        }}
        onConfirm={async () => {
          if (!sendEmailModal.group) return;
          await handleSendEmail(sendEmailModal.group.groupId);
        }}
        title={t("sendEmail")}
        message={t("sendEmailConfirmation")}
        isLoading={!!sendingId}
      />
    </>
  );
};

export default InactiveGroupsTable;
