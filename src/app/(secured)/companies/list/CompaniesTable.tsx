"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Eye, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { PRIVATE_ROUTES } from "@/shared/routes";

import SearchToolbar from "@/components/atoms/SearchToolbar";
import EventParticipantItem from "@/components/molecules/event/EventParticipantItem";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { TableColumn } from "@/components/atoms/Table";
import {
  AdminCompany,
  SimpleResponse,
} from "@/app/(secured)/companies/helpers/types";
import {
  deleteCompanyAction,
  updateCompanyAccessAction,
} from "@/api/companies";
import ConfirmationModal from "@/components/molecules/ConfirmationModal/ConfirmationModal";
import CustomMenu from "@/components/atoms/Menu/Menu";
import { createSortableColumn } from "@/shared/utils";
import FormattedDate from "@/components/atoms/FormattedDate";
import { SORT_DIRECTIONS } from "@/shared/types";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";

interface CompaniesTableProps {
  data: AdminCompany[];
  totalCount: number;
  searchText: string;
}

const CompaniesTable = ({
  data,
  totalCount,
  searchText,
}: CompaniesTableProps) => {
  const router = useRouter();
  const t = useTranslations("companies");

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
              t("Company deleted successfully"),
          );
          setDeleteModal({ open: false, id: null });
          router.refresh();
        } else {
          toast.error(
            (res as { message?: string })?.message ??
              t("Failed to delete company"),
          );
          setDeleteModal({ open: false, id: null });
        }
      } catch (error) {
        console.error("Failed to delete company", error);
        toast.error(t("Failed to delete company"));
        setDeleteModal({ open: false, id: null });
      } finally {
        setDeletingId(null);
      }
    },
    [router, t],
  );

  const handleToggleStatus = useCallback(
    async (id: string, isActive: boolean) => {
      if (!id) return;
      setActionLoading(`status-${id}`);
      try {
        const res = (await updateCompanyAccessAction({
          companyId: id,
          isActive,
        })) as SimpleResponse;
        if (res.status) {
          toast.success(t("Company access updated successfully"));
          router.refresh();
        } else {
          toast.error(t("Failed to update company access"));
        }
      } catch (error) {
        console.error("Failed to update company access", error);
        toast.error(t("Failed to update company access"));
      } finally {
        setActionLoading(null);
      }
    },
    [router, t],
  );

  const config: DataTableConfig<AdminCompany> = useMemo(() => {
    const columns: TableColumn<AdminCompany>[] = [
      createSortableColumn(
        "name",
        t("Company Name"),
        (item) => (
          <span
            className={`font-medium line-clamp-2 ${TEXT_PRIMARY}`}
            title={item.name}
          >
            {item.name || "—"}
          </span>
        ),
        "Name",
      ),
      createSortableColumn(
        "industry",
        t("Company Industry"),
        (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.industry || "—"}
          </span>
        ),
        "Industry",
      ),
      {
        title: t("Created By"),
        field: "creatorName",
        render: (item) => (
          <EventParticipantItem
            userId={item.userId}
            name={item.creatorName}
            email={item.creatorEmail}
            userProfilePicture={item.creatorProfilePicture}
            avatarSize="w-8 h-8"
            showEmail={true}
          />
        ),
      },
      {
        title: t("Company Status"),
        field: "isActive",
        render: (item) => (
          <div className="flex items-center">
            {(() => {
              const isActive = item.isActive;
              const isLoading = actionLoading === `status-${item.id}`;

              return (
                <CustomMenu
                  menuButton={
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${TEXT_SIZE_SM} font-bold transition-all duration-200 border cursor-pointer ${
                        isActive
                          ? "bg-primarycolor/10 text-primarycolor border-primarycolor/20 dark:bg-primarycolor/10 dark:text-white/80 dark:border-secondarycolor/10"
                          : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive
                            ? "bg-primarycolor dark:bg-white/80"
                            : "bg-red-600"
                        }`}
                      />
                      {isActive ? t("Active") : t("Inactive")}
                      <ChevronDown size={14} className="opacity-60" />
                    </div>
                  }
                  items={[
                    {
                      label: (
                        <div className="flex items-center gap-2 py-1">
                          <div className="w-2 h-2 rounded-full bg-primarycolor dark:bg-white/80" />
                          <span className="font-medium">{t("Active")}</span>
                        </div>
                      ),
                      onClick: () => void handleToggleStatus(item.id, true),
                      disabled: isActive || isLoading,
                    },
                    {
                      label: (
                        <div className="flex items-center gap-2 py-1">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="font-medium">{t("Inactive")}</span>
                        </div>
                      ),
                      onClick: () => void handleToggleStatus(item.id, false),
                      disabled: !isActive || isLoading,
                    },
                  ]}
                />
              );
            })()}
          </div>
        ),
      },
      // {
      //   title: t("Message"),
      //   field: "message",
      //   render: (item) => (
      //     <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
      //       {item.message || "—"}
      //     </span>
      //   ),
      // },
      {
        title: t("Date Created"),
        field: "createdOn",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            <FormattedDate date={item.createdOn} />
          </span>
        ),
      },
      {
        title: t("Job Listings"),
        field: "jobsCount",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.jobsCount || 0}
          </span>
        ),
      },
      {
        title: t("Events Hosted"),
        field: "eventsCount",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.eventsCount || 0}
          </span>
        ),
      },
      {
        title: t("Follower Count"),
        field: "followersCount",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.followersCount || 0}
          </span>
        ),
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
                router.push(`${PRIVATE_ROUTES.COMPANIES_VIEW}/${item.id}`, {
                  scroll: false,
                });
              }}
              className="text-gray-500 hover:text-primarycolor dark:hover:text-secondarycolor transition-colors dark:text-sidebartext"
              title={t("View Company")}
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
              title={t("Delete")}
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
      paginationTitle: "companies",
      hideSelectCol: true,
      emptyMessage: t("No companies found"),
      queryConfig: {
        defaultSortKey: "CreatedOn",
        defaultSortDirection: SORT_DIRECTIONS.DESC,
      },
      header: (
        <div className="bg-bgwhite dark:bg-darkbgprimary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2
                className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
              >
                {t("Companies")}
              </h2>
              <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                {t("Header subtitle")}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <SearchToolbar
                initialQuery={searchText}
                placeholder={t("Search Companies")}
                queryParamName="searchText"
              />
            </div>
          </div>
        </div>
      ),
    };
  }, [actionLoading, deletingId, handleToggleStatus, router, searchText, t]);

  return (
    <>
      <DataTable data={data} totalCount={totalCount} config={config} />
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
        title={t("Delete Company")}
        message={t("Delete Company confirmation")}
        isLoading={!!deletingId}
      />
    </>
  );
};

export default CompaniesTable;
