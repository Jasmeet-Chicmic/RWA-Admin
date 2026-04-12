"use client";

import { Building2, CalendarDays, Coins, Percent, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { RentalIncomeModal } from "@/app/(secured)/properties/organisations/[organisationId]/RentalIncomeModal";
import Breadcrumbs, { BreadcrumbItem } from "@/components/atoms/Breadcrumbs";
import Button from "@/components/atoms/Button";
import ConfirmationModal from "@/components/molecules/ConfirmationModal/ConfirmationModal";
import CopyToClipboardPill from "@/components/atoms/CopyToClipboardPill/CopyToClipboardPill";
import ErrorState from "@/components/atoms/ErrorState";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { TableColumn } from "@/components/atoms/Table";
import { propertiesService } from "@/services/properties-service";
import { rentalIncomeService } from "@/services/rental-income-service";
import { LOGIN_ROLE } from "@/shared/constants";
import { PRIVATE_ROUTES } from "@/shared/routes";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import { walletTruncate } from "@/shared/utils";
import {
  DEFAULT_TOKEN_DECIMALS,
  formatDisplayCurrency,
  fromBaseUnits,
} from "@/shared/utils/unitUtils";
import { InvestorUser } from "@/types/properties";
import {
  RentalIncomeDetailData,
  RentalIncomeDistributionItem,
} from "@/types/rental-income";
import { useAppSelector } from "@/store/hooks";

import { RENTAL_INCOME_STATUS } from "../RentManagementTable";

const statusLabelKey = (status: number) => {
  if (status === RENTAL_INCOME_STATUS.SUBMITTED) {
    return "rentManagement.statusSubmitted";
  }
  if (status === RENTAL_INCOME_STATUS.DISTRIBUTED) {
    return "rentManagement.statusDistributed";
  }
  return "status";
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
};

const toBigIntSafe = (value: number | string | bigint | null | undefined) => {
  if (value === null || value === undefined) return BigInt(0);
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(Math.trunc(value));
  const trimmed = value.trim();
  if (!trimmed) return BigInt(0);
  return BigInt(trimmed);
};

type DistributionPreviewRow = {
  id: string;
  walletAddress: string;
  sharesHeldRaw: number | string | bigint;
  userShareRaw: number | string | bigint;
};

const RentalIncomeDetailsContent = ({
  rentalIncomeId,
}: {
  rentalIncomeId: string;
}) => {
  const t = useTranslations("properties");
  const common = useTranslations("common");
  const router = useRouter();
  const { role } = useAppSelector((state) => state.authProfile);
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<RentalIncomeDetailData | null>(null);
  const [investors, setInvestors] = useState<InvestorUser[]>([]);
  const [investorsTotalCount, setInvestorsTotalCount] = useState(0);
  const [distributionItems, setDistributionItems] = useState<
    RentalIncomeDistributionItem[]
  >([]);
  const [distributionTotalCount, setDistributionTotalCount] = useState(0);
  const [investorsLoading, setInvestorsLoading] = useState(false);
  const [distributeModalOpen, setDistributeModalOpen] = useState(false);
  const [distributing, setDistributing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await rentalIncomeService.getRentalIncomeDetail({
        rentalIncomeId,
      });
      if (!res?.data) {
        setError(t("rentManagement.detailFetchError"));
        setItem(null);
        return;
      }
      setItem(res.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(message || t("rentManagement.detailFetchError"));
    } finally {
      setIsLoading(false);
    }
  }, [rentalIncomeId, t]);

  useEffect(() => {
    let active = true;
    void (async () => {
      if (!active) return;
      await fetchDetails();
    })();
    return () => {
      active = false;
    };
  }, [fetchDetails]);

  const isDistributedRecord = item?.status === RENTAL_INCOME_STATUS.DISTRIBUTED;

  const distributionPreviewRows: DistributionPreviewRow[] = useMemo(() => {
    if (isDistributedRecord) {
      return distributionItems.map((distribution) => ({
        id: distribution.id,
        walletAddress: distribution.user?.walletAddress ?? "",
        sharesHeldRaw: distribution.sharesHeld ?? 0,
        userShareRaw: distribution.userShare ?? 0,
      }));
    }

    return investors.map((investor) => {
      const distributableIncomeRaw = toBigIntSafe(
        item?.distributableIncome ?? 0,
      );
      const mintAmountRaw = toBigIntSafe(item?.mintAmount ?? 0);
      const sharesHeldRaw = toBigIntSafe(
        investor.sharesHeld ?? investor.sharesBought ?? 0,
      );
      const userShareRaw =
        mintAmountRaw > BigInt(0)
          ? (distributableIncomeRaw * sharesHeldRaw) / mintAmountRaw
          : BigInt(0);
      return {
        id: investor.id,
        walletAddress: investor.walletAddress,
        sharesHeldRaw,
        userShareRaw,
      };
    });
  }, [distributionItems, investors, isDistributedRecord, item]);

  const investorTableConfig: DataTableConfig<DistributionPreviewRow> =
    useMemo(() => {
      const columns: TableColumn<DistributionPreviewRow>[] = [
        {
          title: t("walletAddress"),
          field: "walletAddress",
          render: (row) => (
            <CopyToClipboardPill
              value={row.walletAddress}
              displayValue={walletTruncate(row.walletAddress)}
              title={t("walletAddress")}
              className="max-w-[180px]"
              onCopied={() => toast.success(common("copiedToClipboard"))}
            />
          ),
        },
        {
          title: t("sharesBought"),
          field: "sharesHeldRaw",
          align: "center",
          render: (row) => {
            const sharesRaw = toBigIntSafe(row.sharesHeldRaw);
            const sharesDisplay = Number(
              fromBaseUnits(sharesRaw, DEFAULT_TOKEN_DECIMALS),
            );
            return (
              <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
                {sharesDisplay.toLocaleString()}
              </span>
            );
          },
        },
        {
          title: t("rentManagement.userShare"),
          field: "",
          align: "right",
          render: (row) => {
            const userShareRaw = toBigIntSafe(row.userShareRaw);
            return (
              <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY} font-medium`}>
                {formatDisplayCurrency(fromBaseUnits(userShareRaw), {
                  maximumFractionDigits: 10,
                })}
              </span>
            );
          },
        },
      ];

      return {
        columns,
        keyExtractor: (row) => row.id,
        paginationTitle: t("investors").toLowerCase(),
        hideSelectCol: true,
        emptyMessage: t("noInvestorsFound"),
        searchPlaceholder: t("rentManagement.searchInvestorsPlaceholder"),
        header: (
          <div className="bg-bgwhite dark:bg-darkbgprimary">
            <div className="flex items-end justify-between gap-4">
              <div className="shrink-0">
                <h2
                  className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
                >
                  {t("rentManagement.investorDistributionTitle")}
                </h2>
                <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                  {t("rentManagement.investorDistributionSubtitle")}
                </p>
              </div>
            </div>
          </div>
        ),
      };
    }, [common, t]);

  const investorFetchParams = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    const skipRaw = params.get("skip");
    const limitRaw = params.get("limit");
    const searchText = (params.get("searchText") ?? "").trim();
    const pageSize = limitRaw ? Number(limitRaw) : 10;
    const safePageSize =
      Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10;
    const skip = skipRaw ? Number(skipRaw) : 0;
    const page = Math.floor(skip / safePageSize) + 1;
    return {
      page,
      pageSize: safePageSize,
      search: searchText,
    };
  }, [searchParams]);

  useEffect(() => {
    if (!item) return;
    setInvestorsLoading(true);

    const loadDistributionPreview = async () => {
      try {
        if (item.status === RENTAL_INCOME_STATUS.DISTRIBUTED) {
          const res = await rentalIncomeService.getRentalIncomeDistributions({
            rentalIncomeId: item.id,
            page: investorFetchParams.page,
            pageSize: investorFetchParams.pageSize,
            ...(investorFetchParams.search
              ? { search: investorFetchParams.search }
              : {}),
          });
          if (!res?.data) {
            setDistributionItems([]);
            setDistributionTotalCount(0);
            return;
          }
          setDistributionItems(res.data.items ?? []);
          setDistributionTotalCount(res.data.total ?? 0);
          setInvestors([]);
          setInvestorsTotalCount(0);
          return;
        }

        const res = await propertiesService.getInvestorUsers({
          propertyId: item.property?.id ?? "",
          page: investorFetchParams.page,
          pageSize: investorFetchParams.pageSize,
          ...(investorFetchParams.search
            ? { search: investorFetchParams.search }
            : {}),
        });
        if (!res?.data) {
          setInvestors([]);
          setInvestorsTotalCount(0);
          setDistributionItems([]);
          setDistributionTotalCount(0);
          return;
        }
        setInvestors(res.data.items ?? []);
        setInvestorsTotalCount(res.data.totalCount ?? 0);
        setDistributionItems([]);
        setDistributionTotalCount(0);
      } catch {
        setInvestors([]);
        setInvestorsTotalCount(0);
        setDistributionItems([]);
        setDistributionTotalCount(0);
      } finally {
        setInvestorsLoading(false);
      }
    };

    void loadDistributionPreview();
  }, [investorFetchParams, item]);

  const breadcrumbItems: BreadcrumbItem[] = useMemo(
    () => [
      {
        label: t("rentManagement.title"),
        href: PRIVATE_ROUTES.RENT_MANAGEMENT,
      },
      { label: t("rentManagement.detailsTitle") },
    ],
    [t],
  );

  if (isLoading) {
    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <div className="rounded-[16px] border border-bordercolor1 dark:border-darkbordercolor1 bg-bgwhite dark:bg-darkbgprimary p-6 animate-pulse">
          <div className="h-5 w-52 bg-gray-200 dark:bg-labelprimary/60 rounded mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`rental-detail-skeleton-${i}`}
                className="h-20 rounded-lg bg-gray-100 dark:bg-labelprimary/40"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return <ErrorState title={t("rentManagement.detailsTitle")} />;
  }

  const amountReceived = formatDisplayCurrency(
    fromBaseUnits(item.amountReceived),
  );
  const maintenanceCharges = formatDisplayCurrency(
    fromBaseUnits(item.maintenanceCharges),
  );
  const otherCharges = formatDisplayCurrency(fromBaseUnits(item.otherCharges));
  const distributableIncome = formatDisplayCurrency(
    fromBaseUnits(item.distributableIncome),
  );
  const netIncome = formatDisplayCurrency(fromBaseUnits(item.netIncome));
  const mintAmount = fromBaseUnits(item.mintAmount);
  const statusLabel = t(statusLabelKey(item.status));
  const canManageRecord = item.status === RENTAL_INCOME_STATUS.SUBMITTED;
  const isReadOnlyAdmin = role === LOGIN_ROLE.ADMIN;

  return (
    <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
      <div className="flex flex-col gap-6">
        <Breadcrumbs
          id={`rental-income-details-breadcrumbs-${item.id}`}
          items={breadcrumbItems}
          ariaLabel={t("rentManagement.detailsTitle")}
        />

        <div className="rounded-[16px] border border-bordercolor1 dark:border-darkbordercolor1 bg-bgwhite dark:bg-darkbgprimary p-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-[1.25rem] lg:text-[1.5rem] font-bold text-textprimary dark:text-white">
                {t("rentManagement.detailsTitle")}
              </h1>
              <p className="mt-1 text-sm text-textparagraph dark:text-textparagraphlight">
                {t("rentManagement.detailsSubtitle")}
              </p>
            </div>
            {!isReadOnlyAdmin && (
              <div className="flex items-center gap-2">
                {item.status === RENTAL_INCOME_STATUS.SUBMITTED ? (
                  <Button
                    type="button"
                    onClick={() => setDistributeModalOpen(true)}
                    disabled={distributing || deleting}
                  >
                    {t("distribute")}
                  </Button>
                ) : (
                  <Button type="button" disabled>
                    {t("distributed")}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditModalOpen(true)}
                  disabled={!canManageRecord || deleting || distributing}
                >
                  {common("edit")}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  className="disabled:bg-red-600 disabled:hover:bg-red-600"
                  onClick={() => setDeleteModalOpen(true)}
                  disabled={!canManageRecord || deleting || distributing}
                >
                  {t("delete")}
                </Button>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="rounded-xl border border-bordercolor1 dark:border-darkbordercolor1 p-4">
              <p className="text-xs text-textparagraph dark:text-textparagraphlight">
                {t("rentManagement.propertyName")}
              </p>
              <p className="mt-1 font-semibold text-textprimary dark:text-white inline-flex items-center gap-2">
                <Building2 size={15} />
                {item.property?.name || "—"}
              </p>
            </div>
            <div className="rounded-xl border border-bordercolor1 dark:border-darkbordercolor1 p-4">
              <p className="text-xs text-textparagraph dark:text-textparagraphlight">
                {t("rentManagement.status")}
              </p>
              <p className="mt-1 font-semibold text-textprimary dark:text-white">
                {statusLabel}
              </p>
            </div>
            <div className="rounded-xl border border-bordercolor1 dark:border-darkbordercolor1 p-4">
              <p className="text-xs text-textparagraph dark:text-textparagraphlight">
                {t("rentManagement.investorUsers")}
              </p>
              <p className="mt-1 font-semibold text-textprimary dark:text-white inline-flex items-center gap-2">
                <Users size={15} />
                {investorsTotalCount}
              </p>
            </div>

            <div className="rounded-xl border border-bordercolor1 dark:border-darkbordercolor1 p-4">
              <p className="text-xs text-textparagraph dark:text-textparagraphlight">
                {t("rentManagement.amountReceived")}
              </p>
              <p className="mt-1 font-semibold text-textprimary dark:text-white inline-flex items-center gap-2">
                <Coins size={15} />
                {amountReceived}
              </p>
            </div>
            <div className="rounded-xl border border-bordercolor1 dark:border-darkbordercolor1 p-4">
              <p className="text-xs text-textparagraph dark:text-textparagraphlight">
                {t("rentalIncome.form.maintenanceCharges")}
              </p>
              <p className="mt-1 font-semibold text-textprimary dark:text-white">
                {maintenanceCharges}
              </p>
            </div>
            <div className="rounded-xl border border-bordercolor1 dark:border-darkbordercolor1 p-4">
              <p className="text-xs text-textparagraph dark:text-textparagraphlight">
                {t("rentalIncome.form.otherCharges")}
              </p>
              <p className="mt-1 font-semibold text-textprimary dark:text-white">
                {otherCharges}
              </p>
            </div>

            <div className="rounded-xl border border-bordercolor1 dark:border-darkbordercolor1 p-4">
              <p className="text-xs text-textparagraph dark:text-textparagraphlight">
                {t("rentManagement.netIncome")}
              </p>
              <p className="mt-1 font-semibold text-textprimary dark:text-white">
                {netIncome}
              </p>
            </div>
            <div className="rounded-xl border border-bordercolor1 dark:border-darkbordercolor1 p-4">
              <p className="text-xs text-textparagraph dark:text-textparagraphlight">
                {t("rentManagement.distributableIncome")}
              </p>
              <p className="mt-1 font-semibold text-textprimary dark:text-white">
                {distributableIncome}
              </p>
            </div>
            <div className="rounded-xl border border-bordercolor1 dark:border-darkbordercolor1 p-4">
              <p className="text-xs text-textparagraph dark:text-textparagraphlight">
                {t("rentManagement.mintAmount")}
              </p>
              <p className="mt-1 font-semibold text-textprimary dark:text-white">
                {mintAmount}
              </p>
            </div>

            <div className="rounded-xl border border-bordercolor1 dark:border-darkbordercolor1 p-4">
              <p className="text-xs text-textparagraph dark:text-textparagraphlight">
                {t("rentManagement.sellingPercentage")}
              </p>
              <p className="mt-1 font-semibold text-textprimary dark:text-white inline-flex items-center gap-2">
                <Percent size={15} />
                {item.sellingPercentage ?? 0}%
              </p>
            </div>
            <div className="rounded-xl border border-bordercolor1 dark:border-darkbordercolor1 p-4">
              <p className="text-xs text-textparagraph dark:text-textparagraphlight">
                {t("rentalIncome.form.fromDate")}
              </p>
              <p className="mt-1 font-semibold text-textprimary dark:text-white inline-flex items-center gap-2">
                <CalendarDays size={15} />
                {formatDateTime(item.fromDate)}
              </p>
            </div>
            <div className="rounded-xl border border-bordercolor1 dark:border-darkbordercolor1 p-4">
              <p className="text-xs text-textparagraph dark:text-textparagraphlight">
                {t("rentalIncome.form.toDate")}
              </p>
              <p className="mt-1 font-semibold text-textprimary dark:text-white inline-flex items-center gap-2">
                <CalendarDays size={15} />
                {formatDateTime(item.toDate)}
              </p>
            </div>
          </div>
        </div>

        <DataTable<DistributionPreviewRow>
          data={distributionPreviewRows}
          totalCount={
            isDistributedRecord ? distributionTotalCount : investorsTotalCount
          }
          isLoading={investorsLoading}
          config={investorTableConfig}
        />

        {!isReadOnlyAdmin && (
          <ConfirmationModal
            isOpen={distributeModalOpen}
            onClose={() => {
              if (distributing) return;
              setDistributeModalOpen(false);
            }}
            onConfirm={async () => {
              if (!item?.id) return;
              try {
                setDistributing(true);
                await rentalIncomeService.distributeRentalIncome({
                  rentalIncomeId: item.id,
                });
                toast.success(t("distributedSuccess"));
                setDistributeModalOpen(false);
                await fetchDetails();
              } catch (err) {
                const message =
                  err instanceof Error
                    ? err.message
                    : t("rentManagement.editError");
                toast.error(message || t("rentManagement.editError"));
              } finally {
                setDistributing(false);
              }
            }}
            title={t("distribute")}
            message={t("rentManagement.distributeConfirmMessage")}
            isLoading={distributing}
          />
        )}
        {!isReadOnlyAdmin && (
          <ConfirmationModal
            isOpen={deleteModalOpen}
            onClose={() => {
              if (deleting) return;
              setDeleteModalOpen(false);
            }}
            onConfirm={async () => {
              if (!item?.id) return;
              try {
                setDeleting(true);
                await rentalIncomeService.deleteRentalIncome({
                  rentalIncomeId: item.id,
                });
                toast.success(t("rentManagement.deleteSuccess"));
                setDeleteModalOpen(false);
                router.push(PRIVATE_ROUTES.RENT_MANAGEMENT);
              } catch (err) {
                const message =
                  err instanceof Error
                    ? err.message
                    : t("rentManagement.deleteError");
                toast.error(message || t("rentManagement.deleteError"));
              } finally {
                setDeleting(false);
              }
            }}
            title={t("delete")}
            message={t("rentManagement.deleteConfirm")}
            isLoading={deleting}
          />
        )}
        {!isReadOnlyAdmin && (
          <RentalIncomeModal
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSuccess={() => {
              setEditModalOpen(false);
              void fetchDetails();
            }}
            property={
              item.property
                ? {
                    id: item.property.id,
                  }
                : null
            }
            mode="edit"
            rentalIncome={item}
          />
        )}
      </div>
    </div>
  );
};

export default RentalIncomeDetailsContent;
