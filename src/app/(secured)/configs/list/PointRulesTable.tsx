"use client";

import { useCallback, useMemo, useState } from "react";
import { ChevronDown, Eye, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import type { PointRule } from "@/api/config";
import { updatePointRuleAction } from "@/api/config";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { TableColumn } from "@/components/atoms/Table";
import CustomModal from "@/components/molecules/CustomModal";
import FormBuilder from "@/components/molecules/FormBuilder";
import { FORM_FIELDS_TYPES } from "@/shared/constants";
import { truncateWords } from "@/shared/utils";
import CustomMenu from "@/components/atoms/Menu/Menu";
import { TEXT_SIZE_SM } from "@/shared/styles";

interface PointRulesTableProps {
  pointRules: PointRule[];
}

type PointRuleFormValues = {
  points: number;
  description: string;
  isActive: boolean;
};

const PointRulesTable = ({ pointRules }: PointRulesTableProps) => {
  const router = useRouter();
  const t = useTranslations("pointRules");
  const tCommon = useTranslations("common");

  const [viewRule, setViewRule] = useState<PointRule | null>(null);
  const [editRule, setEditRule] = useState<PointRule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null);

  const handleUpdate = useCallback(
    async (values: PointRuleFormValues) => {
      if (!editRule) return;
      setIsSubmitting(true);
      try {
        const payload = {
          pointRuleId: editRule.id,
          points: Number(values.points),
          description: values.description.trim(),
          isActive: values.isActive ?? editRule.isActive,
        };

        const res = await updatePointRuleAction(payload);
        if (res?.status) {
          toast.success(res.message || t("pointRuleUpdatedSuccessfully"));
          setEditRule(null);
          router.refresh();
        } else {
          toast.error(res?.message || t("failedToUpdatePointRule"));
        }
      } catch (error) {
        console.error("Error updating point rule:", error);
        toast.error(t("anErrorOccurredWhileUpdatingPointRule"));
      } finally {
        setIsSubmitting(false);
      }
    },
    [editRule, router, t],
  );

  const handleToggleStatus = useCallback(
    async (rule: PointRule, isActive: boolean) => {
      setStatusLoadingId(rule.id);
      try {
        const res = await updatePointRuleAction({
          pointRuleId: rule.id,
          points: rule.points,
          description: rule.description,
          isActive,
        });

        if (res?.status) {
          toast.success(res.message || t("pointRuleStatusUpdatedSuccessfully"));
          router.refresh();
        } else {
          toast.error(res?.message || t("failedToUpdatePointRuleStatus"));
        }
      } catch (error) {
        console.error("Error updating point rule status:", error);
        toast.error(t("anErrorOccurredWhileUpdatingPointRuleStatus"));
      } finally {
        setStatusLoadingId(null);
      }
    },
    [router, t],
  );

  const columns: TableColumn<PointRule>[] = useMemo(
    () => [
      {
        field: "displayName",
        title: t("ruleName"),
        sortable: false,
        render: (rule) => (
          <span className="text-sm font-medium text-textprimary dark:text-bgwhite">
            {rule.displayName}
          </span>
        ),
      },
      {
        field: "points",
        title: t("points"),
        sortable: false,
        render: (rule) => (
          <span className="text-sm text-textprimary dark:text-bgwhite">
            {rule.points}
          </span>
        ),
      },
      {
        field: "description",
        title: t("description"),
        sortable: false,
        render: (rule) => (
          <span className="text-sm text-textparagraph dark:text-textparagraphlight">
            {truncateWords(rule.description, 5)}
          </span>
        ),
      },
      {
        field: "isActive",
        title: t("status"),
        sortable: false,
        render: (rule) => {
          const isActive = rule.isActive;
          const isLoading = statusLoadingId === rule.id;

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
                  {isActive ? t("active") : t("inactive")}
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
                  onClick: () => {
                    if (!isLoading) {
                      void handleToggleStatus(rule, true);
                    }
                  },
                  disabled: isActive || isLoading,
                },
                {
                  label: (
                    <div className="flex items-center gap-2 py-1">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="font-medium">{t("inactive")}</span>
                    </div>
                  ),
                  onClick: () => {
                    if (!isLoading) {
                      void handleToggleStatus(rule, false);
                    }
                  },
                  disabled: !isActive || isLoading,
                },
              ]}
            />
          );
        },
      },
      // {
      //   field: "createdOn",
      //   title: t("createdOn"),
      //   sortable: false,
      //   render: (rule) => (
      //     <span className="text-sm text-textprimary dark:text-bgwhite">
      //       {rule.createdOn ? formatDate(rule.createdOn) : "-"}
      //     </span>
      //   ),
      // },
      // {
      //   field: "modifiedOn",
      //   title: t("modifiedOn"),
      //   sortable: false,
      //   render: (rule) => (
      //     <span className="text-sm text-textprimary dark:text-bgwhite">
      //       {rule.modifiedOn ? formatDate(rule.modifiedOn) : "-"}
      //     </span>
      //   ),
      // },
      {
        field: "",
        title: t("actions"),
        sortable: false,
        fixed: "right",
        render: (rule) => (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setViewRule(rule)}
              className="text-gray-500 hover:text-primarycolor dark:hover:text-secondarycolor transition-colors"
              title={tCommon("View")}
            >
              <Eye size={16} />
            </button>
            <button
              type="button"
              onClick={() => setEditRule(rule)}
              className="text-gray-500 hover:text-primarycolor dark:hover:text-secondarycolor transition-colors"
              title={tCommon("Edit")}
            >
              <Pencil size={16} />
            </button>
          </div>
        ),
      },
    ],
    [statusLoadingId, handleToggleStatus, t, tCommon],
  );

  const config: DataTableConfig<PointRule> = useMemo(
    () => ({
      columns,
      keyExtractor: (item) => item.id,
      paginationTitle: "point rules",
      emptyMessage: t("noData") ?? t("noPointRulesFound"),
      header: (
        <div className="bg-bgwhite dark:bg-darkbgprimary">
          <div className="dark:border-darkbgprimary">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-[1.25rem] lg:text-[1.5rem] font-bold text-textprimary dark:text-bgwhite">
                  {t("pointRules")}
                </h2>
                <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                  {t("manageHowUsersEarnPointsAcrossThePlatform")}
                </p>
              </div>
              <div>{/* Add Point Rule button temporarily disabled */}</div>
            </div>
          </div>
        </div>
      ),
      hideSelectCol: false,
    }),
    [columns, t],
  );

  const editDefaultValues = useMemo<PointRuleFormValues | undefined>(
    () =>
      editRule
        ? {
            points: editRule.points,
            description: editRule.description,
            isActive: editRule.isActive,
          }
        : undefined,
    [editRule],
  );

  const editFormConfig = useMemo(
    () => [
      {
        type: FORM_FIELDS_TYPES.NUMBER,
        name: "points" as const,
        label: "Points",
        placeholder: "Enter points",
        validation: {
          required: "Points are required",
        },
      },
      {
        type: FORM_FIELDS_TYPES.TEXTAREA,
        name: "description" as const,
        label: "Description",
        placeholder: "Enter description for this rule",
      },
      {
        type: FORM_FIELDS_TYPES.SWITCH,
        name: "isActive" as const,
        label: "Active",
      },
    ],
    [],
  );

  return (
    <>
      <DataTable<PointRule>
        data={pointRules}
        totalCount={pointRules.length}
        config={config}
      />

      {/* View Modal */}
      {viewRule && (
        <CustomModal
          isOpen={!!viewRule}
          onClose={() => setViewRule(null)}
          title={t("pointRuleDetails")}
          size="md"
        >
          <div className="space-y-6 text-sm">
            <div className="rounded-xl border border-bordercolor1 bg-bgsecondary/40 px-4 py-3 dark:border-bordercolor2 dark:bg-darkbgsecondary/40">
              <p className="text-[13px] font-medium uppercase tracking-wide text-labelprimary/80 dark:text-darklabelprimary/80">
                {t("basicInfo")}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] font-medium uppercase tracking-wide text-labelprimary/80 dark:text-darklabelprimary/80">
                    {t("ruleName")}
                  </span>
                  <span className="text-[14px] font-semibold text-textprimary dark:text-bgwhite">
                    {viewRule.displayName}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] font-medium uppercase tracking-wide text-labelprimary/80 dark:text-darklabelprimary/80">
                    {t("ruleKey")}
                  </span>
                  <span className="text-[14px] font-semibold text-textprimary dark:text-bgwhite">
                    {viewRule.ruleKey}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] font-medium uppercase tracking-wide text-labelprimary/80 dark:text-darklabelprimary/80">
                    {t("points")}
                  </span>
                  <span className="text-[14px] font-semibold text-textprimary dark:text-bgwhite">
                    {viewRule.points}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] font-medium uppercase tracking-wide text-labelprimary/80 dark:text-darklabelprimary/80">
                    {t("status")}
                  </span>
                  <span
                    className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      viewRule.isActive
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                    }`}
                  >
                    {viewRule.isActive ? t("active") : t("inactive")}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-bordercolor1 bg-bgsecondary/40 px-4 py-3 dark:border-bordercolor2 dark:bg-darkbgsecondary/40">
              <span className="text-[12px] font-medium uppercase tracking-wide text-labelprimary/80 dark:text-darklabelprimary/80">
                {t("description")}
              </span>
              <p className="mt-2 text-[14px] leading-relaxed text-textparagraph dark:text-textparagraphlight">
                {viewRule.description || "-"}
              </p>
            </div>

            {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-bordercolor1 bg-bgsecondary/40 px-4 py-3 dark:border-bordercolor2 dark:bg-darkbgsecondary/40">
                <span className="text-[12px] font-medium uppercase tracking-wide text-labelprimary/80 dark:text-darklabelprimary/80">
                  {t("createdOn")}
                </span>
                <div className="mt-1 text-[13px] text-textparagraph dark:text-textparagraphlight">
                  {viewRule.createdOn ? (
                    <FormattedDate date={viewRule.createdOn} />
                  ) : (
                    "-"
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-bordercolor1 bg-bgsecondary/40 px-4 py-3 dark:border-bordercolor2 dark:bg-darkbgsecondary/40">
                <span className="text-[12px] font-medium uppercase tracking-wide text-labelprimary/80 dark:text-darklabelprimary/80">
                  {t("modifiedOn")}
                </span>
                <div className="mt-1 text-[13px] text-textparagraph dark:text-textparagraphlight">
                  {viewRule.modifiedOn ? (
                    <FormattedDate date={viewRule.modifiedOn} />
                  ) : (
                    "-"
                  )}
                </div>
              </div>
            </div> */}
          </div>
        </CustomModal>
      )}

      {/* Edit Modal */}
      {editRule && (
        <CustomModal
          isOpen={!!editRule}
          onClose={() => {
            if (isSubmitting) return;
            setEditRule(null);
          }}
          title={t("pointRuleDetails")}
          size="md"
        >
          <FormBuilder<PointRuleFormValues>
            defaultValues={editDefaultValues}
            formConfig={editFormConfig}
            onSubmit={handleUpdate}
            submitText={isSubmitting ? t("saving") : t("saveChanges")}
            isLoading={isSubmitting}
            scrollable={false}
            secondaryAction={
              <span className="text-sm font-medium text-labelprimary dark:text-darklabelprimary">
                {t("cancel")}
              </span>
            }
            onSecondaryAction={() => {
              if (isSubmitting) return;
              setEditRule(null);
            }}
          />
        </CustomModal>
      )}
    </>
  );
};

export default PointRulesTable;
