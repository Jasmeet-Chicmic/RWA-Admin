"use client";

import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { addUserToSpotlightAction } from "@/api/user";
import AsyncSelect, {
  AsyncSelectGetDataParams,
  OptionType,
} from "@/components/atoms/AsyncSelect/AsyncSelect";
import FormattedDate from "@/components/atoms/FormattedDate";
import SearchToolbar from "@/components/atoms/SearchToolbar";
import { TableColumn } from "@/components/atoms/Table";
import ConfirmationModal from "@/components/molecules/ConfirmationModal/ConfirmationModal";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { optionsService } from "@/services/options-service";
import { PRIVATE_ROUTES } from "@/shared/routes";
import {
  TEXT_GRAY_WHITE,
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import { ResponseType, SORT_DIRECTIONS, User } from "@/shared/types";
import { createSortableColumn, truncateText } from "@/shared/utils";

const SPOTLIGHT_MODAL_MODE = {
  ADD: "add",
  EDIT: "edit",
} as const;

type SpotlightModalMode =
  (typeof SPOTLIGHT_MODAL_MODE)[keyof typeof SPOTLIGHT_MODAL_MODE];

type SpotlightFormState = {
  mode: SpotlightModalMode;
  user: OptionType | null;
  description: string;
  isSpotlighted: boolean;
};

type SpotlightedUsersResponse = ResponseType & {
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

const SpotlightedUsersTable = ({
  data,
  searchString,
}: {
  data: SpotlightedUsersResponse;
  searchString: string;
}) => {
  const router = useRouter();
  const t = useTranslations("users");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [removeConfirmUser, setRemoveConfirmUser] = useState<{
    userId: string;
  } | null>(null);
  const [spotlightForm, setSpotlightForm] = useState<SpotlightFormState>({
    mode: SPOTLIGHT_MODAL_MODE.ADD,
    user: null,
    description: "",
    isSpotlighted: true,
  });

  const handleAddSpotlightUser = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!spotlightForm.user?.value) {
        toast.error(t("spotlightUserIdRequired"));
        return;
      }
      const trimmedDescription = spotlightForm.description.trim();
      if (!trimmedDescription) {
        toast.error(t("spotlightDescriptionIsRequired"));
        return;
      }
      setIsSubmitting(true);
      try {
        const res = await addUserToSpotlightAction({
          userId: String(spotlightForm.user.value),
          isSpotlighted: true,
          spotlightDescription: trimmedDescription,
        });
        if (res.status) {
          toast.success(res.message || t("spotlightUserAddedSuccessfully"));
          setIsAddModalOpen(false);
          setSpotlightForm({
            mode: SPOTLIGHT_MODAL_MODE.ADD,
            user: null,
            description: "",
            isSpotlighted: true,
          });
          router.refresh();
        } else {
          toast.error(res.message || t("failedToAddSpotlightUser"));
        }
      } catch (error) {
        console.error("Error adding spotlight user:", error);
        toast.error(t("failedToAddSpotlightUser"));
      } finally {
        setIsSubmitting(false);
      }
    },
    [spotlightForm, router, t],
  );

  const handleRemoveFromSpotlight = useCallback(
    async (userId: string) => {
      if (!userId) return;
      setRemovingUserId(userId);
      try {
        const res = await addUserToSpotlightAction({
          userId,
          isSpotlighted: false,
          spotlightDescription: "",
        });
        if (res.status) {
          toast.success(
            res.message || t("userRemovedFromSpotlightSuccessfully"),
          );
          router.refresh();
        } else {
          toast.error(res.message || t("failedToRemoveUserFromSpotlight"));
        }
      } catch (error) {
        console.error("Error removing user from spotlight:", error);
        toast.error(t("failedToRemoveUserFromSpotlight"));
      } finally {
        setRemovingUserId(null);
      }
    },
    [router, t],
  );

  const getUserOptions = useCallback(
    async ({
      searchString,
      page,
      limit,
    }: AsyncSelectGetDataParams): Promise<{
      data: OptionType[];
      count: number;
    }> => {
      const skip = (page - 1) * limit;
      const json = await optionsService.getUserOptions({
        skip,
        limit,
        isSpotlighted: false,
        isActive: true,
        ...(searchString ? { searchString } : {}),
      });
      const options: OptionType[] = json.data;

      return {
        data: options,
        count: json.count,
      };
    },
    [],
  );

  const config: DataTableConfig<User> = useMemo(() => {
    const columns: TableColumn<User>[] = [
      createSortableColumn("name", t("name"), (item) => (
        <span className={TEXT_GRAY_WHITE}>
          {item.fullName ||
            [item.firstName, item.lastName].filter(Boolean).join(" ")}
        </span>
      )),
      createSortableColumn("email", t("email"), (item) => (
        <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
          {item.email || "-"}
        </span>
      )),
      createSortableColumn("location", t("country"), (item) => (
        <span className={TEXT_SIZE_SM}>{item.country || "-"}</span>
      )),
      createSortableColumn("connectionCount", t("connectionCount"), (item) => (
        <span className={TEXT_SIZE_SM}>{item.connectionCount ?? 0}</span>
      )),
      {
        field: "",
        title: t("spotlight"),
        render: (item) => {
          const desc = (
            item as unknown as { spotlightDescription?: string | null }
          ).spotlightDescription;
          return (
            <span className={TEXT_SIZE_SM} title={desc ?? undefined}>
              {truncateText(desc, 50, "-")}
            </span>
          );
        },
      },
      // Spotlight status column removed; status is now edited via the Actions column
      createSortableColumn("createdOn", t("createdOn"), (item) => (
        <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
          <FormattedDate date={item.createdOn} />
        </span>
      )),
      {
        field: "",
        title: t("actions"),
        render: (item) => {
          const userId = item.userId || item._id;
          return (
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => {
                  if (!userId) return;
                  const nameOnly =
                    item.fullName ||
                    [item.firstName, item.lastName].filter(Boolean).join(" ");
                  setSpotlightForm({
                    mode: SPOTLIGHT_MODAL_MODE.EDIT,
                    user: { value: userId, label: nameOnly },
                    description:
                      (
                        item as unknown as {
                          spotlightDescription?: string | null;
                        }
                      ).spotlightDescription || "",
                    isSpotlighted: true,
                  });
                  setIsAddModalOpen(true);
                }}
                className="text-gray-500 hover:text-primarycolor dark:hover:text-secondarycolor transition-colors dark:text-sidebartext"
                title={t("edit")}
              >
                <Pencil size={18} />
              </button>
              <button
                type="button"
                onClick={() => userId && setRemoveConfirmUser({ userId })}
                disabled={removingUserId === userId}
                className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors dark:text-sidebartext disabled:opacity-50"
                title={t("delete")}
              >
                <Trash2 size={18} />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (userId) {
                    router.push(
                      `${PRIVATE_ROUTES.USERS_VIEW}/${userId}/account`,
                      {
                        scroll: false,
                      },
                    );
                  }
                }}
                className="text-gray-500 hover:text-primarycolor dark:hover:text-secondarycolor transition-colors dark:text-sidebartext"
                title={t("viewUser")}
              >
                <Eye size={18} />
              </button>
            </div>
          );
        },
        fixed: "right",
      },
    ];

    return {
      columns,
      keyExtractor: (item) => item.userId || item._id || "",
      paginationTitle: "spotlighted users",
      hideSelectCol: true,
      emptyMessage: t("noSpotlightedUsersFound"),
      queryConfig: {
        defaultSortKey: "createdOn",
        defaultSortDirection: SORT_DIRECTIONS.DESC,
      },
      header: (
        <div className="">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2 className={`text-[1.5rem] font-bold ${TEXT_PRIMARY}`}>
                {t("spotlightedUsers")}
              </h2>
              <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                {t("spotlightedUsersSubtitle")}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-initial gap-3 space-x-0">
              <SearchToolbar
                initialQuery={searchString}
                placeholder={t("searchUser")}
                queryParamName="searchString"
              />
              <button
                type="button"
                onClick={() => {
                  setSpotlightForm({
                    mode: SPOTLIGHT_MODAL_MODE.ADD,
                    user: null,
                    description: "",
                    isSpotlighted: true,
                  });
                  setIsAddModalOpen(true);
                }}
                className="flex-none min-h-[46px] justify-center inline-flex items-center gap-2 px-4 py-2 rounded-[8px] bg-primarycolor text-white text-xs font-semibold shadow-sm hover:bg-primarycolor/90 dark:bg-secondarycolor dark:hover:bg-secondarycolor/90 transition-colors"
              >
                <Plus size={14} />
                <span>{t("addSpotlightedUser")}</span>
              </button>
            </div>
          </div>
        </div>
      ),
    };
  }, [router, searchString, t, removingUserId]);

  return (
    <>
      <DataTable<User>
        data={data.data.items}
        totalCount={data.data.totalCount}
        config={config}
      />

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-textprimary dark:text-sidebartext mb-4">
              {spotlightForm.mode === "add"
                ? t("addSpotlightedUser")
                : t("editSpotlightedUser")}
            </h3>
            <form className="space-y-4" onSubmit={handleAddSpotlightUser}>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-textparagraph dark:text-textparagraphlight">
                  {t("selectUser")}
                </label>
                {spotlightForm.mode === SPOTLIGHT_MODAL_MODE.ADD ? (
                  <AsyncSelect
                    getData={getUserOptions}
                    placeholder={t("selectUserToSpotlight")}
                    value={spotlightForm.user}
                    onChange={(option) =>
                      setSpotlightForm((prev) => ({
                        ...prev,
                        user: (option as OptionType | null) ?? null,
                      }))
                    }
                    inputId="spotlight-user-select"
                  />
                ) : (
                  <div className="w-full rounded-lg border border-bordercolor1 dark:border-darkbordercolor1 bg-gray-50 dark:bg-darkbgsecondary px-3 py-2 text-sm text-textprimary dark:text-sidebartext">
                    {spotlightForm.user?.label}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-textparagraph dark:text-textparagraphlight">
                  {t("spotlightDescription")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={spotlightForm.description}
                  onChange={(e) =>
                    setSpotlightForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full rounded-lg border border-bordercolor1 dark:border-darkbordercolor1 bg-bgwhite dark:bg-darkbgsecondary px-3 py-2 text-sm text-textprimary dark:text-sidebartext focus:outline-none focus:ring-2 focus:ring-primarycolor/60 resize-none"
                  placeholder={t("enterSpotlightDescription")}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isSubmitting) return;
                    setIsAddModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-full border border-bordercolor1 dark:border-darkbordercolor1 text-xs font-semibold text-textparagraph dark:text-textparagraphlight hover:bg-gray-50 dark:hover:bg-darkbgsecondary transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-full bg-primarycolor text-white text-xs font-semibold hover:bg-primarycolor/90 disabled:opacity-60 disabled:cursor-not-allowed dark:bg-secondarycolor dark:hover:bg-secondarycolor/90 transition-colors"
                >
                  {isSubmitting
                    ? t("savingSpotlightedUser")
                    : t("saveSpotlightedUser")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!removeConfirmUser}
        onClose={() => {
          if (!removingUserId) setRemoveConfirmUser(null);
        }}
        onConfirm={async () => {
          if (!removeConfirmUser) return;
          await handleRemoveFromSpotlight(removeConfirmUser.userId);
          setRemoveConfirmUser(null);
        }}
        title={t("removeFromSpotlight")}
        message={t("removeFromSpotlightConfirmation")}
        isLoading={!!removingUserId}
      />
    </>
  );
};

export default SpotlightedUsersTable;
