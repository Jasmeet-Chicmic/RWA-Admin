"use client";

import { useAppKit } from "@reown/appkit/react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { usePublicClient, useWalletClient } from "wagmi";

import Button from "@/components/atoms/Button";
import CustomModal from "@/components/molecules/CustomModal/CustomModal";
import { InputField } from "@/components/molecules/FormBuilder/fields/InputField";

import { useWalletState } from "@/components/providers/WalletStateProvider";
import {
  runTokenizationFlow,
  TOKENIZATION_FLOW_STEPS,
  type TokenizationFlowStep,
} from "@/lib/contracts/runTokenizationFlow";
import { fetchJobStatus } from "@/lib/contracts/tokenization/statusCheck";
import {
  PROPERTY_REGISTRATION_JOB_STATUS,
  type JobStatusData,
} from "@/lib/contracts/tokenization/types";
import {
  DEFAULT_TOKEN_DECIMALS,
  DISPLAY_CURRENCY,
  formatToFixed,
  fromBaseUnits,
  toBaseUnitsBigInt,
} from "@/shared/utils/unitUtils";
import { handleWeb3Error } from "@/shared/utils/web3Error";
import { AdminProperty, PropertyItem } from "@/types/properties";

import { TokenizationModalSkeleton } from "./TokenizationModalSkeleton";

type TokenizationFormValues = {
  ownerAddress: string;
  totalPropertyValue: string;
  totalShares: string;
  riskScore: string;
  image: string;
};

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

/** Strips non-digits; does not cap — max is enforced via validation + error message. */
const sanitizeShareIntegerInput = (val: string) => {
  const digits = val.replace(/[^\d]/g, "");
  if (!digits) return "";
  const n = Number(digits);
  if (!Number.isFinite(n)) return "";
  return String(n);
};

const preventNegativeAndExponent: React.KeyboardEventHandler<
  HTMLInputElement
> = (e) => {
  if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
    e.preventDefault();
  }
};

type PropertyData = PropertyItem | AdminProperty;
const TOKEN_BASE_MULTIPLIER = 10 ** DEFAULT_TOKEN_DECIMALS;

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const normalizeBase6ToDisplay = (value: number) => fromBaseUnits(value);

const normalizeSharesForDisplay = (value: number): number => {
  if (value >= TOKEN_BASE_MULTIPLIER && value % TOKEN_BASE_MULTIPLIER === 0) {
    return value / TOKEN_BASE_MULTIPLIER;
  }
  return value;
};

const pickFirstFiniteNumber = (...candidates: unknown[]): number | null => {
  for (const candidate of candidates) {
    const parsed = toFiniteNumber(candidate);
    if (parsed !== null) return parsed;
  }
  return null;
};

const DEFAULT_RISK_SCORE = "5";

const pickRiskScoreForForm = (...candidates: unknown[]): string | null => {
  const n = pickFirstFiniteNumber(...candidates);
  if (n === null) return null;
  const rounded = Math.round(n);
  if (rounded >= 1 && rounded <= 10) return String(rounded);
  return null;
};

const getStatusPrefillValues = (
  status: JobStatusData | null,
  fallback: TokenizationFormValues,
): TokenizationFormValues => {
  if (!status) return fallback;

  const topLevel = status as unknown as Record<string, unknown>;
  const requestPayload =
    status.requestPayload && typeof status.requestPayload === "object"
      ? status.requestPayload
      : {};

  // Status API mirrors initiate payload format:
  // - mintAmount / initiateMintAmount: base-6 token units
  // - pricePerShare / initiatePricePerShare: base-6 currency units
  const mintAmountBase = pickFirstFiniteNumber(
    requestPayload.mintAmount,
    requestPayload.initiateMintAmount,
    status.mintAmount,
    topLevel.mintAmount,
  );
  const mintAmountScaledToShares =
    mintAmountBase !== null ? normalizeSharesForDisplay(mintAmountBase) : null;
  const sharesCandidate = pickFirstFiniteNumber(
    requestPayload.totalShares,
    status.totalShares,
    topLevel.totalShares,
    // Fallback derivation from base-6 mint amount.
    mintAmountScaledToShares,
    mintAmountBase,
  );
  const sharesValue =
    sharesCandidate !== null
      ? normalizeSharesForDisplay(sharesCandidate)
      : null;
  const normalizedShares =
    sharesValue !== null && sharesValue > 0
      ? String(Math.trunc(sharesValue))
      : fallback.totalShares;

  const totalPropertyValueBase = pickFirstFiniteNumber(
    requestPayload.totalPropertyValue,
    requestPayload.totalValue,
    status.totalPropertyValue,
    topLevel.totalPropertyValue,
  );
  const pricePerShareBase = pickFirstFiniteNumber(
    requestPayload.pricePerShare,
    requestPayload.initiatePricePerShare,
    status.pricePerShare,
    topLevel.pricePerShare,
  );
  const resolvedTotalPropertyValue =
    totalPropertyValueBase !== null
      ? normalizeBase6ToDisplay(totalPropertyValueBase)
      : pricePerShareBase !== null && sharesValue !== null
        ? normalizeBase6ToDisplay(pricePerShareBase) * sharesValue
        : null;

  const ownerAddress =
    (status.ownerAddress ||
      (topLevel.ownerAddress as string | undefined) ||
      (requestPayload.ownerAddress as string | undefined)) ??
    fallback.ownerAddress;

  const riskScoreFromStatus = pickRiskScoreForForm(
    requestPayload.riskScore,
    status.riskScore,
    topLevel.riskScore,
  );

  return {
    ...fallback,
    totalShares: normalizedShares,
    totalPropertyValue:
      resolvedTotalPropertyValue !== null
        ? formatNumberAmount(resolvedTotalPropertyValue)
        : fallback.totalPropertyValue,
    ownerAddress,
    riskScore: riskScoreFromStatus ?? fallback.riskScore,
  };
};

const isStatusResumeLocked = (status: JobStatusData | null): boolean => {
  if (!status) return false;
  return (
    status.status >= PROPERTY_REGISTRATION_JOB_STATUS.PENDING_TREX &&
    status.status < PROPERTY_REGISTRATION_JOB_STATUS.COMPLETED
  );
};

export const TokenizationModal = ({
  open,
  onClose,
  onSuccess,
  property,
  organisationId,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  property: PropertyData | null;
  organisationId: string;
}) => {
  const t = useTranslations("properties");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<TokenizationFlowStep>();
  const [isFlowCompleted, setIsFlowCompleted] = useState(false);
  const [isResumeLocked, setIsResumeLocked] = useState(false);
  const [isJobStatusLoading, setIsJobStatusLoading] = useState(false);
  const [showWalletConnectModal, setShowWalletConnectModal] = useState(false);
  const { isConnected } = useWalletState();
  const { open: openWalletModal } = useAppKit();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const defaultValues = useMemo<TokenizationFormValues>(() => {
    const totalVal =
      (property as PropertyItem)?.approvedValuation ??
      (property as AdminProperty)?.totalValue ??
      0;
    const ownerAddr =
      (property as PropertyItem)?.owner?.walletAddress ??
      (property as AdminProperty)?.ownerWalletAddress ??
      "";
    const img =
      (property as AdminProperty)?.image ??
      (property as AdminProperty)?.imageUrl ??
      "";

    return {
      totalPropertyValue: formatNumberAmount(fromBaseUnits(totalVal) || 0),
      totalShares: "0",
      riskScore: DEFAULT_RISK_SCORE,
      ownerAddress: ownerAddr,
      image: img,
    };
  }, [property]);

  const methods = useForm<TokenizationFormValues>({
    defaultValues,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (!open || !property) return;

    let isCancelled = false;
    const initializeForm = async () => {
      setIsJobStatusLoading(true);
      methods.reset(defaultValues);
      setShowWalletConnectModal(false);
      setIsFlowCompleted(false);
      setIsResumeLocked(false);

      try {
        const status = await fetchJobStatus(property.id);
        if (isCancelled) return;
        const prefillValues = getStatusPrefillValues(status, defaultValues);
        methods.reset(prefillValues);
        setIsResumeLocked(isStatusResumeLocked(status));
      } finally {
        if (!isCancelled) {
          setIsJobStatusLoading(false);
        }
      }
    };

    void initializeForm();

    return () => {
      isCancelled = true;
      setIsJobStatusLoading(false);
    };
  }, [defaultValues, methods, open, property]);

  useEffect(() => {
    if (isConnected) {
      setShowWalletConnectModal(false);
    }
  }, [isConnected]);

  const sharesRaw = methods.watch("totalShares");
  const totalPropertyValueRaw = methods.watch("totalPropertyValue");

  const currentPropertyValuation = useMemo(() => {
    if (!property) return 0;
    return fromBaseUnits(
      (property as PropertyItem).approvedValuation ??
        (property as AdminProperty).totalValue ??
        0,
    );
  }, [property]);

  const totalValue =
    parseMoney(totalPropertyValueRaw) ?? currentPropertyValuation;
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
      const submittedShares = Number(values.totalShares);
      const safeSubmittedShares =
        Number.isFinite(submittedShares) && submittedShares > 0
          ? submittedShares
          : 0;
      const initiateMintAmount = safeSubmittedShares * TOKEN_BASE_MULTIPLIER;
      const initiatePricePerShare = Number(
        totalUnits > BigInt(0) ? totalValue / totalUnits : BigInt(0),
      );
      const ownerAddress = values.ownerAddress as `0x${string}`;
      const riskScoreNum = Number(values.riskScore);
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
          initiateMintAmount,
          initiatePricePerShare,
          riskScore: riskScoreNum,
        },
      });

      console.log("[TokenizationModal] Tokenization flow result", result);
      toast.success(
        result?.apiMessages?.trexDeployed ||
          result?.apiMessages?.initiate ||
          t("tokenizationForm.success.deployed"),
      );
      setIsFlowCompleted(true);
      await new Promise((resolve) => setTimeout(resolve, 900));
      onSuccess?.();
      onClose();
      router.refresh();
    } catch (error) {
      console.error("[TokenizationModal] Tokenization contract flow failed", {
        error,
        propertyId: property.id,
        organisationId,
      });
      // Keep full error in logs, but show normalized user-friendly message in UI.
      const uiMessage = handleWeb3Error(error);
      toast.error(uiMessage || t("tokenizationForm.success.failed"));
    } finally {
      console.log("[TokenizationModal] Submit flow finished");
      setCurrentStep(undefined);
      setIsSubmitting(false);
    }
  };

  if (!property) return null;

  const progressSteps: TokenizationFlowStep[] = [
    TOKENIZATION_FLOW_STEPS.deployTrexSuite,
    TOKENIZATION_FLOW_STEPS.deployVault,
    TOKENIZATION_FLOW_STEPS.registerProperty,
  ];
  const activeStepIndex = currentStep ? progressSteps.indexOf(currentStep) : -1;

  return (
    <div>
      <CustomModal
        isOpen={open}
        onClose={onClose}
        title={t("tokenizationForm.title")}
        size="3xl"
      >
        <div className="relative">
          <p className="text-sm text-textparagraph dark:text-textparagraphlight mb-6">
            {t("tokenizationForm.subtitle")}
          </p>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
              {isJobStatusLoading ? (
                <TokenizationModalSkeleton />
              ) : (
                <>
                  <div className="flex flex-wrap gap-x-3 justify-between">
                    <InputField<TokenizationFormValues>
                      name="totalPropertyValue"
                      type="text"
                      label={t("tokenizationForm.totalPropertyValue")}
                      width="w-full md:w-[48%] !mb-0"
                      disabled={isSubmitting || isResumeLocked}
                    />

                    <InputField<TokenizationFormValues>
                      name="totalShares"
                      type="number"
                      label={t("tokenizationForm.totalShares")}
                      placeholder={t("tokenizationForm.totalSharesPlaceholder")}
                      width="w-full md:w-[48%] !mb-0"
                      step={1}
                      interceptor={(val) => sanitizeShareIntegerInput(val)}
                      inputMode="numeric"
                      onKeyDown={preventNegativeAndExponent}
                      disabled={isSubmitting || isResumeLocked}
                      validation={{
                        required: t("tokenizationForm.errors.sharesRequired"),
                        validate: (val) => {
                          const n = Number(val);
                          if (!Number.isFinite(n)) {
                            return t("tokenizationForm.errors.sharesRequired");
                          }
                          if (n <= 0)
                            return t("tokenizationForm.errors.sharesMin");
                          if (n > 10000)
                            return t("tokenizationForm.errors.sharesMax");
                          if (!Number.isInteger(n))
                            return t("tokenizationForm.errors.sharesInteger");
                          return true;
                        },
                      }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-x-3 justify-between mt-3">
                    <InputField<TokenizationFormValues>
                      name="riskScore"
                      type="number"
                      label={t("tokenizationForm.riskScore")}
                      placeholder={t("tokenizationForm.riskScorePlaceholder")}
                      width="w-full md:w-[48%] !mb-0"
                      min={1}
                      max={10}
                      step={1}
                      inputMode="numeric"
                      onKeyDown={preventNegativeAndExponent}
                      disabled={isSubmitting || isResumeLocked}
                      validation={{
                        required: t("tokenizationForm.errors.riskRequired"),
                        validate: (val) => {
                          const n = Number(val);
                          if (!Number.isFinite(n)) {
                            return t("tokenizationForm.errors.riskRequired");
                          }
                          if (!Number.isInteger(n)) {
                            return t("tokenizationForm.errors.riskInteger");
                          }
                          if (n < 1) {
                            return t("tokenizationForm.errors.riskMin");
                          }
                          if (n > 10) {
                            return t("tokenizationForm.errors.riskMax");
                          }
                          return true;
                        },
                      }}
                    />
                  </div>

                  <div className="my-4 rounded-2xl bg-gray-100 p-6 text-textprimary border border-bordergray200 dark:bg-darkbgbase dark:text-sidebartext dark:border-darkbordercolor1">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 dark:bg-darkbgprimary">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold">
                          {t("tokenizationForm.autoCalculated")}
                        </div>

                        <div className="mt-1 text-sm">
                          {t("tokenizationForm.pricePerShare")}
                        </div>
                        <div className="text-4xl font-bold leading-tight mt-2">
                          {formatUsdcAmount(pricePerShare)}
                        </div>
                        <div className="mt-1 text-xs text-textparagraph dark:text-textparagraphlight">
                          {t("tokenizationForm.calculatedAs", {
                            totalValue: formatUsdcAmount(totalValue),
                            shares: safeShares,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-6 flex flex-col gap-4 md:items-end md:justify-between">
                <div className="min-h-[76px] flex-1 w-full">
                  {isSubmitting || isFlowCompleted ? (
                    <div className="rounded-xl border border-bordergray200 p-3 dark:border-darkbordercolor1">
                      <p className="text-xs font-semibold text-textparagraph dark:text-textparagraphlight mb-2">
                        {t("tokenizationForm.progress.title")}
                      </p>
                      <div className="space-y-2">
                        {progressSteps.map((step, index) => {
                          const isCompleted =
                            isFlowCompleted || index < activeStepIndex;
                          const isActive =
                            !isFlowCompleted &&
                            isSubmitting &&
                            activeStepIndex === index;
                          return (
                            <div
                              key={step}
                              className="flex items-center justify-between gap-3"
                            >
                              <span className="text-xs font-medium text-textprimary dark:text-sidebartext">
                                {t(`tokenizationForm.progress.${step}`)}
                              </span>
                              {isCompleted ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                                  <CheckCircle2 className="h-4 w-4" />
                                  {t("tokenizationForm.progress.done")}
                                </span>
                              ) : isActive ? (
                                <span className="inline-flex items-center gap-1 text-primarycolor text-xs font-semibold">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  {t("tokenizationForm.progress.inProgress")}
                                </span>
                              ) : (
                                <span className="text-xs text-textparagraph dark:text-textparagraphlight">
                                  -
                                </span>
                              )}
                            </div>
                          );
                        })}
                        {isFlowCompleted ? (
                          <p className="pt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {t("tokenizationForm.progress.completedAll")}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="min-w-[110px]"
                    disabled={isSubmitting}
                  >
                    {t("tokenizationForm.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    className="min-w-[140px]"
                    isLoading={isSubmitting}
                    disabled={isSubmitting || isJobStatusLoading}
                  >
                    {t("tokenizationForm.submit")}
                  </Button>
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
        <CustomModal
          isOpen={showWalletConnectModal}
          onClose={() => setShowWalletConnectModal(false)}
          title={t("tokenizationForm.wallet.title")}
          size="md"
        >
          <p className="text-sm text-textparagraph dark:text-textparagraphlight mb-6">
            {t("tokenizationForm.wallet.description")}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowWalletConnectModal(false)}
              className="min-w-[110px]"
            >
              {t("tokenizationForm.cancel")}
            </Button>
            <Button
              type="button"
              onClick={() => void openWalletModal()}
              className="min-w-[140px]"
            >
              {t("tokenizationForm.wallet.connect")}
            </Button>
          </div>
        </CustomModal>
      </CustomModal>
    </div>
  );
};
