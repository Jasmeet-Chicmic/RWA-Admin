"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import CustomModal from "@/components/molecules/CustomModal/CustomModal";
import { InputField } from "@/components/molecules/FormBuilder/fields/InputField";
import Button from "@/components/atoms/Button";

import { AdminProperty } from "../../helpers/types";
import { activateOrganisationPropertyAction } from "@/api/adminOrganisations";

type TokenizationFormValues = {
  ownerAddress: string;
  totalPropertyValue: string;
  totalShares: string;
  rentalIncomeHistory: string;
  expectedAnnualYield: string;
  riskScore: string;
  image: string;
};
//Test
const formatUsdcAmount = (value: number, maximumFractionDigits = 2) => {
  const normalizedValue = Number.isFinite(value) ? value : 0;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(normalizedValue);

  return `${formatted} USDC`;
};

const formatNumberAmount = (value: number, maximumFractionDigits = 2) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(Number.isFinite(value) ? value : 0);

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

  const defaultValues = useMemo<TokenizationFormValues>(() => {
    return {
      totalPropertyValue: formatNumberAmount(
        Number((property?.totalValue ?? 0) / Math.pow(10, 6)) || 0,
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
    }
  }, [defaultValues, methods, open]);

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
    setIsSubmitting(true);
    try {
      let totalPropertyValue: bigint = values.totalPropertyValue
        ? BigInt(parseMoney(values.totalPropertyValue) ?? 0)
        : BigInt(property.totalValue);
      totalPropertyValue = BigInt(totalPropertyValue) * BigInt(Math.pow(10, 6));
      const payload = {
        totalPropertyValue: Number(totalPropertyValue),
        totalUnits: Number(
          BigInt(values.totalShares) * BigInt(Math.pow(10, 6)),
        ),
        rentalIncome: parseMoney(values.rentalIncomeHistory) ?? 0,
        annualYieldPercent: Number(values.expectedAnnualYield),
        riskScore: Number(values.riskScore),
        ownerAddress: values.ownerAddress,
        image: values.image,
      };

      console.log(
        "property data from sent to api payload",
        payload,
        organisationId,
        property.id,
      );
      try {
        await activateOrganisationPropertyAction({
          organisationId,
          propertyId: property.id,
          payload,
        });
      } catch (error) {
        console.error("Error activating organisation property:", error);
      }

      // If backend follows ResponseType structure, `status` indicates success

      onClose();
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!property) return null;

  return (
    <CustomModal
      isOpen={open}
      onClose={onClose}
      title={t("TokenizationForm.title")}
      size="3xl"
    >
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
                  if (n > 10000) return t("TokenizationForm.Errors.sharesMax");
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
              placeholder={t("TokenizationForm.expectedAnnualYieldPlaceholder")}
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
    </CustomModal>
  );
};
