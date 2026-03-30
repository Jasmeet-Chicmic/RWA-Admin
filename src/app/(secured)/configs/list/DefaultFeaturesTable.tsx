"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Pencil, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import SearchToolbar from "@/components/atoms/SearchToolbar";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { TableColumn } from "@/components/atoms/Table";
import { SystemFeature } from "@/shared/types";
import { updateFeatureActiveStatusAction } from "@/api/features";
import CustomMenu from "@/components/atoms/Menu/Menu";
import EditFeatureModal from "./EditFeatureModal";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
  TEXT_GRAY_WHITE,
} from "@/shared/styles";

interface DefaultFeaturesTableProps {
  data: SystemFeature[];
  totalCount: number;
}

const DefaultFeaturesTable = ({
  data,
  totalCount,
}: DefaultFeaturesTableProps) => {
  const t = useTranslations("users");
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<SystemFeature | null>(
    null,
  );
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const searchString = searchParams.get("searchText") || "";

  const handleEditClick = (feature: SystemFeature) => {
    setSelectedFeature(feature);
    setIsEditModalOpen(true);
  };

  const handleToggleActive = useCallback(
    async (featureId: string, newActiveState: boolean) => {
      setIsActionLoading(`status-${featureId}`);

      try {
        const res = await updateFeatureActiveStatusAction({
          features: [{ featureId, isActive: newActiveState }],
        });

        if (res.status) {
          toast.success(
            res.message ||
              t(newActiveState ? "Feature activated" : "Feature deactivated"),
          );
          router.refresh();
        } else {
          toast.error(res.message || t("failedToUpdateFeatureStatus"));
        }
      } catch (error) {
        console.error("Error toggling feature active status:", error);
        toast.error(t("failedToUpdateFeatureStatus"));
      } finally {
        setIsActionLoading(null);
      }
    },
    [router, t],
  );

  const config: DataTableConfig<SystemFeature> = useMemo(() => {
    const columns: TableColumn<SystemFeature>[] = [
      {
        field: "displayName",
        title: t("featureName"),
        render: (item) => (
          <span className={TEXT_GRAY_WHITE}>{item.displayName}</span>
        ),
      },
      {
        field: "featureCode",
        title: t("featureCode"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.featureCode}
          </span>
        ),
      },
      {
        field: "isDefault",
        title: t("isDefault"),
        render: (item) => (
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${TEXT_SIZE_SM} font-bold border ${
              item.isDefault
                ? "bg-primarycolor/10 text-primarycolor border-primarycolor/20 dark:bg-primarycolor/10 dark:text-white/80 dark:border-secondarycolor/10"
                : "bg-gray-100 text-gray-600 border-gray-300 dark:bg-primarycolor dark:text-white/80 dark:border-primarycolor"
            }`}
          >
            {item.isDefault ? t("yes") : t("no")}
          </div>
        ),
      },
      {
        field: "defaultValue",
        title: t("defaultValue"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.defaultValue ?? t("unlimited")}
          </span>
        ),
      },
      {
        field: "isActive",
        title: t("isActive"),
        render: (item) => {
          const isActive = item.isActive ?? false;
          const featureId = item.id;
          const isLoading = isActionLoading === `status-${featureId}`;

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
                  onClick: () => void handleToggleActive(featureId, true),
                  disabled: isActive || isLoading,
                },
                {
                  label: (
                    <div className="flex items-center gap-2 py-1">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="font-medium">{t("inactive")}</span>
                    </div>
                  ),
                  onClick: () => void handleToggleActive(featureId, false),
                  disabled: !isActive || isLoading,
                },
              ]}
            />
          );
        },
      },
      {
        field: "",
        title: t("actions"),
        render: (item) => (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleEditClick(item)}
              className="text-gray-500 hover:text-primarycolor dark:hover:text-secondarycolor transition-colors dark:text-sidebartext"
              title={t("edit")}
            >
              <Pencil size={18} />
            </button>
          </div>
        ),
        fixed: "right",
      },
    ];

    return {
      columns,
      keyExtractor: (item) => item.id,
      paginationTitle: "features",
      header: (
        <div className="bg-bgwhite dark:bg-darkbgprimary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2
                className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
              >
                {t("defaultFeatures")}
              </h2>
            </div>
            <SearchToolbar
              initialQuery={searchString}
              placeholder={t("searchFeaturesPlaceholder")}
              queryParamName="searchText"
            />
          </div>
        </div>
      ),
    };
  }, [t, isActionLoading, handleToggleActive, searchString]);

  return (
    <>
      <DataTable data={data} totalCount={totalCount} config={config} />
      <EditFeatureModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        feature={selectedFeature}
        onSuccess={() => router.refresh()}
      />
    </>
  );
};

export default DefaultFeaturesTable;
