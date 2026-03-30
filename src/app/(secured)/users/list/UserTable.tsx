"use client";

import { Copy, Eye, Menu, RotateCcw, ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import {
  assignRoleAction,
  getRolesAction,
  toggleAdminBadgeAction,
  toggleUserStatusAction,
  toggleUserMarketingSubscriptionAction,
} from "@/api/user";

import SearchToolbar from "@/components/atoms/SearchToolbar";
import { TableColumn } from "@/components/atoms/Table";
import FilterSidebar from "@/components/molecules/FilterSidebar";
import SelectFilter from "@/components/atoms/SelectFilter";
import DateRangeFilter from "@/components/atoms/DateRangeFilter/DateRangeFilter";
import CustomMenu from "@/components/atoms/Menu/Menu";
import StatusToggleMenu from "@/components/molecules/StatusToggleMenu";

import { ResponseType, Role, SORT_DIRECTIONS, User } from "@/shared/types";
import { createSortableColumn } from "@/shared/utils";
import FormattedDate from "@/components/atoms/FormattedDate";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";

import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
  TEXT_GRAY_WHITE,
} from "@/shared/styles";
import {
  LEVEL_OF_SENIORITY,
  LEVEL_OF_SENIORITY_LABELS,
} from "../helpers/constant";

const UserTable = ({
  data,
  searchString,
}: {
  data: ResponseType & {
    data: {
      items: User[];
      pageNumber: number;
      pageSize: number;
      totalPages: number;
      totalCount: number;
      hasPreviousPage: boolean;
      hasNextPage: boolean;
    };
  };
  searchString: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("users");
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);

  const BOOLEAN_FILTER_OPTIONS = useMemo(
    () => [
      { label: t("yes"), value: "true" },
      { label: t("no"), value: "false" },
    ],
    [t],
  );

  const handleToggleMarketingSubscription = useCallback(
    async (userId: string, subscribe: boolean) => {
      if (!userId) return;
      setIsActionLoading(`marketing-${userId}`);
      try {
        const res = await toggleUserMarketingSubscriptionAction({
          userId,
          subscribe,
        });
        if (res.status) {
          toast.success(
            res.message || t("marketingSubscriptionUpdatedSuccessfully"),
          );
          router.refresh();
        } else {
          toast.error(res.message || t("failedToUpdateMarketingSubscription"));
        }
      } catch (error) {
        console.error("Error updating marketing subscription:", error);
        toast.error(t("anErrorOccurredWhileUpdatingMarketingSubscription"));
      } finally {
        setIsActionLoading(null);
      }
    },
    [router, t],
  );

  const handleToggleStatus = useCallback(
    async (userId: string, newStatus: boolean) => {
      setIsActionLoading(`status-${userId}`);
      try {
        const res = await toggleUserStatusAction({
          userId,
          isActive: newStatus,
        });
        if (res.status) {
          toast.success(res.message || t("userStatusUpdatedSuccessfully"));
          router.refresh();
        } else {
          toast.error(res.message || t("failedToUpdateUserStatus"));
        }
      } catch (error) {
        console.error("Error updating user status:", error);
        toast.error(t("anErrorOccurredWhileUpdatingUserStatus"));
      } finally {
        setIsActionLoading(null);
      }
    },
    [router, t],
  );

  const handleAssignRole = useCallback(
    async (userId: string, roleId: string) => {
      setIsActionLoading(`role-${userId}`);
      try {
        const res = await assignRoleAction({
          userId,
          roleIds: [roleId],
        });
        if (res.status) {
          toast.success(res.message || t("userRoleUpdatedSuccessfully"));
          router.refresh();
        } else {
          toast.error(res.message || t("failedToUpdateUserRole"));
        }
      } catch (error) {
        console.error("Error updating user role:", error);
        toast.error(t("anErrorOccurredWhileUpdatingUserRole"));
      } finally {
        setIsActionLoading(null);
      }
    },
    [router, t],
  );

  const handleToggleAdminBadge = useCallback(
    async (userId: string, assign: boolean, hasBadge: boolean) => {
      if (!userId) return;
      // Avoid unnecessary calls
      if ((assign && hasBadge) || (!assign && !hasBadge)) return;

      setIsActionLoading(`badge-${userId}`);
      try {
        const res = await toggleAdminBadgeAction({
          userId,
          assign,
        });
        if (res.status) {
          toast.success(res.message || t("adminBadgeUpdatedSuccessfully"));
          router.refresh();
        } else {
          toast.error(res.message || t("failedToUpdateAdminBadge"));
        }
      } catch (error) {
        console.error("Error updating admin badge:", error);
        toast.error(t("anErrorOccurredWhileUpdatingAdminBadge"));
      } finally {
        setIsActionLoading(null);
      }
    },
    [router, t],
  );

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch roles on mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getRolesAction();
        if (res.status && res.data) {
          setRoles(res.data);
        } else {
          console.error("Failed to fetch roles:", res);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchRoles();
  }, []);

  const config: DataTableConfig<User> = useMemo(() => {
    const columns: TableColumn<User>[] = [
      createSortableColumn("name", t("name"), (data) => (
        <span className={TEXT_GRAY_WHITE}>
          {data?.fullName ||
            `${data?.firstName ?? ""} ${data?.lastName ?? ""}` ||
            ""}
        </span>
      )),
      createSortableColumn("email", t("email"), (data) => {
        const email = data?.email;
        if (!email) return <span>-</span>;
        const truncatedEmail =
          email.length > 20 ? `${email.slice(0, 20)}...` : email;
        return (
          <div
            className={`flex items-center gap-1.5 !${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}
          >
            <div className="flex items-center gap-1">
              <span title={email}>{truncatedEmail}</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(email);
                toast.success(t("emailCopiedToClipboard"));
              }}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-labelprimary transition-colors"
              title={t("copyEmail")}
            >
              <Copy size={14} className="text-gray-500 dark:bordercolor1" />
            </button>
          </div>
        );
      }),
      {
        field: "role",
        title: t("role"),
        render: (item) => {
          const userRole = item.role;
          const currentRoleName =
            typeof userRole === "object" && userRole !== null
              ? userRole.roleName
              : null;
          const userId = item.userId || item._id || "";
          const isLoading = isActionLoading === `role-${userId}`;

          const roleMenuItems = roles
            .filter((role) => role.isActive)
            .map((role) => ({
              label: (
                <div className="flex items-center gap-2 py-1">
                  <span className="font-medium">{role.name}</span>
                </div>
              ),
              onClick: () => {
                if (!isLoading) {
                  handleAssignRole(userId, role.id);
                }
              },
              disabled: currentRoleName === role.name || isLoading,
            }));

          return (
            <CustomMenu
              menuButton={
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${TEXT_SIZE_SM} font-bold transition-all duration-200 border cursor-pointer bg-primarycolor/10 text-primarycolor border-primarycolor/20 dark:bg-primarycolor/10 dark:text-white/80 dark:border-white/10 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <span>{currentRoleName || t("noRole")}</span>
                  <ChevronDown size={14} className="opacity-60" />
                </div>
              }
              items={roleMenuItems}
            />
          );
        },
        sortable: false,
        sortKey: "role",
      },
      // {
      //   field: "phone",
      //   title: t("phone"),
      //   render: (data) => `${data?.phone || "-"}`,
      //   sortable: false,
      //   sortKey: "phone",
      // },
      {
        field: "",
        title: t("marketingSubscription"),
        render: (item) => {
          const activeCampaign = (
            item as unknown as {
              activeCampaign?: { isSubscribed?: boolean | null };
            }
          ).activeCampaign;

          const isSubscribed = activeCampaign?.isSubscribed ?? false;
          const userId = item.userId || item._id || "";
          const isLoading = isActionLoading === `marketing-${userId}`;

          return (
            <StatusToggleMenu
              isActive={isSubscribed}
              isLoading={isLoading}
              activeLabel={t("subscribe")}
              inactiveLabel={t("unsubscribe")}
              onChange={(next) =>
                handleToggleMarketingSubscription(userId, next)
              }
            />
          );
        },
        sortable: false,
      },
      {
        field: "country",
        title: t("country"),
        render: (data) => `${data?.country || "-"}`,
        sortable: false,
        sortKey: "country",
      },
      {
        field: "isAdminBadgeAssigned",
        title: t("adminBadge"),
        render: (item) => {
          const hasBadge = item.isAdminBadgeAssigned ?? false;
          const userId = item.userId || item._id || "";
          const isLoading = isActionLoading === `badge-${userId}`;

          return (
            <StatusToggleMenu
              isActive={hasBadge}
              isLoading={isLoading}
              activeLabel={t("active")}
              inactiveLabel={t("inactive")}
              onChange={(next) =>
                handleToggleAdminBadge(userId, next, hasBadge)
              }
            />
          );
        },
        sortable: false,
        sortKey: "isAdminBadgeAssigned",
      },
      {
        field: "levelOfSeniority",
        title: t("seniorityLevel"),
        render: (item) => {
          const level = item.levelOfSeniority;

          if (level === undefined || level === null) return <span>-</span>;

          return (
            <span className={TEXT_GRAY_WHITE}>
              {LEVEL_OF_SENIORITY_LABELS[level as LEVEL_OF_SENIORITY]}
            </span>
          );
        },
        sortable: false,
      },
      {
        field: "isActive",
        title: t("accountStatus"),
        render: (item) => {
          const isActive = item.isActive ?? false;
          const userId = item.userId || item._id || "";
          const isLoading = isActionLoading === `status-${userId}`;

          return (
            <StatusToggleMenu
              isActive={isActive}
              isLoading={isLoading}
              activeLabel={t("active")}
              inactiveLabel={t("inactive")}
              onChange={(next) => handleToggleStatus(userId, next)}
            />
          );
        },
        sortable: false,
        sortKey: "isActive",
      },
      // {
      //   field: "isSpotlighted",
      //   title: t("spotlight"),
      //   render: (item) => {
      //     const isSpotlighted = item.isSpotlighted ?? false;
      //     const userId = item.userId || item._id || "";
      //     const isLoading = isActionLoading === `spotlight-${userId}`;

      //     return (
      //       <CustomMenu
      //         menuButton={
      //           <div
      //             className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${TEXT_SIZE_SM} font-bold transition-all duration-200 border cursor-pointer ${
      //               isSpotlighted
      //                 ? "bg-primarycolor/10 text-primarycolor border-primarycolor/20 dark:bg-primarycolor/10 dark:text-white/80 dark:border-secondarycolor/10"
      //                 : "bg-gray-100 text-gray-600 border-gray-300 dark:bg-secondaryhover/50 dark:text-white dark:border-gray-700"
      //             } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      //           >
      //             <div
      //               className={`w-1.5 h-1.5 rounded-full ${
      //                 isSpotlighted
      //                   ? "bg-primarycolor dark:bg-primaryhover"
      //                   : "bg-gray-500 dark:bg-secondaryhover"
      //               }`}
      //             />
      //             {isSpotlighted ? t("yes") : t("no")}
      //             <ChevronDown size={14} className="opacity-60" />
      //           </div>
      //         }
      //         items={[
      //           {
      //             label: (
      //               <div className="flex items-center gap-2 py-1">
      //                 <div className="w-2 h-2 rounded-full bg-primarycolor dark:bg-white/80" />
      //                 <span className="font-medium">{t("yes")}</span>
      //               </div>
      //             ),
      //             onClick: () => void handleToggleSpotlight(userId, true),
      //             disabled: isSpotlighted || isLoading,
      //           },
      //           {
      //             label: (
      //               <div className="flex items-center gap-2 py-1">
      //                 <div className="w-2 h-2 rounded-full bg-gray-500" />
      //                 <span className="font-medium">{t("no")}</span>
      //               </div>
      //             ),
      //             onClick: () => void handleToggleSpotlight(userId, false),
      //             disabled: !isSpotlighted || isLoading,
      //           },
      //         ]}
      //       />
      //     );
      //   },
      //   sortable: false,
      //   sortKey: "isSpotlighted",
      // },
      createSortableColumn("reportCount", t("reportCount"), (data) => (
        <span className={TEXT_SIZE_SM}>{data?.reportCount ?? 0}</span>
      )),
      createSortableColumn("connectionCount", t("connectionCount"), (data) => (
        <span className={TEXT_SIZE_SM}>{data?.connectionCount ?? 0}</span>
      )),
      createSortableColumn("pointsEarned", t("pointsEarned"), (data) => (
        <span className={TEXT_SIZE_SM}>{data?.pointsEarned ?? 0}</span>
      )),
      createSortableColumn("createdOn", t("createdOn"), (item) => {
        const dateValue = item.createdOn;
        return (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {dateValue ? <FormattedDate date={dateValue} /> : "-"}
          </span>
        );
      }),
      {
        field: "",
        title: t("lastLoginSession"),
        render: (item) => {
          const lastSession = (
            item as unknown as {
              lastSession?: { createdAt?: string; isActive?: boolean };
            }
          ).lastSession;
          const createdAt = lastSession?.createdAt;
          const isActive = lastSession?.isActive ?? false;

          if (!createdAt) {
            return <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>-</span>;
          }

          return (
            <div className="flex flex-col gap-1.5">
              <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
                <FormattedDate date={createdAt} />
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold w-fit ${
                  isActive
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    isActive ? "bg-green-500" : "bg-gray-500"
                  }`}
                />
                {isActive ? t("active") : t("inactive")}
              </span>
            </div>
          );
        },
        sortable: false,
      },
      {
        field: "",
        title: t("actions"),
        render: (data) => (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                const userId = data?.userId || data?._id;
                if (userId) {
                  router.push(`/users/view/${userId}/account`, {
                    scroll: false,
                  });
                }
              }}
              className="text-gray-500 hover:text-primarycolor dark:hover:text-secondarycolor transition-colors dark:text-sidebartext"
              title={t("viewUser")}
            >
              <Eye size={18} />
            </button>
          </div>
        ),
        fixed: "right",
      },
    ];

    return {
      columns,
      keyExtractor: (item) => item.userId || item._id || "",
      paginationTitle: "users",
      rowClassName: (item) =>
        item.isSuspicious ? "border border-red-500" : "",
      queryConfig: {
        defaultSortKey: "createdOn",
        defaultSortDirection: SORT_DIRECTIONS.DESC,
      },
      header: (
        <>
          <div className="bg-bgwhite dark:bg-darkbgprimary">
            <div className="dark:border-darkbgprimary">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2
                    className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
                  >
                    {t("users")}
                  </h2>
                </div>
                <div className="flex items-initial space-x-4">
                  <SearchToolbar
                    initialQuery={searchString}
                    placeholder={t("searchUser")}
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
          </div>

          <FilterSidebar
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            title={t("userFilters")}
            footer={
              <button
                onClick={() => {
                  router.push(pathname);
                  setIsFilterOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 dark:bg-darkbgprimary text-labelprimary dark:text-darklabelprimary rounded-xl hover:bg-gray-200 dark:hover:bg-primarycolor transition-all border bordergray200 dark:border-white/50 font-medium"
              >
                <RotateCcw size={18} />
                <span>{t("clearAllFilters")}</span>
              </button>
            }
          >
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="is-active-filter"
                  className="block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2"
                >
                  {t("accountStatus")}
                </label>
                <SelectFilter
                  id="is-active-filter"
                  paramName="isActive"
                  options={BOOLEAN_FILTER_OPTIONS}
                  placeholder={t("selectActiveStatus")}
                />
              </div>

              <div>
                <label
                  htmlFor="is-spotlighted-filter"
                  className="block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2"
                >
                  {t("spotlightStatus")}
                </label>
                <SelectFilter
                  id="is-spotlighted-filter"
                  paramName="isSpotlighted"
                  options={BOOLEAN_FILTER_OPTIONS}
                  placeholder={t("selectSpotlightedStatus")}
                />
              </div>

              <div>
                <label
                  htmlFor="date-range-filter"
                  className="block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2"
                >
                  {t("createdDateRange")}
                </label>
                <DateRangeFilter
                  id="date-range-filter"
                  initialFromDate={searchParams.get("createdFrom") || ""}
                  initialToDate={searchParams.get("createdTo") || ""}
                  useUrlParams={false}
                  onApply={(fromDate, toDate) => {
                    const newParams = new URLSearchParams(
                      searchParams.toString(),
                    );
                    newParams.delete("skip");
                    if (fromDate) {
                      newParams.set("createdFrom", fromDate);
                    } else {
                      newParams.delete("createdFrom");
                    }
                    if (toDate) {
                      newParams.set("createdTo", toDate);
                    } else {
                      newParams.delete("createdTo");
                    }
                    router.push(`?${newParams.toString()}`);
                    setIsFilterOpen(false);
                  }}
                  onClear={() => {
                    const newParams = new URLSearchParams(
                      searchParams.toString(),
                    );
                    newParams.delete("createdFrom");
                    newParams.delete("createdTo");
                    newParams.delete("skip");
                    router.push(`?${newParams.toString()}`);
                    setIsFilterOpen(false);
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="min-report-count-filter"
                  className="block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2"
                >
                  {t("minimumReportCount")}
                </label>
                <input
                  id="min-report-count-filter"
                  type="number"
                  min="0"
                  placeholder={t("enterMinimumReportCount")}
                  className="w-full px-4 py-2.5 border border-darklabelprimary dark:border-labelprimary rounded-[8px] text-sm focus:outline-none focus:ring-2 focus:ring-primarycolor dark:bg-darkbgprimary dark:text-darklabelprimary transition-all"
                  onChange={(e) => {
                    const val = e.target.value;
                    const newParams = new URLSearchParams(
                      searchParams.toString(),
                    );
                    if (val && Number(val) >= 0) {
                      newParams.set("minReportCount", val);
                    } else {
                      newParams.delete("minReportCount");
                    }
                    router.push(`?${newParams.toString()}`);
                  }}
                  value={searchParams.get("minReportCount") || ""}
                />
              </div>
            </div>
          </FilterSidebar>
        </>
      ),
    };
  }, [
    searchString,
    isFilterOpen,
    searchParams,
    router,
    pathname,
    isActionLoading,
    handleToggleStatus,
    handleAssignRole,
    handleToggleAdminBadge,
    handleToggleMarketingSubscription,
    roles,
    t,
    BOOLEAN_FILTER_OPTIONS,
  ]);

  return (
    <DataTable
      data={data?.data?.items || []}
      totalCount={data?.data?.totalCount ?? 0}
      config={config}
    />
  );
};

export default UserTable;
