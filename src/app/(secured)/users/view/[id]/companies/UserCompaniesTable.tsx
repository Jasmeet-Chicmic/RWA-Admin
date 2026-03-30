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
import { AdminCompany } from "@/app/(secured)/companies/helpers/types";
import { deleteCompanyAction } from "@/api/companies";
import { useTableQuerySync } from "@/hooks/useTableQuerySync";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";

interface UserCompaniesTableProps {
  data: AdminCompany[];
  totalCount: number;
  searchText: string;
}

const UserCompaniesTable = ({
  data,
  totalCount,
  searchText,
}: UserCompaniesTableProps) => {
  const router = useRouter();
  const t = useTranslations("companies");

  const { currentPage, pageSize, handlePageChange, handlePageSizeChange } =
    useTableQuerySync({
      defaultPageSize: 10,
      defaultSortKey: "",
    });

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteCompany = useCallback(
    async (id: string) => {
      if (!id) return;
      setDeletingId(id);
      try {
        const res = await deleteCompanyAction({ companyIds: [id] });
        const ok =
          (res as { status?: boolean })?.status === true ||
          (res as { success?: boolean })?.success === true;
        if (ok) {
          toast.success(
            (res as { message?: string })?.message ??
              t("companyDeletedSuccessfully"),
          );
          setDeleteModal({ open: false, id: null });
          router.refresh();
        } else {
          toast.error(
            (res as { message?: string })?.message ??
              t("failedToDeleteCompany"),
          );
          setDeleteModal({ open: false, id: null });
        }
      } catch (error) {
        console.error("Failed to delete company", error);
        toast.error(t("failedToDeleteCompany"));
        setDeleteModal({ open: false, id: null });
      } finally {
        setDeletingId(null);
      }
    },
    [router, t],
  );

  const columns: TableColumn<AdminCompany>[] = [
    {
      title: t("companyName"),
      field: "name",
      render: (item) => (
        <span
          className={`font-medium line-clamp-2 ${TEXT_PRIMARY}`}
          title={item.name}
        >
          {item.name || "—"}
        </span>
      ),
    },
    {
      title: t("companyIndustry"),
      field: "industry",
      render: (item) => (
        <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
          {item.industry || "—"}
        </span>
      ),
    },
    // {
    //   title: t("message"),
    //   field: "message",
    //   render: (item) => (
    //     <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
    //       {item.message || "—"}
    //     </span>
    //   ),
    // },
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

  return (
    <div className="min-w-0 w-full overflow-hidden space-y-4 bg-bgwhite dark:bg-darkbgprimary dark:border-darkbordercolor1 border border-b border-bordergray200ordercolor1 rounded-[20px] p-4 lg:p-5 3xl:p-6">
      <div className="bg-bgwhite dark:bg-darkbgprimary">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2
              className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
            >
              {t("userCompanies")}
            </h2>
            <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
              {t("userCompaniesSubtitle")}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <SearchToolbar
              initialQuery={searchText}
              placeholder={t("searchCompanies")}
              queryParamName="searchText"
            />
          </div>
        </div>
      </div>

      <div className="bg-bgwhite dark:bg-darkbgprimary overflow-x-auto">
        <Table<AdminCompany>
          data={data}
          columns={columns}
          keyExtractor={(item) => item.id}
          hideSelectCol
          emptyMessage={t("noCompaniesFound")}
        />
        <Pagination
          totalItems={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          title="companies"
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
          await handleDeleteCompany(deleteModal.id);
        }}
        title={t("deleteCompany")}
        message={t("deleteCompanyConfirmation")}
        isLoading={!!deletingId}
      />
    </div>
  );
};

export default UserCompaniesTable;
