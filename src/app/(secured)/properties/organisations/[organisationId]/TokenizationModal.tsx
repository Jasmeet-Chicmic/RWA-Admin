"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppKit } from "@reown/appkit/react";
import { toast } from "react-toastify";
import { usePublicClient, useWalletClient } from "wagmi";

import CustomModal from "@/components/molecules/CustomModal/CustomModal";
import { InputField } from "@/components/molecules/FormBuilder/fields/InputField";
import Button from "@/components/atoms/Button";

import { AdminProperty } from "../../helpers/types";
import { useWalletState } from "@/components/providers/WalletStateProvider";
import {
  runTokenizationFlow,
  TOKENIZATION_FLOW_STEPS,
  type TokenizationFlowStep,
} from "@/lib/contracts/runTokenizationFlow";
import {
  DISPLAY_CURRENCY,
  formatToFixed,
  fromBaseUnits,
  toBaseUnitsBigInt,
} from "@/shared/utils/unitUtils";

type TokenizationFormValues = {
  ownerAddress: string;
  totalPropertyValue: string;
  totalShares: string;
  rentalIncomeHistory: string;
  expectedAnnualYield: string;
  riskScore: string;
  image: string;
};

const getLoadingMessage = (
  step: TokenizationFlowStep | undefined,
  t: ReturnType<typeof useTranslations>,
) => {
  const progressMessages: Record<TokenizationFlowStep, string> = {
    deployTrexSuite: t("TokenizationForm.Progress.deployTrexSuite"),
    deployVault: t("TokenizationForm.Progress.deployVault"),
    registerProperty: t("TokenizationForm.Progress.registerProperty"),
  };

  return step ? progressMessages[step] : progressMessages.deployTrexSuite;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) return error.message;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return undefined;
};
//Test
const formatUsdcAmount = (value: number, maximumFractionDigits = 2) => {
  const normalizedValue = Number.isFinite(value) ? value : 0;
  return `${formatToFixed(normalizedValue, maximumFractionDigits)} ${DISPLAY_CURRENCY}`;
};

const formatNumberAmount = (value: number, maximumFractionDigits = 2) =>
  formatToFixed(Number.isFinite(value) ? value : 0, maximumFractionDigits);

const parseMoney = (value: string): number | null => {
  const cleaned = value.replace(/[^0-9.]/g, "");
  if (cleaned.trim() === "") return null;
  const parts = cleaned.split(".");
  if (parts.length > 2) return NaN;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return NaN;
  return n;
};

const clampShares = (val: string) => {
  const digits = val.replace(/[^\d]/g, "");
  if (!digits) return "";
  const n = Number(digits);
  if (!Number.isFinite(n)) return "";
  return String(Math.min(n, 10000));
};
const decimalOnly = (val: string) => {
  // allow digits and one decimal point; strip minus/exponent/etc
  const cleaned = val.replace(/[^0-9.]/g, "");
  const [head, ...rest] = cleaned.split(".");
  return rest.length > 0 ? `${head}.${rest.join("")}` : head;
};

const clampPercent = (val: string) => {
  const cleaned = decimalOnly(val);
  if (!cleaned) return "";
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return "";
  return String(Math.min(Math.max(n, 0), 100));
};

const clampRiskScore = (val: string) => {
  const cleaned = decimalOnly(val);
  if (!cleaned) return "";
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return "";
  return String(Math.min(Math.max(n, 0), 1));
};

const preventNegativeAndExponent: React.KeyboardEventHandler<
  HTMLInputElement
> = (e) => {
  if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
    e.preventDefault();
  }
};

export const TokenizationModal = ({
  open,
  onClose,
  property,
  organisationId,
}: {
  open: boolean;
  onClose: () => void;
  property: AdminProperty | null;
  organisationId: string;
}) => {
  const t = useTranslations("properties");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<TokenizationFlowStep>();
  const [showWalletConnectModal, setShowWalletConnectModal] = useState(false);
  const { isConnected } = useWalletState();
  const { open: openWalletModal } = useAppKit();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const defaultValues = useMemo<TokenizationFormValues>(() => {
    return {
      totalPropertyValue: formatNumberAmount(
        fromBaseUnits(property?.totalValue ?? 0) || 0,
      ),
      totalShares: "0",
      rentalIncomeHistory: "",
      expectedAnnualYield: "0",
      riskScore: String(
        Math.min(Math.max(Number(property?.riskScore ?? 0), 0), 1),
      ),
      ownerAddress: property?.ownerWalletAddress ?? "",
      image: property?.image ?? "",
    };
  }, [property]);

  const methods = useForm<TokenizationFormValues>({
    defaultValues,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (open) {
      methods.reset(defaultValues);
      setShowWalletConnectModal(false);
    }
  }, [defaultValues, methods, open]);

  useEffect(() => {
    if (isConnected) {
      setShowWalletConnectModal(false);
    }
  }, [isConnected]);

  const sharesRaw = methods.watch("totalShares");
  const totalPropertyValueRaw = methods.watch("totalPropertyValue");
  const totalValue =
    parseMoney(totalPropertyValueRaw) ?? property?.totalValue ?? 0;
  const sharesNum = Number(sharesRaw);
  const safeShares =
    Number.isFinite(sharesNum) && sharesNum > 0 ? sharesNum : 0;
  const pricePerShare = safeShares > 0 ? totalValue / safeShares : 0;

  const onSubmit: SubmitHandler<TokenizationFormValues> = async (values) => {
    if (!property) return;
    console.log("[TokenizationModal] Submit requested", {
      propertyId: property.id,
      organisationId,
      values,
      isConnected,
      hasWalletClient: Boolean(walletClient),
      hasPublicClient: Boolean(publicClient),
    });
    if (!isConnected) {
      console.warn(
        "[TokenizationModal] Wallet not connected. Showing connect modal.",
      );
      setShowWalletConnectModal(true);
      return;
    }
    if (!publicClient || !walletClient) {
      console.warn(
        "[TokenizationModal] Wallet/public client missing. Showing connect modal.",
      );
      setShowWalletConnectModal(true);
      return;
    }
    setIsSubmitting(true);
    setCurrentStep(TOKENIZATION_FLOW_STEPS.deployTrexSuite);
    try {
      const totalUnits = BigInt(values.totalShares);
      const totalValue = toBaseUnitsBigInt(
        values.totalPropertyValue.replace(/,/g, ""),
      );
      const ownerAddress = values.ownerAddress as `0x${string}`;
      const result = await runTokenizationFlow({
        walletClient,
        publicClient,
        onStepChange: setCurrentStep,
        input: {
          propertyId: property.id,
          propertyName: property.name,
          ownerAddress,
          ipfsUri: values.image,
          totalUnits,
          totalValue,
        },
      });

      console.log("[TokenizationModal] Tokenization flow result", result);
      toast.success(
        result?.apiMessages?.trexDeployed ||
          result?.apiMessages?.initiate ||
          t("TokenizationForm.Success.deployed"),
      );
      onClose();
      router.refresh();
    } catch (error) {
      console.error("[TokenizationModal] Tokenization contract flow failed", {
        error,
        propertyId: property.id,
        organisationId,
      });
      toast.error(
        getErrorMessage(error) || t("TokenizationForm.Success.failed"),
      );
    } finally {
      console.log("[TokenizationModal] Submit flow finished");
      setCurrentStep(undefined);
      setIsSubmitting(false);
    }
  };

  if (!property) return null;

  const loadingMessage = getLoadingMessage(currentStep, t);

  return (
    <div>
      {isSubmitting ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/55 backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-3 rounded-lg border border-bordergray200 bg-white px-5 py-4 text-center dark:border-darkbordercolor1 dark:bg-darkbgbase">
            <Loader2 className="h-6 w-6 animate-spin text-textprimary dark:text-sidebartext" />
            <p className="text-sm font-medium text-textprimary dark:text-sidebartext">
              {loadingMessage}
            </p>
          </div>
        </div>
      ) : null}

      <CustomModal
        isOpen={open}
        onClose={onClose}
        title={t("TokenizationForm.title")}
        size="3xl"
      >
        <div className="relative">
          <p className="text-sm text-textparagraph dark:text-textparagraphlight mb-6">
            {t("TokenizationForm.subtitle")}
          </p>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
              <div className="flex flex-wrap gap-x-4 justify-between">
                <InputField<TokenizationFormValues>
                  name="totalPropertyValue"
                  type="text"
                  label={t("TokenizationForm.totalPropertyValue")}
                  width="w-full md:w-[48%]"
                />

                <InputField<TokenizationFormValues>
                  name="totalShares"
                  type="number"
                  label={t("TokenizationForm.totalShares")}
                  placeholder={t("TokenizationForm.totalSharesPlaceholder")}
                  width="w-full md:w-[48%]"
                  min={1}
                  max={10000}
                  step={1}
                  interceptor={(val) => clampShares(val)}
                  inputMode="numeric"
                  onKeyDown={preventNegativeAndExponent}
                  validation={{
                    required: t("TokenizationForm.Errors.sharesRequired"),
                    validate: (val) => {
                      const n = Number(val);
                      if (!Number.isFinite(n)) {
                        return t("TokenizationForm.Errors.sharesRequired");
                      }
                      if (n <= 0) return t("TokenizationForm.Errors.sharesMin");
                      if (n > 10000)
                        return t("TokenizationForm.Errors.sharesMax");
                      if (!Number.isInteger(n))
                        return t("TokenizationForm.Errors.sharesInteger");
                      return true;
                    },
                  }}
                />
              </div>

              <div className="my-6 rounded-2xl bg-gray-100 p-6 text-textprimary border border-bordergray200 dark:bg-darkbgbase dark:text-sidebartext dark:border-darkbordercolor1">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 dark:bg-darkbgprimary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold">
                      {t("TokenizationForm.autoCalculated")}
                    </div>

                    <div className="mt-3 text-sm">
                      {t("TokenizationForm.pricePerShare")}
                    </div>
                    <div className="text-4xl font-bold leading-tight">
                      {formatUsdcAmount(pricePerShare)}
                    </div>
                    <div className="mt-1 text-xs text-textparagraph dark:text-textparagraphlight">
                      {t("TokenizationForm.calculatedAs", {
                        totalValue: formatUsdcAmount(totalValue),
                        shares: safeShares,
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 justify-between">
                <InputField<TokenizationFormValues>
                  name="rentalIncomeHistory"
                  type="text"
                  label={t("TokenizationForm.rentalIncomeHistory")}
                  placeholder={t("TokenizationForm.rentalIncomePlaceholder")}
                  width="w-full md:w-[48%]"
                  interceptor={(val) => decimalOnly(val)}
                  validation={{
                    validate: (val) => {
                      const n = parseMoney(val);
                      if (n === null) return true;
                      if (!Number.isFinite(n)) {
                        return t("TokenizationForm.Errors.rentalInvalid");
                      }
                      if (n < 0) return t("TokenizationForm.Errors.rentalMin");
                      if (n > totalValue) {
                        return t("TokenizationForm.Errors.rentalMax", {
                          max: formatUsdcAmount(totalValue),
                        });
                      }
                      return true;
                    },
                  }}
                />

                <InputField<TokenizationFormValues>
                  name="expectedAnnualYield"
                  type="number"
                  label={t("TokenizationForm.expectedAnnualYield")}
                  placeholder={t(
                    "TokenizationForm.expectedAnnualYieldPlaceholder",
                  )}
                  width="w-full md:w-[48%]"
                  min={0}
                  max={100}
                  step="0.01"
                  interceptor={(val) => clampPercent(val)}
                  inputMode="decimal"
                  onKeyDown={preventNegativeAndExponent}
                  validation={{
                    required: t("TokenizationForm.Errors.yieldRequired"),
                    validate: (val) => {
                      const n = Number(val);
                      if (!Number.isFinite(n)) {
                        return t("TokenizationForm.Errors.yieldRequired");
                      }
                      if (n < 0) return t("TokenizationForm.Errors.yieldMin");
                      if (n > 100) return t("TokenizationForm.Errors.yieldMax");
                      return true;
                    },
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-x-4 justify-between">
                <InputField<TokenizationFormValues>
                  name="riskScore"
                  type="number"
                  label={t("TokenizationForm.riskScore")}
                  placeholder={t("TokenizationForm.riskScorePlaceholder")}
                  width="w-full md:w-[48%]"
                  min={0}
                  max={1}
                  step="0.01"
                  interceptor={(val) => clampRiskScore(val)}
                  inputMode="decimal"
                  onKeyDown={preventNegativeAndExponent}
                  validation={{
                    required: t("TokenizationForm.Errors.riskRequired"),
                    validate: (val) => {
                      const n = Number(val);
                      if (!Number.isFinite(n)) {
                        return t("TokenizationForm.Errors.riskRequired");
                      }
                      if (n < 0) return t("TokenizationForm.Errors.riskMin");
                      if (n > 1) return t("TokenizationForm.Errors.riskMax");
                      return true;
                    },
                  }}
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="min-w-[110px]"
                >
                  {t("TokenizationForm.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="min-w-[140px]"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {t("TokenizationForm.submit")}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
        <CustomModal
          isOpen={showWalletConnectModal}
          onClose={() => setShowWalletConnectModal(false)}
          title={t("TokenizationForm.Wallet.title")}
          size="md"
        >
          <p className="text-sm text-textparagraph dark:text-textparagraphlight mb-6">
            {t("TokenizationForm.Wallet.description")}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowWalletConnectModal(false)}
              className="min-w-[110px]"
            >
              {t("TokenizationForm.cancel")}
            </Button>
            <Button
              type="button"
              onClick={() => void openWalletModal()}
              className="min-w-[140px]"
            >
              {t("TokenizationForm.Wallet.connect")}
            </Button>
          </div>
        </CustomModal>
      </CustomModal>
    </div>
  );
};
