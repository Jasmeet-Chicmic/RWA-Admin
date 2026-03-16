"use client";

import { useCallback, useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import SearchToolbar from "@/components/atoms/SearchToolbar";
import Pagination from "@/components/atoms/Pagination";
import Table, { TableColumn } from "@/components/atoms/Table";
import ConfirmationModal from "@/components/molecules/ConfirmationModal/ConfirmationModal";
import {
  AdminGroup,
  GROUP_TYPE_LABELS,
} from "@/app/(secured)/groups/helpers/types";
import { deleteGroupsAction } from "@/api/groups";
import FormattedDate from "@/components/atoms/FormattedDate";
import { useTableQuerySync } from "@/hooks/useTableQuerySync";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import { TableHeaderWithInfo } from "@/components/atoms/TableHeaderWithInfo";

const StatusPill = ({
  label,
  colorClass,
}: {
  label: string;
  colorClass: string;
}) => (
  <span
    className={`inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-semibold border border-${colorClass}/20 bg-${colorClass}/10 text-${colorClass} whitespace-nowrap`}
  >
    <span className={`w-1.5 h-1.5 rounded-full bg-${colorClass} mr-2`} />
    {label}
    {/* <ChevronDown size={14} className="ml-2 opacity-50" /> */}
  </span>
);

interface UserGroupsTableProps {
  data: AdminGroup[];
  totalCount: number;
  userId: string;
  searchText: string;
}

const UserGroupsTable = ({
  data,
  totalCount,
  searchText,
}: UserGroupsTableProps) => {
  const router = useRouter();
  const t = useTranslations("groups");

  const {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    sortKey,
    sortDirection,
  } = useTableQuerySync({
    defaultPageSize: 10,
    defaultSortKey: "CreatedOn",
    defaultSortDirection: "DESC",
  });

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteGroup = useCallback(
    async (id: string) => {
      if (!id) return;
      setDeletingId(id);
      try {
        const res = (await deleteGroupsAction({
          groupIds: [id],
        })) as { status?: boolean; message?: string };
        if (res.status) {
          toast.success(res.message || t("Group deleted successfully"));
          setDeleteModal({ open: false, id: null });
          router.refresh();
        } else {
          toast.error(res.message || t("Failed to delete group"));
        }
      } catch (error) {
        console.error("Failed to delete group", error);
        toast.error(t("Failed to delete group"));
      } finally {
        setDeletingId(null);
      }
    },
    [router, t],
  );

  const columns: TableColumn<AdminGroup>[] = [
    {
      title: t("Group Name"),
      field: "name",
      render: (item) => (
        <span className={`font-medium ${TEXT_PRIMARY}`} title={item.name}>
          {item.name || "—"}
        </span>
      ),
      sortable: true,
      sortKey: "Name",
    },
    {
      title: t("Group Type"),
      field: "type",
      render: (item) => (
        <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
          {GROUP_TYPE_LABELS[item.type] || "—"}
        </span>
      ),
      sortable: true,
      sortKey: "Type",
    },
    {
      title: t("Member Count"),
      field: "membersCount",
      render: (item) => (
        <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
          {item.membersCount ?? 0}
        </span>
      ),
      sortable: true,
      sortKey: "MembersCount",
    },
    {
      title: t("Report Count"),
      field: "reportCount",
      render: (item) => (
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
          label={t("Group Status")}
          options={[t("Active"), t("Inactive")]}
        />
      ),
      field: "isActive",
      render: (item) =>
        item.isActive ? (
          <StatusPill label={t("Active")} colorClass="primarycolor" />
        ) : (
          <StatusPill label={t("Inactive")} colorClass="lightred" />
        ),
    },
    {
      title: (
        <TableHeaderWithInfo
          label={t("Join Status")}
          options={[t("Open"), t("Closed")]}
        />
      ),
      field: "isClosed",
      render: (item) =>
        item.isClosed ? (
          <StatusPill label={t("Closed")} colorClass="secondarycolor" />
        ) : (
          <StatusPill label={t("Open")} colorClass="lightgreen" />
        ),
    },
    {
      title: (
        <TableHeaderWithInfo
          label={t("Publication State")}
          options={[t("Draft"), t("Published")]}
        />
      ),
      field: "isDraft",
      render: (item) =>
        item.isDraft ? (
          <StatusPill label={t("Draft")} colorClass="primarycolor" />
        ) : (
          <StatusPill label={t("Published")} colorClass="lightgreen" />
        ),
    },
    {
      title: t("Date Created"),
      field: "createdOn",
      render: (item) => (
        <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
          <FormattedDate date={item.createdOn} />
        </span>
      ),
      sortable: true,
      sortKey: "CreatedOn",
    },
    {
      title: t("Actions"),
      field: "",
      fixed: "right",
      render: (item) => (
        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteModal({ open: true, id: item.id });
            }}
            className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors dark:text-sidebartext disabled:opacity-50"
            title={t("Delete")}
            disabled={deletingId === item.id}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-w-0 w-full overflow-hidden space-y-4 bg-bgwhite dark:bg-darkbgprimary dark:border-darkbordercolor1 border border-b border-bordergray200ordercolor1 rounded-[20px] p-4 lg:p-5 3xl:p-6">
      <div className="bg-bgwhite dark:bg-darkbgprimary">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2
              className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
            >
              {t("User Groups")}
            </h2>
            <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
              {t("User Groups subtitle")}
            </p>
          </div>
          <div className="flex items-initial space-x-4">
            <SearchToolbar
              initialQuery={searchText}
              placeholder={t("Search User Groups")}
              queryParamName="searchText"
            />
          </div>
        </div>
      </div>

      <div className="bg-bgwhite dark:bg-darkbgprimary overflow-x-auto">
        <Table<AdminGroup>
          data={data}
          columns={columns}
          keyExtractor={(item) => item.id}
          hideSelectCol
          emptyMessage={t("No groups found")}
          handleSort={handleSort}
          currentSortKey={sortKey}
          currentSortDirection={sortDirection}
        />
        <Pagination
          totalItems={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          title="groups"
          className="!pb-0 border-b-0 !px-0"
        />
      </div>

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
        title={t("Delete Group")}
        message={t("Delete Group confirmation")}
        isLoading={!!deletingId}
      />
    </div>
  );
};

export default UserGroupsTable;
