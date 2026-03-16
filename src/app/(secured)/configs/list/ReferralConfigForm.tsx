"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import {
  Pencil,
  X,
  Save,
  Coins,
  Clock,
  Wallet,
  Percent,
  Target,
  Banknote,
} from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import { InputField } from "@/components/molecules/FormBuilder/fields/InputField";
import {
  type ReferralRewardConfig,
  type RewardConfig,
  updateConfigAction,
} from "@/api/config";
import {
  CURRENCY_TYPE_NAMES,
  CONFIG_TYPE,
  CURRENCY_TYPE,
} from "@/shared/constants";
import {
  formatCurrency,
  truncateToCurrencyPrecision,
  getCurrencyStep,
  truncateToDecimalPlaces,
} from "@/shared/utils";

interface FormValues {
  referralTimeLimitInHours: number;
  referralRewardConfig: ReferralRewardConfig[];
}

interface ReferralConfigFormProps {
  initialConfig: RewardConfig | null;
}

// Default config for all currencies
const getDefaultConfig = (): ReferralRewardConfig[] => {
  return Object.values(CURRENCY_TYPE)
    .filter((val): val is number => typeof val === "number")
    .map((currency) => ({
      currency,
      rewardAmountNonWithdrawable: 0,
      rewardAmountWithdrawable: 0,
      betCount: 0,
      minimumBetAmount: 0,
      commissionPercentage: 0,
    }));
};

const ReferralConfigForm = ({ initialConfig }: ReferralConfigFormProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [referralTimeLimitInHours, setReferralTimeLimitInHours] =
    useState<number>(initialConfig?.referralTimeLimitInHours || 24);
  const [referralRewardConfig, setReferralRewardConfig] = useState<
    ReferralRewardConfig[]
  >(initialConfig?.referralRewardConfig || getDefaultConfig());

  const methods = useForm<FormValues>({
    defaultValues: {
      referralTimeLimitInHours: referralTimeLimitInHours,
      referralRewardConfig: referralRewardConfig,
    },
  });

  const { handleSubmit, reset, control } = methods;

  const { fields } = useFieldArray({
    control,
    name: "referralRewardConfig",
  });

  // Sync form with initial config
  useEffect(() => {
    if (initialConfig) {
      const configs = initialConfig.referralRewardConfig || getDefaultConfig();
      const timeLimit = initialConfig.referralTimeLimitInHours || 24;
      setReferralRewardConfig(configs);
      setReferralTimeLimitInHours(timeLimit);
      reset({
        referralTimeLimitInHours: timeLimit,
        referralRewardConfig: configs,
      });
    }
  }, [initialConfig, reset]);

  // Reset form when config changes (after successful update)
  useEffect(() => {
    if (!isEditing && referralRewardConfig.length > 0) {
      reset({
        referralTimeLimitInHours: referralTimeLimitInHours,
        referralRewardConfig: referralRewardConfig,
      });
    }
  }, [referralRewardConfig, referralTimeLimitInHours, reset, isEditing]);

  const handleCancel = () => {
    reset({
      referralTimeLimitInHours: referralTimeLimitInHours,
      referralRewardConfig: referralRewardConfig,
    });
    setIsEditing(false);
  };

  const onSubmit = async (data: FormValues) => {
    // Normalize data and ensure currency is set for each config
    const normalizedConfigs = data.referralRewardConfig.map(
      (configItem, index) => {
        const currency =
          Number(configItem.currency) || fields[index]?.currency || 1;
        return {
          currency,
          rewardAmountNonWithdrawable: String(
            configItem.rewardAmountNonWithdrawable || 0,
          ),
          rewardAmountWithdrawable: String(0), // Always set to 0
          betCount: Number(configItem.betCount) || 0,
          minimumBetAmount: String(configItem.minimumBetAmount || 0),
          commissionPercentage: String(configItem.commissionPercentage || 0),
        };
      },
    );

    setIsLoading(true);
    try {
      const payload = {
        type: CONFIG_TYPE.REFERRAL,
        referralTimeLimitInHours: Number(data.referralTimeLimitInHours) || 24,
        referralRewardConfig: normalizedConfigs,
      };

      const res = await updateConfigAction(payload);

      if (res && typeof res === "object") {
        if (res.status === true) {
          toast.success(res.message || "Referral config updated successfully");
          setReferralRewardConfig(normalizedConfigs);
          setReferralTimeLimitInHours(
            Number(data.referralTimeLimitInHours) || 24,
          );
          setIsEditing(false);
          router.refresh();
          console.log("test");

          return;
        }

        if (
          res.status === false ||
          (res.statusCode && res.statusCode !== 200)
        ) {
          toast.error(res.message || "Failed to update referral config");
          return;
        }
      }

      toast.error("Invalid response from server");
    } catch (error) {
      console.error("Error updating referral config:", error);
      toast.error("An error occurred while updating referral config");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-8 lg:p-10">
          {/* Header with Edit/Save buttons */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[1.25rem] font-bold text-textprimary dark:text-sidebartext">
                Referral Settings
              </h3>
              <p className="text-[14px] font-medium text-textparagraph dark:text-sidebartext">
                Configure referral rewards and time limits per currency
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
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-bgwhite bg-primarycolor dark:bg-secondarycolor dark:text-bgblack rounded-lg hover:bg-primaryhover dark:hover:bg-secondaryhover disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-bgwhite bg-primarycolor dark:bg-secondarycolor dark:text-bgblack rounded-lg hover:bg-primaryhover dark:hover:bg-secondaryhover transition-colors"
                >
                  <Pencil size={16} />
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Referral Time Limit */}
          <div className="mb-8 p-6 bg-bgwhite dark:bg-darkbgprimary rounded-[10px] shadow-[0_0_10px_0_rgba(0,0,0,0.025)] border border-bordercolor1 dark:border-bordercolor2 transition-all duration-300">
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-bordercolor1 dark:border-bordercolor2">
              <div className="p-3 bg-primarycolor/10 dark:bg-secondarycolor/20 rounded-2xl">
                <Clock className="w-6 h-6 text-primarycolor dark:text-secondarycolor" />
              </div>
              <div>
                <h4 className="text-[1.25rem] lg:text-[1.5rem] font-bold text-textprimary dark:text-bgwhite leading-none">
                  Referral Time Limit
                </h4>
                <p className="text-sm font-medium text-textparagraph dark:text-sidebartext mt-2">
                  Set the duration for which a referral remains valid
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group">
                {isEditing ? (
                  <div className="p-4 bg-primarycolor/5 dark:bg-darkbgsecondary rounded-2xl border border-bordercolor1 dark:border-bordercolor2 transition-all duration-300 focus-within:border-secondarycolor dark:focus-within:border-secondarycolor focus-within:ring-1 focus-within:ring-secondarycolor">
                    <InputField<FormValues>
                      name="referralTimeLimitInHours"
                      label="Time Limit (Hours)"
                      type="number"
                      placeholder="Enter time limit in hours"
                      className="!mb-0"
                      validation={{
                        required: "Time limit is required",
                        min: { value: 1, message: "Must be at least 1 hour" },
                      }}
                    />
                  </div>
                ) : (
                  <div className="p-6 bg-primarycolor/5 dark:bg-darkbgsecondary rounded-[10px] border border-bordercolor1 dark:border-bordercolor2 hover:border-primarycolor/30 dark:hover:border-secondarycolor/30 transition-all duration-300">
                    <div className="block mb-4 text-xs font-bold text-textparagraph dark:text-sidebartext uppercase tracking-widest">
                      Time Limit (Hours)
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-bgwhite dark:bg-darkbgprimary rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                        <Clock className="w-5 h-5 text-primarycolor dark:text-white" />
                      </div>
                      <span className="text-[1.75rem] font-bold text-textprimary dark:text-sidebartext leading-none">
                        {referralTimeLimitInHours} hours
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Currency Wise Referral Configs */}
          <div className="space-y-6">
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
                      Manage referral rewards for this currency
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
                  {/* Reward Amount Non-Withdrawable */}
                  <div className="group">
                    {isEditing ? (
                      <div className="p-4 bg-primarycolor/5 dark:bg-darkbgsecondary rounded-2xl border border-bordercolor1 dark:border-bordercolor2 transition-all duration-300 focus-within:border-secondarycolor dark:focus-within:border-secondarycolor focus-within:ring-1 focus-within:ring-secondarycolor">
                        <InputField<FormValues>
                          name={`referralRewardConfig.${index}.rewardAmountNonWithdrawable`}
                          label="Non-Withdrawable Reward"
                          type="number"
                          placeholder="Enter amount"
                          className="!mb-0"
                          step={getCurrencyStep(field.currency)}
                          interceptor={(val) =>
                            truncateToCurrencyPrecision(val, field.currency)
                          }
                          validation={{
                            required: "Required",
                            min: { value: 0, message: "Must be 0 or greater" },
                          }}
                        />
                      </div>
                    ) : (
                      <div className="p-6 bg-primarycolor/5 dark:bg-darkbgsecondary rounded-[10px] h-full border border-bordercolor1 dark:border-bordercolor2 hover:border-primarycolor/30 dark:hover:border-secondarycolor/30 transition-all duration-300">
                        <div className="block mb-4 text-xs font-bold text-textparagraph dark:text-sidebartext uppercase tracking-widest">
                          Non-Withdrawable Reward
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-bgwhite dark:bg-darkbgprimary rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <Wallet className="w-5 h-5 text-primarycolor dark:text-white" />
                          </div>
                          <span className="text-[1.75rem] font-bold text-textprimary dark:text-sidebartext leading-none">
                            {formatCurrency(
                              Number(
                                referralRewardConfig[index]
                                  ?.rewardAmountNonWithdrawable ||
                                  field.rewardAmountNonWithdrawable ||
                                  0,
                              ),
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bet Count */}
                  <div className="group">
                    {isEditing ? (
                      <div className="p-4 bg-primarycolor/5 dark:bg-darkbgsecondary rounded-2xl border border-bordercolor1 dark:border-bordercolor2 transition-all duration-300 focus-within:border-secondarycolor dark:focus-within:border-secondarycolor focus-within:ring-1 focus-within:ring-secondarycolor">
                        <InputField<FormValues>
                          name={`referralRewardConfig.${index}.betCount`}
                          label="Required Bet Count"
                          type="number"
                          placeholder="Enter bet count"
                          className="!mb-0"
                          validation={{
                            required: "Required",
                            min: { value: 0, message: "Must be 0 or greater" },
                          }}
                        />
                      </div>
                    ) : (
                      <div className="p-6 bg-primarycolor/5 dark:bg-darkbgsecondary rounded-[10px] h-full border border-bordercolor1 dark:border-bordercolor2 hover:border-primarycolor/30 dark:hover:border-secondarycolor/30 transition-all duration-300">
                        <div className="block mb-4 text-xs font-bold text-textparagraph dark:text-sidebartext uppercase tracking-widest">
                          Required Bet Count
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-bgwhite dark:bg-darkbgprimary rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <Target className="w-5 h-5 text-primarycolor dark:text-white" />
                          </div>
                          <span className="text-[1.75rem] font-bold text-textprimary dark:text-sidebartext leading-none">
                            {referralRewardConfig[
                              index
                            ]?.betCount?.toLocaleString() ||
                              field.betCount?.toLocaleString() ||
                              "0"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Minimum Bet Amount */}
                  <div className="group">
                    {isEditing ? (
                      <div className="p-4 bg-primarycolor/5 dark:bg-darkbgsecondary rounded-2xl border border-bordercolor1 dark:border-bordercolor2 transition-all duration-300 focus-within:border-secondarycolor dark:focus-within:border-secondarycolor focus-within:ring-1 focus-within:ring-secondarycolor">
                        <InputField<FormValues>
                          name={`referralRewardConfig.${index}.minimumBetAmount`}
                          label="Minimum Bet Amount"
                          type="number"
                          placeholder="Enter minimum bet"
                          className="!mb-0"
                          step={getCurrencyStep(field.currency)}
                          interceptor={(val) =>
                            truncateToCurrencyPrecision(val, field.currency)
                          }
                          validation={{
                            required: "Required",
                            min: { value: 0, message: "Must be 0 or greater" },
                          }}
                        />
                      </div>
                    ) : (
                      <div className="p-6 bg-primarycolor/5 dark:bg-darkbgsecondary rounded-[10px] h-full border border-bordercolor1 dark:border-bordercolor2 hover:border-primarycolor/30 dark:hover:border-secondarycolor/30 transition-all duration-300">
                        <div className="block mb-4 text-xs font-bold text-textparagraph dark:text-sidebartext uppercase tracking-widest">
                          Minimum Bet Amount
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-bgwhite dark:bg-darkbgprimary rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <Banknote className="w-5 h-5 text-primarycolor dark:text-white" />
                          </div>
                          <span className="text-[1.75rem] font-bold text-textprimary dark:text-sidebartext leading-none">
                            {formatCurrency(
                              Number(
                                referralRewardConfig[index]?.minimumBetAmount ||
                                  field.minimumBetAmount ||
                                  0,
                              ),
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Commission Percentage */}
                  <div className="group">
                    {isEditing ? (
                      <div className="p-4 bg-primarycolor/5 dark:bg-darkbgsecondary rounded-2xl border border-bordercolor1 dark:border-bordercolor2 transition-all duration-300 focus-within:border-secondarycolor dark:focus-within:border-secondarycolor focus-within:ring-1 focus-within:ring-secondarycolor">
                        <InputField<FormValues>
                          name={`referralRewardConfig.${index}.commissionPercentage`}
                          label="Commission Percentage"
                          type="number"
                          placeholder="Enter percentage"
                          className="!mb-0"
                          step={0.01}
                          interceptor={(val) => truncateToDecimalPlaces(val, 2)}
                          validation={{
                            required: "Required",
                            min: { value: 0, message: "Must be 0 or greater" },
                            max: { value: 100, message: "Cannot exceed 100%" },
                          }}
                        />
                      </div>
                    ) : (
                      <div className="p-6 bg-primarycolor/5 dark:bg-darkbgsecondary rounded-[10px] h-full border border-bordercolor1 dark:border-bordercolor2 hover:border-primarycolor/30 dark:hover:border-secondarycolor/30 transition-all duration-300">
                        <div className="block mb-4 text-xs font-bold text-textparagraph dark:text-sidebartext uppercase tracking-widest">
                          Commission Percentage
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-bgwhite dark:bg-darkbgprimary rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <Percent className="w-5 h-5 text-primarycolor dark:text-white" />
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-[1.75rem] font-bold text-textprimary dark:text-sidebartext leading-none">
                              {referralRewardConfig[
                                index
                              ]?.commissionPercentage?.toLocaleString() ||
                                field.commissionPercentage?.toLocaleString() ||
                                "0"}
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

export default ReferralConfigForm;
