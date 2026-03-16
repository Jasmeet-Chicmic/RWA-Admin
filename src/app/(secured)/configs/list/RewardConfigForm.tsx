"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { Pencil, X, Save, Coins, Wallet, Percent } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import { InputField } from "@/components/molecules/FormBuilder/fields/InputField";
import {
  type CurrencyWiseConfig,
  type RewardConfig,
  updateConfigAction,
} from "@/api/config";
import { CURRENCY_TYPE_NAMES, CONFIG_TYPE } from "@/shared/constants";
import {
  formatCurrency,
  truncateToCurrencyPrecision,
  getCurrencyStep,
  truncateToDecimalPlaces,
} from "@/shared/utils";

interface FormValues {
  currencyWiseConfigs: CurrencyWiseConfig[];
}

interface RewardConfigFormProps {
  initialConfig: RewardConfig | null;
}

const RewardConfigForm = ({ initialConfig }: RewardConfigFormProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currencyWiseConfigs, setCurrencyWiseConfigs] = useState<
    CurrencyWiseConfig[]
  >(initialConfig?.currencyWiseConfigs || []);

  const methods = useForm<FormValues>({
    defaultValues: {
      currencyWiseConfigs: currencyWiseConfigs,
    },
  });

  const { handleSubmit, reset, control } = methods;

  const { fields } = useFieldArray({
    control,
    name: "currencyWiseConfigs",
  });

  // Sync form with initial config
  useEffect(() => {
    if (initialConfig?.currencyWiseConfigs) {
      setCurrencyWiseConfigs(initialConfig.currencyWiseConfigs);
      reset({ currencyWiseConfigs: initialConfig.currencyWiseConfigs });
    }
  }, [initialConfig, reset]);

  // Reset form when currencyWiseConfigs changes (after successful update)
  useEffect(() => {
    if (!isEditing && currencyWiseConfigs.length > 0) {
      reset({ currencyWiseConfigs });
    }
  }, [currencyWiseConfigs, reset, isEditing]);

  const handleCancel = () => {
    reset({ currencyWiseConfigs });
    setIsEditing(false);
  };

  const onSubmit = async (data: FormValues) => {
    // Normalize data and ensure currency is set for each config
    const normalizedConfigs = data.currencyWiseConfigs.map(
      (configItem, index) => {
        const currency =
          Number(configItem.currency) || fields[index]?.currency || 1;
        return {
          currency,
          loginRewardPayout: String(configItem.loginRewardPayout || 0),
          depositBonusPercentage: String(
            configItem.depositBonusPercentage || 0,
          ),
        };
      },
    );

    setIsLoading(true);
    try {
      const payload = {
        type: CONFIG_TYPE.REWARDS,
        currencyWiseConfigs: normalizedConfigs,
      };

      const res = await updateConfigAction(payload);

      if (res && typeof res === "object") {
        if (res.status === true) {
          toast.success(res.message || "Config updated successfully");
          setCurrencyWiseConfigs(normalizedConfigs);
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
      console.error("Error updating reward config:", error);
      toast.error("An error occurred while updating config");
    } finally {
      setIsLoading(false);
    }
  };

  if (currencyWiseConfigs.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-sidebartext">
        No reward configuration found
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-8 lg:p-10">
          {/* Header with Edit/Save buttons */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-[1.25rem] font-bold text-textprimary dark:text-sidebartext">
                Reward Settings
              </h3>
              <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                Configure login rewards and deposit bonuses per currency
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-labelprimary bg-bgwhite rounded-lg hover:bg-gray-50 dark:bg-darkbgprimary dark:text-sidebartext dark:border-bordercolor2 dark:hover:bg-labelprimary"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primarycolor text-bgwhite dark:bg-secondarycolor dark:text-white/80 hover:bg-primaryhover dark:hover:bg-secondaryhover rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primarycolor text-bgwhite dark:bg-secondarycolor dark:text-white/80 hover:bg-primaryhover dark:hover:bg-secondaryhover rounded-lg"
                >
                  <Pencil size={16} />
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Currency Wise Configs */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-6 bg-bgwhite dark:bg-darkbgprimary rounded-[10px] shadow-[0_0_10px_0_rgba(0,0,0,0.025)] border border-bordercolor1 dark:border-bordercolor2 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-bordercolor1 dark:border-bordercolor2">
                  <div className="p-3 bg-primarycolor/10 dark:bg-secondarycolor/20 rounded-2xl">
                    <Coins className="w-6 h-6 text-primarycolor dark:text-secondarycolor" />
                  </div>
                  <div>
                    <h4 className="text-[1.25rem] lg:text-[1.5rem] font-bold text-textprimary dark:text-bgwhite leading-none">
                      {CURRENCY_TYPE_NAMES[field.currency] ||
                        `Currency ${field.currency}`}
                    </h4>
                    <p className="text-sm font-medium text-textparagraph dark:text-sidebartext mt-2">
                      Manage rewards and bonuses for this currency
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Login Reward Payout */}
                  <div className="group">
                    {isEditing ? (
                      <div className="p-4 bg-primarycolor/5 dark:bg-darkbgsecondary rounded-2xl border border-bordercolor1 dark:border-bordercolor2 transition-all duration-300 focus-within:border-secondarycolor dark:focus-within:border-secondarycolor focus-within:ring-1 focus-within:ring-secondarycolor">
                        <InputField<FormValues>
                          name={`currencyWiseConfigs.${index}.loginRewardPayout`}
                          label="Login Reward Payout"
                          type="number"
                          placeholder="Enter login reward amount"
                          className="!mb-0"
                          step={getCurrencyStep(field.currency)}
                          interceptor={(val) =>
                            truncateToCurrencyPrecision(val, field.currency)
                          }
                          validation={{
                            required: "Login reward payout is required",
                            min: { value: 0, message: "Must be 0 or greater" },
                          }}
                        />
                      </div>
                    ) : (
                      <div className="p-6 bg-primarycolor/5 dark:bg-darkbgsecondary rounded-[10px] h-full border border-bordercolor1 dark:border-bordercolor2 hover:border-primarycolor/30 dark:hover:border-secondarycolor/30 transition-all duration-300">
                        <div className="block mb-4 text-xs font-bold text-textparagraph dark:text-sidebartext uppercase tracking-widest">
                          Login Reward Payout
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-bgwhite dark:bg-darkbgprimary rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <Wallet className="w-5 h-5 text-primarycolor dark:text-white" />
                          </div>
                          <span className="text-[1.75rem] font-bold text-textprimary dark:text-sidebartext leading-none">
                            {formatCurrency(
                              Number(
                                currencyWiseConfigs[index]?.loginRewardPayout ||
                                  field.loginRewardPayout ||
                                  0,
                              ),
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Deposit Bonus Percentage */}
                  <div className="group">
                    {isEditing ? (
                      <div className="p-4 bg-primarycolor/5 dark:bg-darkbgsecondary rounded-2xl border border-bordercolor1 dark:border-bordercolor2 transition-all duration-300 focus-within:border-secondarycolor dark:focus-within:border-secondarycolor focus-within:ring-1 focus-within:ring-secondarycolor">
                        <InputField<FormValues>
                          name={`currencyWiseConfigs.${index}.depositBonusPercentage`}
                          label="Deposit Bonus Percentage"
                          type="number"
                          placeholder="Enter deposit bonus percentage"
                          className="!mb-0"
                          step={0.01}
                          interceptor={(val) => truncateToDecimalPlaces(val, 2)}
                          validation={{
                            required: "Deposit bonus percentage is required",
                            min: { value: 0, message: "Must be 0 or greater" },
                            max: { value: 100, message: "Cannot exceed 100%" },
                          }}
                        />
                      </div>
                    ) : (
                      <div className="p-6 bg-primarycolor/5 dark:bg-darkbgsecondary rounded-2xl border border-bordercolor1 dark:border-bordercolor2 hover:border-primarycolor/30 dark:hover:border-secondarycolor/30 transition-all duration-300">
                        <div className="block mb-4 text-xs font-bold text-textparagraph dark:text-sidebartext uppercase tracking-widest">
                          Deposit Bonus Percentage
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-bgwhite dark:bg-darkbgprimary rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <Percent className="w-5 h-5 text-primarycolor dark:text-white" />
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-[1.75rem] font-bold text-textprimary dark:text-sidebartext leading-none">
                              {currencyWiseConfigs[index]
                                ?.depositBonusPercentage ||
                                field.depositBonusPercentage ||
                                0}
                            </span>
                            <span className="text-xl font-bold text-primarycolor dark:text-secondarycolor">
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default RewardConfigForm;
