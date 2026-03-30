"use client";

import { useCallback, useMemo, useState } from "react";
import { Eye, Trash2, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import SearchToolbar from "@/components/atoms/SearchToolbar";
import { TableColumn } from "@/components/atoms/Table";
import ConfirmationModal from "@/components/molecules/ConfirmationModal/ConfirmationModal";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import CustomMenu from "@/components/atoms/Menu/Menu";
import {
  AdminGroup,
  GROUP_TYPE_LABELS,
} from "@/app/(secured)/groups/helpers/types";
import { deleteGroupsAction, toggleGroupStatusAction } from "@/api/groups";
import FormattedDate from "@/components/atoms/FormattedDate";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import { TableHeaderWithInfo } from "@/components/atoms/TableHeaderWithInfo";
import { Menu, RotateCcw } from "lucide-react";
import FilterSidebar from "@/components/molecules/FilterSidebar";
import GroupFilters from "./GroupFilters";
import { usePathname } from "next/navigation";

const StatusPill = ({
  label,
  colorClass,
  showIcon = false,
}: {
  label: string;
  colorClass: string;
  showIcon?: boolean;
}) => (
  <span
    className={`inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-semibold border border-${colorClass}/20 bg-${colorClass}/10 text-${colorClass} whitespace-nowrap`}
  >
    <span className={`w-1.5 h-1.5 rounded-full bg-${colorClass} mr-2`} />
    {label}
    {showIcon && <ChevronDown size={14} className="ml-2 opacity-50" />}
  </span>
);

interface GroupsTableProps {
  data: AdminGroup[];
  totalCount: number;
  searchText: string;
}

const GroupsTable = ({ data, totalCount, searchText }: GroupsTableProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("groups");
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleToggleGroupStatus = useCallback(
    async (groupId: string, isActive: boolean) => {
      setIsActionLoading(groupId);
      try {
        const res = (await toggleGroupStatusAction({
          groupId,
          isFlagged: !isActive, // isFlagged=true means inactive, false means active
          reassignedToUserId: null,
        })) as { status?: boolean; message?: string };

        if (res.status) {
          toast.success(res.message || t("groupStatusUpdatedSuccessfully"));
          router.refresh();
        } else {
          toast.error(res.message || t("failedToUpdateGroupStatus"));
        }
      } catch (error) {
        console.error("Failed to toggle group status", error);
        toast.error(t("failedToUpdateGroupStatus"));
      } finally {
        setIsActionLoading(null);
      }
    },
    [router, t],
  );

  const handleDeleteGroup = useCallback(
    async (id: string) => {
      if (!id) return;
      setDeletingId(id);
      try {
        const res = (await deleteGroupsAction({
          groupIds: [id],
        })) as { status?: boolean; message?: string };
        if (res.status) {
          toast.success(res.message || t("groupDeletedSuccessfully"));
          setDeleteModal({ open: false, id: null });
          router.refresh();
        } else {
          toast.error(res.message || t("failedToDeleteGroup"));
        }
      } catch (error) {
        console.error("Failed to delete group", error);
        toast.error(t("failedToDeleteGroup"));
      } finally {
        setDeletingId(null);
      }
    },
    [router, t],
  );

  const config: DataTableConfig<AdminGroup> = useMemo(() => {
    const columns: TableColumn<AdminGroup>[] = [
      {
        title: t("groupName"),
        field: "name",
        render: (item: AdminGroup) => (
          <span className={`font-medium ${TEXT_PRIMARY}`} title={item.name}>
            {item.name || "—"}
          </span>
        ),
        sortable: true,
        sortKey: "Name",
      },
      {
        title: t("groupType"),
        field: "type",
        render: (item: AdminGroup) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {GROUP_TYPE_LABELS[item.type] || "—"}
          </span>
        ),
        sortable: true,
        sortKey: "Type",
      },
      {
        title: t("memberCount"),
        field: "membersCount",
        render: (item: AdminGroup) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.membersCount ?? 0}
          </span>
        ),
        sortable: true,
        sortKey: "MembersCount",
      },
      {
        title: t("reportCount"),
        field: "reportCount",
        render: (item: AdminGroup) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.reportCount ?? 0}
          </span>
        ),
        sortable: true,
        sortKey: "ReportCount",
      },
      {
        title: (
          <TableHeaderWithInfo
            label={t("groupStatus")}
            options={[t("active"), t("inactive")]}
          />
        ),
        field: "isActive",
        render: (item: AdminGroup) => {
          const isLoading = isActionLoading === item.id;
          return (
            <CustomMenu
              menuButton={
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${TEXT_SIZE_SM} font-bold transition-all duration-200 border cursor-pointer ${
                    item.isActive
                      ? "bg-primarycolor/10 text-primarycolor border-primarycolor/20 dark:bg-primarycolor/10 dark:text-white/80 dark:border-secondarycolor/10"
                      : "bg-red-50 text-red-600 border-red-500 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.isActive
                        ? "bg-primarycolor dark:bg-white/80"
                        : "bg-red-500"
                    }`}
                  />
                  {item.isActive ? t("active") : t("inactive")}
                  <ChevronDown size={14} className="opacity-60" />
                </div>
              }
              items={[
                {
                  label: (
                    <div className="flex items-center gap-2 py-1">
                      <div className="w-2 h-2 rounded-full bg-primarycolor dark:bg-white/80" />
                      <span className="font-medium">{t("active")}</span>
                    </div>
                  ),
                  onClick: () => void handleToggleGroupStatus(item.id, true),
                  disabled: item.isActive || isLoading,
                },
                {
                  label: (
                    <div className="flex items-center gap-2 py-1">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="font-medium">{t("inactive")}</span>
                    </div>
                  ),
                  onClick: () => void handleToggleGroupStatus(item.id, false),
                  disabled: !item.isActive || isLoading,
                },
              ]}
            />
          );
        },
      },
      {
        title: (
          <TableHeaderWithInfo
            label={t("joinStatus")}
            options={[t("open"), t("closed")]}
          />
        ),
        field: "isClosed",
        render: (item: AdminGroup) =>
          item.isClosed ? (
            <StatusPill label={t("closed")} colorClass="secondarycolor" />
          ) : (
            <StatusPill label={t("open")} colorClass="lightgreen" />
          ),
      },
      {
        title: (
          <TableHeaderWithInfo
            label={t("publicationState")}
            options={[t("draft"), t("published")]}
          />
        ),
        field: "isDraft",
        render: (item: AdminGroup) =>
          item.isDraft ? (
            <StatusPill label={t("draft")} colorClass="primarycolor" />
          ) : (
            <StatusPill label={t("published")} colorClass="lightgreen" />
          ),
      },
      {
        title: t("dateCreated"),
        field: "createdOn",
        render: (item: AdminGroup) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            <FormattedDate date={item.createdOn} />
          </span>
        ),
        sortable: true,
        sortKey: "CreatedOn",
      },
      {
        title: t("actions"),
        field: "",
        fixed: "right",
        render: (item: AdminGroup) => (
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/groups/view/${item.id}`);
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
                setDeleteModal({ open: true, id: item.id });
              }}
              className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors dark:text-sidebartext disabled:opacity-50"
              title={t("delete")}
              disabled={deletingId === item.id}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ),
      },
    ];

    return {
      columns,
      keyExtractor: (item) => item.id,
      paginationTitle: "groups",
      queryConfig: {
        defaultSortKey: "CreatedOn",
        defaultSortDirection: "DESC",
      },
      header: (
        <div className="bg-bgwhite dark:bg-darkbgprimary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2
                className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
              >
                {t("groups")}
              </h2>
              <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                {t("groupsSubtitle")}
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
  }, [
    ,
    searchText,
    t,
    deletingId,
    router,
    handleToggleGroupStatus,
    isActionLoading,
  ]);

  return (
    <>
      <DataTable<AdminGroup>
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
        isOpen={deleteModal.open}
        onClose={() => {
          if (deletingId) return;
          setDeleteModal({ open: false, id: null });
        }}
        onConfirm={async () => {
          if (!deleteModal.id) return;
          await handleDeleteGroup(deleteModal.id);
        }}
        title={t("deleteGroup")}
        message={t("deleteGroupConfirmation")}
        isLoading={!!deletingId}
      />
    </>
  );
};

export default GroupsTable;
