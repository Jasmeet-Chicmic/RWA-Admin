"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";

import { toggleUserStatusAction } from "@/api/user";
import SearchToolbar from "@/components/atoms/SearchToolbar";
import { TableColumn } from "@/components/atoms/Table";
import CustomMenu from "@/components/atoms/Menu/Menu";
import CustomModal from "@/components/molecules/CustomModal";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import type { ReportEntry, ReportedUserItem } from "./helpers/types";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
  TEXT_GRAY_WHITE,
} from "@/shared/styles";
import ImageWithFallback from "@/components/atoms/Image/ImageWithFallback";
import { dummyProfile } from "@/assets";
import { buildImageUrl } from "@/shared/utils";

type ReportedUsersResponse = {
  status?: boolean;
  data?: {
    items: ReportedUserItem[];
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};

const ReportedUsersTable = ({
  data,
  searchString,
}: {
  data: ReportedUsersResponse;
  searchString: string;
}) => {
  const router = useRouter();
  const t = useTranslations("users");
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [reporterModalOpen, setReporterModalOpen] = useState(false);
  const [selectedReporters, setSelectedReporters] = useState<ReportEntry[]>([]);

  const handleToggleStatus = useCallback(
    async (userId: string, newStatus: boolean) => {
      setIsActionLoading(`status-${userId}`);
      try {
        const res = await toggleUserStatusAction({
          userId,
          isActive: newStatus,
        });
        if (res.status) {
          toast.success(res.message || t("User status updated successfully"));
          router.refresh();
        } else {
          toast.error(res.message || t("Failed to update user status"));
        }
      } catch (error) {
        console.error("Error updating user status:", error);
        toast.error(t("An error occurred while updating user status"));
      } finally {
        setIsActionLoading(null);
      }
    },
    [router, t],
  );

  const config: DataTableConfig<ReportedUserItem> = useMemo(() => {
    const columns: TableColumn<ReportedUserItem>[] = [
      {
        field: "reportedProfile",
        title: t("Reported User"),
        render: (item) => {
          const p = item.reportedProfile;
          const name =
            [p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ") ||
            "—";
          return (
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                {p.userProfilePicture ? (
                  <ImageWithFallback
                    src={buildImageUrl(p.userProfilePicture)}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="36px"
                    fallbackSrc={dummyProfile.src}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-medium">
                    {p.firstName?.[0] || "?"}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className={`font-medium truncate ${TEXT_GRAY_WHITE}`}>
                  {name}
                </p>
                <p
                  className={`${TEXT_SIZE_SM} text-textparagraph dark:text-textparagraphlight truncate`}
                  title={p.email}
                >
                  {p.email || "—"}
                </p>
              </div>
            </div>
          );
        },
        sortable: false,
      },
      {
        field: "reportedProfile",
        title: t("Phone"),
        render: (item) => (
          <span className={TEXT_SIZE_SM}>
            {item.reportedProfile?.phone || "—"}
          </span>
        ),
        sortable: false,
      },
      {
        field: "reportedCount",
        title: t("Report Count"),
        render: (item) => (
          <span className={TEXT_SIZE_SM}>{item.reportedCount ?? "0"}</span>
        ),
        sortable: false,
      },
      {
        field: "reportedByUsers",
        title: t("Reported By"),
        render: (item) => {
          const by = item.reportedByUsers ?? [];
          const count = by.length;
          if (count === 0) return "—";
          const first = by[0]?.reportedByUser;
          const firstName = first
            ? [first.firstName, first.lastName].filter(Boolean).join(" ") ||
              first.email
            : "";

          // If only one reporter, show their name directly
          if (count === 1) {
            return (
              <span className={TEXT_SIZE_SM} title={firstName}>
                {firstName || "—"}
              </span>
            );
          }

          // Multiple reporters → show pill that opens modal with full list
          return (
            <button
              type="button"
              onClick={() => {
                setSelectedReporters(by);
                setReporterModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-bordercolor1 dark:border-darkbordercolor1 bg-bglight dark:bg-darkbgbase px-3 py-1 text-[11px] font-medium text-textprimary dark:text-textparagraphlight hover:bg-primarycolor/5 hover:border-primarycolor/40 dark:hover:bg-secondarycolor/10 transition-colors"
            >
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primarycolor dark:bg-white/80" />
                <span>{t("Reported by count", { count })}</span>
              </span>
              <span className="text-[10px] text-textparagraph dark:text-textparagraphlight underline underline-offset-2">
                {t("View all")}
              </span>
            </button>
          );
        },
        sortable: false,
      },
      {
        field: "reportedProfile",
        title: t("Account Status"),
        render: (item) => {
          const profileId = item.reportedProfile?.id;
          if (!profileId) return "—";
          const isLoading = isActionLoading === `status-${profileId}`;
          const isActive = item.reportedProfile?.isActive ?? true;

          return (
            <CustomMenu
              menuButton={
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${TEXT_SIZE_SM} font-bold transition-all duration-200 border cursor-pointer ${
                    isActive
                      ? "bg-primarycolor/10 text-primarycolor border-primarycolor/20 dark:bg-primarycolor/10 dark:text-white/80 dark:border-secondarycolor/10"
                      : "bg-red-50 text-red-600 border-red-500 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive
                        ? "bg-primarycolor dark:bg-white/80"
                        : "bg-red-500"
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
                  onClick: () => void handleToggleStatus(profileId, true),
                  disabled: isActive || isLoading,
                },
                {
                  label: (
                    <div className="flex items-center gap-2 py-1">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="font-medium">{t("Inactive")}</span>
                    </div>
                  ),
                  onClick: () => void handleToggleStatus(profileId, false),
                  disabled: !isActive || isLoading,
                },
              ]}
            />
          );
        },
        sortable: false,
      },
    ];

    return {
      columns,
      keyExtractor: (item) => item.reportedProfile?.id ?? "",
      paginationTitle: "reported users",
      hideSelectCol: true,
      emptyMessage: t("No reported users found"),
      header: (
        <div className="bg-bgwhite dark:bg-darkbgprimary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2
                className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
              >
                {t("Reported Users")}
              </h2>
              <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                {t("Reported Users subtitle")}
              </p>
            </div>
            <SearchToolbar
              initialQuery={searchString}
              placeholder={t("Search User")}
            />
          </div>
        </div>
      ),
    };
  }, [isActionLoading, handleToggleStatus, searchString, t]);

  return (
    <>
      <DataTable<ReportedUserItem>
        data={data?.data?.items ?? []}
        totalCount={data?.data?.totalCount ?? 0}
        config={config}
      />

      <CustomModal
        isOpen={reporterModalOpen}
        onClose={() => setReporterModalOpen(false)}
        title={t("Reported Users")}
        size="md"
      >
        {selectedReporters.length === 0 ? (
          <p className={TEXT_SIZE_SM}>{t("No reporters found")}</p>
        ) : (
          <div
            className={`space-y-3 ${
              selectedReporters.length > 5
                ? "max-h-72 overflow-y-auto pr-1 custom-scrollbar"
                : ""
            }`}
          >
            {selectedReporters.map((entry) => {
              const u = entry.reportedByUser;
              const name =
                [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email;
              return (
                <div
                  key={entry.reportId}
                  className="flex flex-col rounded-[12px] border border-bordercolor1 dark:border-darkbordercolor1 bg-bglight dark:bg-darkbgbase/40 px-3 py-2 text-xs"
                >
                  <span className="font-semibold text-textprimary dark:text-sidebartext">
                    {name}
                  </span>
                  <span className="text-textparagraph dark:text-textparagraphlight">
                    {u.email || "—"}
                  </span>
                  {entry.description && (
                    <span className="mt-1 text-[11px] text-textparagraph dark:text-textparagraphlight">
                      {entry.description}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CustomModal>
    </>
  );
};

export default ReportedUsersTable;
