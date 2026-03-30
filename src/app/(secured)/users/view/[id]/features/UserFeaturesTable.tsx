"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Save, Infinity, Hash, Check, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTableQuerySync } from "@/hooks/useTableQuerySync";
import SearchInput from "@/components/atoms/SearchInput/SearchInput";
import Pagination from "@/components/atoms/Pagination";
import Tooltip from "@/components/atoms/Tooltip/Tooltip";
import { updateRoleFeatureAction } from "@/api/user";
import { UserFeature } from "@/shared/types";

interface EditableFeature extends UserFeature {
  editedValue: number | null;
  displayValue: number | null;
  isEditedUnlimited: boolean;
}

interface UserFeaturesProps {
  features: UserFeature[];
  userId: string;
  totalCount: number;
}

const mapFeatureToEditable = (f: UserFeature): EditableFeature => {
  // currentValue is the source of truth for display
  const displayValue = f.currentValue ?? null;

  return {
    ...f,
    editedValue: displayValue,
    displayValue,
    assignedValue: f.assignedValue ?? null,
    minimumValue: f.minimumValue ?? null,
    isEditedUnlimited: displayValue === null,
  };
};

const UserFeaturesView = ({
  features,
  userId,
  totalCount,
}: UserFeaturesProps) => {
  const router = useRouter();
  const t = useTranslations("users.features");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editableFeatures, setEditableFeatures] = useState<EditableFeature[]>(
    features.map(mapFeatureToEditable),
  );

  const {
    currentPage,
    pageSize,
    searchText,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
  } = useTableQuerySync();

  useEffect(() => {
    setEditableFeatures(features.map(mapFeatureToEditable));
  }, [features]);

  // const handleToggleEditMode = () => {
  //   if (isEditMode) {
  //     setEditableFeatures(features.map(mapFeatureToEditable));
  //   }
  //   setIsEditMode(!isEditMode);
  // };

  const handleToggleUnlimited = (featureId: string) => {
    setEditableFeatures((prev) =>
      prev.map((f) => {
        if (f.id !== featureId) return f;

        // If minimumValue is null, the feature is inherently unlimited — can't toggle
        if (f.minimumValue === null) {
          toast.error(t("unlimitedError"));
          return f;
        }

        // Toggle between numeric value and unlimited
        if (f.isEditedUnlimited) {
          // From unlimited back to numeric
          return { ...f, isEditedUnlimited: false };
        }

        // From numeric to unlimited
        return { ...f, isEditedUnlimited: true };
      }),
    );
  };

  const getMinAllowedValue = (feature: EditableFeature): number => {
    if (feature.minimumValue !== null && feature.minimumValue !== undefined) {
      return feature.minimumValue;
    }
    return 0;
  };

  const handleValueChange = (featureId: string, value: string) => {
    const feature = editableFeatures.find((f) => f.id === featureId);
    if (!feature) return;

    const trimmed = value.trim();
    const numValue =
      trimmed === "" || Number.isNaN(Number(trimmed)) ? null : Number(trimmed);

    setEditableFeatures((prev) =>
      prev.map((f) =>
        f.id === featureId
          ? { ...f, editedValue: numValue, isEditedUnlimited: false }
          : f,
      ),
    );
  };

  const handleUnlimitedClick = (feature: EditableFeature) => {
    const isUnlimited = isEditMode
      ? feature.isEditedUnlimited
      : feature.displayValue === null;

    // Can only set unlimited if minimumValue is not null (i.e. it's a numeric feature)
    const canSetUnlimited = feature.minimumValue !== null;

    if (!isUnlimited && canSetUnlimited) {
      handleToggleUnlimited(feature.id);
    } else if (!canSetUnlimited) {
      toast.error(t("limitError"));
    }
  };

  const handleCustomClick = (feature: EditableFeature) => {
    const isEditable = feature.minimumValue !== null;
    const isUnlimited = isEditMode
      ? feature.isEditedUnlimited
      : feature.displayValue === null;

    if (isUnlimited && isEditable) {
      handleToggleUnlimited(feature.id);
    }
  };

  const handleInputChange = (
    featureId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    handleValueChange(featureId, e.target.value);
  };

  const isFeatureValid = (feature: EditableFeature): boolean => {
    // If minimumValue is null, the feature is inherently unlimited — always valid
    if (feature.minimumValue === null || feature.minimumValue === undefined) {
      return true;
    }

    // Explicit unlimited selection is valid when the feature has a numeric minimum
    if (feature.isEditedUnlimited) {
      return true;
    }

    // If we expect a number but don't have one, it's invalid
    if (feature.editedValue === null) {
      return false;
    }

    // Edited numeric value must be >= minimumValue
    return feature.editedValue >= feature.minimumValue;
  };

  const getFeaturesPayload = () => {
    return editableFeatures.map((f) => ({
      featureId: f.id,
      value: f.isEditedUnlimited ? null : f.editedValue,
    }));
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      const res = await updateRoleFeatureAction({
        userId,
        features: getFeaturesPayload(),
      });
      console.log("save response", getFeaturesPayload(), "res", res);
      if (res.status) {
        toast.success(res.message || t("saveSuccess"));
        setIsEditMode(false);
        router.refresh();
      } else {
        toast.error(res.message || t("saveError"));
      }
    } catch (error) {
      console.error("Error saving features:", error);
      toast.error(t("saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = editableFeatures.some((f) => {
    const { displayValue } = f;

    // Inherently unlimited (minimumValue is null and displayValue is null)
    if (f.minimumValue === null && displayValue === null) {
      return false;
    }

    // Original was unlimited but now numeric
    if (displayValue === null) {
      return !f.isEditedUnlimited;
    }

    // Original numeric, now unlimited
    if (f.isEditedUnlimited) {
      return true;
    }

    // Both numeric: changed if value differs
    return f.editedValue !== displayValue;
  });

  const hasInvalid = editableFeatures.some((f) => !isFeatureValid(f));

  const getStatusLabel = (feature: EditableFeature) => {
    if (feature.isSubscribed) return t("subscribed");
    if (feature.isDefault) return t("default");
    return null;
  };

  return (
    <div className="space-y-4 bg-bgwhite dark:bg-darkbgprimary dark:border-darkbordercolor1 border border-b border-bordergray200ordercolor1 rounded-[20px] p-3 lg:p-4 3xl:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <h3 className="text-[1.25rem] lg:text-[1.5rem] font-bold text-navy dark:text-sidebartext text-textprimary flex items-center gap-2">
          <Shield className="w-5 h-5 text-primarycolor dark:text-white" />
          {t("title")}
        </h3>
        <div className="flex items-center gap-4">
          <div className="w-full sm:w-64">
            <SearchInput
              value={searchText}
              onChange={handleSearch}
              placeholder={t("searchFeaturesPlaceholder")}
            />
          </div>
          <div className="flex items-center gap-2">
            {isEditMode && (
              <button
                onClick={handleSave}
                disabled={!hasChanges || hasInvalid || isSaving}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-primarycolor text-bgwhite dark:bg-secondarycolor dark:text-white/80 hover:bg-primaryhover dark:hover:bg-secondaryhover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {t("saveChanges")}
              </button>
            )}
            {/* <button
              onClick={handleToggleEditMode}
              disabled={isSaving || features.length === 0}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isEditMode
                  ? "bg-gray-100 dark:bg-darkbgsecondary text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  : "bg-primarycolor/10 text-primarycolor dark:bg-secondarycolor/10 dark:text-secondarycolor hover:bg-primarycolor/20 dark:hover:bg-secondarycolor/20"
              }`}
            >
              {isEditMode ? (
                <>
                  <X className="w-4 h-4" />
                  {t("cancel")}
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4" />
                  {t("edit")}
                </>
              )}
            </button> */}
          </div>
        </div>
      </div>

      {features.length === 0 ? (
        <div className="bg-bgwhite dark:bg-darkbgprimary rounded-xl shadow border border-bordercolor1 dark:border-darkbordercolor1 p-12 text-center">
          <Shield className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {t("noFeatures")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {editableFeatures.map((feature) => {
            const { displayValue } = feature;
            const isUnlimited = isEditMode
              ? feature.isEditedUnlimited
              : displayValue === null;
            const currentValue = isEditMode
              ? feature.editedValue
              : displayValue;
            const isChanged =
              isEditMode && feature.editedValue !== displayValue;
            const isEditable = feature.minimumValue !== null;
            const canSetUnlimited = isEditable;
            const statusLabel = getStatusLabel(feature);

            return (
              <div
                key={feature.id}
                className={`relative bg-bgwhite dark:bg-darkbgprimary rounded-xl border transition-all duration-200 overflow-hidden ${
                  isChanged
                    ? "border-primarycolor dark:border-secondarycolor shadow-md shadow-primarycolor/10 dark:shadow-secondarycolor/10"
                    : "border-bordercolor1 dark:border-darkbordercolor1 hover:shadow-sm"
                }`}
              >
                {isChanged && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-primarycolor dark:bg-secondarycolor" />
                )}

                <div className="p-5 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <Tooltip
                        id={`feature-name-${feature.id}`}
                        content={feature.displayName}
                      >
                        <h4 className="text-[16px] font-semibold text-textprimary dark:text-sidebartext truncate">
                          {feature.displayName}
                        </h4>
                      </Tooltip>
                    </div>
                    {statusLabel && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex-shrink-0 ml-2">
                        <Check className="w-3 h-3" />
                        {statusLabel}
                      </span>
                    )}
                  </div>

                  {isEditMode ? (
                    <div className="space-y-3">
                      <div className="flex rounded-lg overflow-hidden border border-bordercolor1 dark:border-darkbordercolor1">
                        <button
                          onClick={() => handleUnlimitedClick(feature)}
                          disabled={!canSetUnlimited}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-all duration-200 ${
                            isUnlimited && canSetUnlimited
                              ? "bg-primarycolor text-bgwhite dark:bg-secondarycolor dark:text-white/80"
                              : canSetUnlimited
                                ? "bg-gray-50 dark:bg-darkbgsecondary text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                : "bg-gray-100 dark:bg-darkbgsecondary text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
                          }`}
                        >
                          <Infinity className="w-3.5 h-3.5" />
                          {t("unlimited")}
                        </button>
                        <button
                          onClick={() => handleCustomClick(feature)}
                          disabled={!isEditable}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-all duration-200 ${
                            !isUnlimited && isEditable
                              ? "bg-primarycolor text-bgwhite dark:bg-secondarycolor dark:text-white/80"
                              : isEditable
                                ? "bg-gray-50 dark:bg-darkbgsecondary text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                : "bg-gray-100 dark:bg-darkbgsecondary text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
                          }`}
                        >
                          <Hash className="w-3.5 h-3.5" />
                          {t("custom")}
                        </button>
                      </div>

                      {!isUnlimited && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              {t("value")}:
                            </label>
                            <input
                              type="number"
                              value={
                                currentValue === null ||
                                currentValue === undefined
                                  ? ""
                                  : currentValue
                              }
                              onChange={(e) => handleInputChange(feature.id, e)}
                              min={getMinAllowedValue(feature)}
                              className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-bordercolor1 dark:border-darkbordercolor1 bg-bgwhite dark:bg-darkbgsecondary text-textprimary dark:text-sidebartext focus:outline-none focus:ring-2 focus:ring-primarycolor/30 dark:focus:ring-secondarycolor/30 transition-all"
                            />
                          </div>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">
                            {t("minValueHint", {
                              min: getMinAllowedValue(feature),
                            })}
                          </p>
                        </div>
                      )}

                      {!isEditable && (
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">
                          {t("unlimitedError")}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-auto">
                      <div className="flex items-center gap-2">
                        {isUnlimited ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primarycolor/10 dark:bg-secondarycolor/10">
                            <Infinity className="w-4 h-4 text-primarycolor dark:text-white" />
                            <span className="text-sm font-semibold text-primarycolor dark:text-white/60">
                              {t("unlimited")}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-darkbgsecondary">
                            <Hash className="w-4 h-4 text-gray-500 dark:text-white" />
                            <span className="text-[16px] font-semibold text-textprimary dark:text-white/60">
                              {currentValue}
                            </span>
                          </div>
                        )}
                      </div>
                      {feature.minimumValue !== null &&
                        feature.minimumValue !== undefined && (
                          <p className="text-[12px] text-gray-700 dark:text-gray-500 mt-1.5">
                            {t("minValueHint", {
                              min: feature.minimumValue,
                            })}
                          </p>
                        )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <Pagination
          totalItems={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          title="features"
          className="!pb-0 border-b-0 !px-0"
        />
      </div>
    </div>
  );
};

export default UserFeaturesView;
