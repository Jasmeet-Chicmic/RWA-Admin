"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { Save, Infinity, Hash } from "lucide-react";
import CustomModal from "@/components/molecules/CustomModal/CustomModal";
import { SystemFeature, UpdateDefaultFeaturePayload } from "@/shared/types";
import { updateDefaultFeaturesAction } from "@/api/features";

interface EditFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: SystemFeature | null;
  onSuccess: () => void;
}

const EditFeatureModal = ({
  isOpen,
  onClose,
  feature,
  onSuccess,
}: EditFeatureModalProps) => {
  const t = useTranslations("users.EditFeatureModal");
  const [isSaving, setIsSaving] = useState(false);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [value, setValue] = useState<number | null>(null);
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (feature) {
      setValue(feature.defaultValue);
      setIsUnlimited(feature.defaultValue === null);
      setIsDefault(feature.isDefault);
    }
  }, [feature]);

  const isInvalid = !isUnlimited && (value === null || value === undefined);

  const handleSave = async () => {
    if (!feature || isInvalid) return;

    setIsSaving(true);
    try {
      const payload: UpdateDefaultFeaturePayload = {
        features: [
          {
            featureId: feature.id,
            value: isUnlimited ? null : value,
            isDefault: isDefault,
          },
        ],
      };

      const res = await updateDefaultFeaturesAction(payload);
      if (res.status) {
        toast.success(res.message || t("Save Success"));
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || t("Save Error"));
      }
    } catch (error) {
      console.error("Error updating feature:", error);
      toast.error(t("Save Error"));
    } finally {
      setIsSaving(false);
    }
  };

  if (!feature) return null;

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title={t("Title")} size="md">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-textprimary dark:text-sidebartext mb-1">
            {t("Feature Name")}
          </label>
          <div className="px-4 py-2 bg-gray-50 dark:bg-darkbgsecondary rounded-lg text-sm text-gray-600 dark:text-gray-400 border border-bordercolor1 dark:border-darkbordercolor1">
            {feature.displayName}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-textprimary dark:text-sidebartext mb-3">
            {t("Value")}
          </label>
          <div className="flex rounded-lg overflow-hidden border border-bordercolor1 dark:border-darkbordercolor1 mb-3">
            <button
              onClick={() => setIsUnlimited(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all ${
                isUnlimited
                  ? "bg-primarycolor text-bgwhite dark:bg-secondarycolor dark:text-white/80"
                  : "bg-gray-50 dark:bg-darkbgsecondary text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Infinity size={18} />
              {t("Unlimited")}
            </button>
            <button
              onClick={() => setIsUnlimited(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all ${
                !isUnlimited
                  ? "bg-primarycolor text-bgwhite dark:bg-secondarycolor dark:text-white/80"
                  : "bg-gray-50 dark:bg-darkbgsecondary text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Hash size={18} />
              {t("Custom")}
            </button>
          </div>

          {!isUnlimited && (
            <input
              type="number"
              value={value ?? ""}
              onChange={(e) =>
                setValue(e.target.value === "" ? null : Number(e.target.value))
              }
              placeholder={t("Value")}
              className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-textprimary dark:text-bgwhite focus:outline-none focus:ring-2 transition-all ${
                isInvalid
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-bordercolor1 dark:border-darkbordercolor1 focus:ring-primarycolor/30"
              }`}
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-textprimary dark:text-sidebartext mb-3">
            {t("Basic User Rights")}
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name="isDefault"
                  checked={isDefault === true}
                  onChange={() => setIsDefault(true)}
                  className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full checked:border-primarycolor dark:checked:border-secondarycolor transition-all"
                />
                <div className="absolute w-2.5 h-2.5 rounded-full bg-primarycolor dark:bg-white/80 scale-0 peer-checked:scale-100 transition-transform" />
              </div>
              <span className="text-sm font-medium text-textprimary dark:text-sidebartext group-hover:text-primarycolor dark:group-hover:text-secondarycolor transition-colors">
                {t("Yes")}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name="isDefault"
                  checked={isDefault === false}
                  onChange={() => setIsDefault(false)}
                  className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full checked:border-primarycolor dark:checked:border-secondarycolor transition-all"
                />
                <div className="absolute w-2.5 h-2.5 rounded-full bg-primarycolor dark:bg-white/80 scale-0 peer-checked:scale-100 transition-transform" />
              </div>
              <span className="text-sm font-medium text-textprimary dark:text-sidebartext group-hover:text-primarycolor dark:group-hover:text-secondarycolor transition-colors">
                {t("No")}
              </span>
            </label>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving || isInvalid}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primarycolor text-bgwhite dark:bg-secondarycolor dark:text-white/80 rounded-xl hover:bg-primaryhover dark:hover:bg-secondaryhover transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {t("Save Changes")}
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default EditFeatureModal;
