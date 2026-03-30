"use client";

import { useAppKit } from "@reown/appkit/react";
import { Loader2, Sparkles } from "lucide-react";
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
import {
  DISPLAY_CURRENCY,
  formatToFixed,
  fromBaseUnits,
  toBaseUnitsBigInt,
} from "@/shared/utils/unitUtils";
import { handleWeb3Error } from "@/shared/utils/web3Error";
import { PropertyItem } from "../../helpers/allPropertiesTypes";
import { AdminProperty } from "../../helpers/types";

type TokenizationFormValues = {
  ownerAddress: string;
  totalPropertyValue: string;
  totalShares: string;
  image: string;
};

const getLoadingMessage = (
  step: TokenizationFlowStep | undefined,
  t: ReturnType<typeof useTranslations>,
) => {
  const progressMessages: Record<TokenizationFlowStep, string> = {
    deployTrexSuite: t("tokenizationForm.progress.deployTrexSuite"),
    deployVault: t("tokenizationForm.progress.deployVault"),
    registerProperty: t("tokenizationForm.progress.registerProperty"),
  };

  return step ? progressMessages[step] : progressMessages.deployTrexSuite;
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

const preventNegativeAndExponent: React.KeyboardEventHandler<
  HTMLInputElement
> = (e) => {
  if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
    e.preventDefault();
  }
};

type PropertyData = PropertyItem | AdminProperty;

export const TokenizationModal = ({
  open,
  onClose,
  property,
  organisationId,
}: {
  open: boolean;
  onClose: () => void;
  property: PropertyData | null;
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
    const totalVal =
      (property as PropertyItem)?.approvedValuation ??
      (property as AdminProperty)?.totalValue ??
      0;
    const ownerAddr = (property as AdminProperty)?.ownerWalletAddress ?? "";
    const img =
      (property as AdminProperty)?.image ??
      (property as AdminProperty)?.imageUrl ??
      "";

    return {
      totalPropertyValue: formatNumberAmount(fromBaseUnits(totalVal) || 0),
      totalShares: "0",
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

  const currentPropertyValuation = useMemo(() => {
    if (!property) return 0;
    return (
      (property as PropertyItem).approvedValuation ??
      (property as AdminProperty).totalValue ??
      0
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
      const initiateMintAmount = parseMoney(values.totalPropertyValue) ?? 0;
      const initiatePricePerShare = Number(values.totalShares);
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
          initiateMintAmount,
          initiatePricePerShare,
        },
      });

      console.log("[TokenizationModal] Tokenization flow result", result);
      toast.success(
        result?.apiMessages?.trexDeployed ||
          result?.apiMessages?.initiate ||
          t("tokenizationForm.success.deployed"),
      );
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
        title={t("tokenizationForm.title")}
        size="3xl"
      >
        <div className="relative">
          <p className="text-sm text-textparagraph dark:text-textparagraphlight mb-6">
            {t("tokenizationForm.subtitle")}
          </p>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
              <div className="flex flex-wrap gap-x-4 justify-between">
                <InputField<TokenizationFormValues>
                  name="totalPropertyValue"
                  type="text"
                  label={t("tokenizationForm.totalPropertyValue")}
                  width="w-full md:w-[48%]"
                />

                <InputField<TokenizationFormValues>
                  name="totalShares"
                  type="number"
                  label={t("tokenizationForm.totalShares")}
                  placeholder={t("tokenizationForm.totalSharesPlaceholder")}
                  width="w-full md:w-[48%]"
                  min={1}
                  max={10000}
                  step={1}
                  interceptor={(val) => clampShares(val)}
                  inputMode="numeric"
                  onKeyDown={preventNegativeAndExponent}
                  validation={{
                    required: t("tokenizationForm.errors.sharesRequired"),
                    validate: (val) => {
                      const n = Number(val);
                      if (!Number.isFinite(n)) {
                        return t("tokenizationForm.errors.sharesRequired");
                      }
                      if (n <= 0) return t("tokenizationForm.errors.sharesMin");
                      if (n > 10000)
                        return t("tokenizationForm.errors.sharesMax");
                      if (!Number.isInteger(n))
                        return t("tokenizationForm.errors.sharesInteger");
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
                      {t("tokenizationForm.autoCalculated")}
                    </div>

                    <div className="mt-3 text-sm">
                      {t("tokenizationForm.pricePerShare")}
                    </div>
                    <div className="text-4xl font-bold leading-tight">
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

              <div className="mt-6 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="min-w-[110px]"
                >
                  {t("tokenizationForm.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="min-w-[140px]"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {t("tokenizationForm.submit")}
                </Button>
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
