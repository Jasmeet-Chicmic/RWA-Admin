"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Pencil, X, Save } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import { SwitchField } from "@/components/molecules/FormBuilder/fields/SwitchField";
import { type RewardConfig, updateConfigAction } from "@/api/config";
import { CONFIG_TYPE } from "@/shared/constants";

interface FormValues {
  enableChatTranslation: boolean;
}

interface ChatTranslationConfigFormProps {
  initialConfig: RewardConfig | null;
}

const ChatTranslationConfigForm = ({
  initialConfig,
}: ChatTranslationConfigFormProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [enableChatTranslation, setEnableChatTranslation] = useState<boolean>(
    initialConfig?.enableChatTranslation || false,
  );

  const methods = useForm<FormValues>({
    defaultValues: {
      enableChatTranslation: enableChatTranslation,
    },
    mode: "onSubmit",
  });

  const { handleSubmit, reset, watch } = methods;
  const watchedValues = watch();

  // Sync with updated state
  useEffect(() => {
    reset({ enableChatTranslation });
  }, [enableChatTranslation, reset]);

  const handleCancel = () => {
    reset({ enableChatTranslation });
    setIsEditing(false);
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        type: CONFIG_TYPE.CHAT_TRANSLATION,
        enableChatTranslation: data.enableChatTranslation,
      };

      const res = await updateConfigAction(payload);

      if (res && typeof res === "object") {
        if (res.status === true) {
          toast.success(res.message || "Config updated successfully");
          setEnableChatTranslation(data.enableChatTranslation);
          setIsEditing(false);
          router.refresh();
          return;
        }

        if (
          res.status === false ||
          (res.statusCode && res.statusCode !== 200)
        ) {
          toast.error(res.message || "Failed to update config");
          return;
        }
      }

      toast.error("Invalid response from server");
    } catch (error) {
      console.error("Error updating chat translation config:", error);
      toast.error("An error occurred while updating config");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-6">
          {/* Header with Edit/Save buttons */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[1.25rem] font-bold text-textprimary dark:text-sidebartext">
                Chat Translation Settings
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-labelprimary bg-bgwhite border border-darklabelprimary rounded-lg hover:bg-gray-50 dark:bg-darkbgprimary dark:text-darklabelprimary dark:border-gray-600 dark:hover:bg-labelprimary"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-bgwhite bg-primarycolor rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-bgwhite bg-primarycolor rounded-lg hover:bg-purple-700"
                >
                  <Pencil size={16} />
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Enable Chat Translation Toggle */}
          <div className="space-y-4">
            {isEditing ? (
              <SwitchField<FormValues>
                name="enableChatTranslation"
                label="Enable Chat Translation"
                type="switch"
              />
            ) : (
              <div className="space-y-2">
                <div className="block mb-1 font-medium dark:text-sidebartext">
                  Enable Chat Translation
                </div>
                <div className="px-4 py-3 bg-gray-50 rounded-lg dark:bg-darkbgprimary">
                  <span className="text-sm font-medium text-gray-900 dark:text-sidebartext">
                    {watchedValues.enableChatTranslation
                      ? "Enabled"
                      : "Disabled"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default ChatTranslationConfigForm;
