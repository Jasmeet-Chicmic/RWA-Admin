"use client";

import { ExternalLink, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

import { TableColumn } from "@/components/atoms/Table";
import TableActions, {
  TableActionDisplayMode,
  TableActionItem,
} from "@/components/atoms/TableActions";
import CopyToClipboardPill from "@/components/atoms/CopyToClipboardPill/CopyToClipboardPill";
import TruncatedText from "@/components/atoms/TruncatedText/TruncatedText";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import {
  PROPERTY_STATUS_BADGE_CLASSES,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  PropertyStatus,
} from "@/constants/properties";
import { useDebounce } from "@/hooks/useDebounce";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import { truncateText } from "@/shared/utils";
import { formatDisplayCurrency, fromBaseUnits } from "@/shared/utils/unitUtils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminSpecificOrganisationProperties,
  fetchOrganisationProperties,
} from "@/store/propertiesSlice";
import { AdminProperty, PropertyItem } from "@/types/properties";
import { TokenizationModal } from "./TokenizationModal";
import { RentalIncomeModal } from "./RentalIncomeModal";

type PropertyData = PropertyItem | AdminProperty;
type OrganisationPropertiesDeps = {
  skip: number;
  limitRaw: string | null;
  pageSize: number;
  page: number;
  status: number | null;
  search: string | null;
};

function buildOrganisationPropertiesDeps(
  searchParams: ReturnType<typeof useSearchParams>,
): OrganisationPropertiesDeps {
  const params = new URLSearchParams(searchParams.toString());
  const limitRaw = params.get("limit");
  const skipRaw = params.get("skip");
  const statusRaw = params.get("status");
  const searchRaw = params.get("search");
  const pageSize = limitRaw ? Number(limitRaw) : 10;
  const skip = skipRaw ? Number(skipRaw) : 0;
  const page = Math.floor(skip / pageSize) + 1;
  const status = statusRaw ? Number(statusRaw) : null;
  const search = searchRaw ? searchRaw : null;

  return {
    skip,
    limitRaw,
    pageSize,
    page,
    status: Number.isFinite(status) ? status : null,
    search,
  };
}

const OrganisationPropertiesTable = ({
  organisationId,
  hideActions = false,
  fetchMode = "organisation",
}: {
  organisationId: string;
  hideActions?: boolean;
  fetchMode?: "organisation" | "adminSpecificOrganisation";
}) => {
  const t = useTranslations("properties");
  const tTransactions = useTranslations("transactions");
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { items, totalCount } = useAppSelector(
    (state) => state.properties.organisation,
  );
  const isLoading = useAppSelector(
    (state) => state.properties.organisation.isLoading,
  );
  const lastRequestKeyRef = useRef<string | null>(null);

  const [tokenizationModalOpen, setTokenizationModalOpen] = useState(false);
  const [rentalIncomeModalOpen, setRentalIncomeModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] =
    useState<AdminProperty | null>(null);
  const actionsDisplayMode: TableActionDisplayMode = "dropdown";

  const openTokenization = (property: PropertyData) => {
    setSelectedProperty(property as AdminProperty);
    setTokenizationModalOpen(true);
  };

  const closeTokenization = () => {
    setTokenizationModalOpen(false);
    setSelectedProperty(null);
  };

  const openRentalIncome = (property: PropertyData) => {
    setSelectedProperty(property as AdminProperty);
    setRentalIncomeModalOpen(true);
  };

  const closeRentalIncome = () => {
    setRentalIncomeModalOpen(false);
    setSelectedProperty(null);
  };

  const formatCurrency = (value: number) =>
    formatDisplayCurrency(value, { maximumFractionDigits: 2 });

  const combinedDeps = useMemo(
    () => JSON.stringify(buildOrganisationPropertiesDeps(searchParams)),
    [searchParams],
  );
  const debouncedDeps = useDebounce(combinedDeps, 300);

  const requestPayload = useMemo(() => {
    try {
      const parsed = JSON.parse(debouncedDeps) as OrganisationPropertiesDeps;
      return {
        page: parsed.page,
        pageSize: parsed.pageSize,
        ...(typeof parsed.status === "number" ? { status: parsed.status } : {}),
        ...(parsed.search ? { search: parsed.search } : {}),
      };
    } catch {
      return null;
    }
  }, [debouncedDeps]);

  const refetchOrganisationProperties = useCallback(() => {
    if (!requestPayload) return;
    if (fetchMode === "adminSpecificOrganisation") {
      dispatch(
        fetchAdminSpecificOrganisationProperties({
          organizationId: organisationId,
          ...requestPayload,
        }),
      );
      return;
    }
    dispatch(fetchOrganisationProperties(requestPayload));
  }, [dispatch, fetchMode, organisationId, requestPayload]);

  useEffect(() => {
    if (!requestPayload) return;
    if (lastRequestKeyRef.current === debouncedDeps) return;
    lastRequestKeyRef.current = debouncedDeps;
    if (fetchMode === "adminSpecificOrganisation") {
      dispatch(
        fetchAdminSpecificOrganisationProperties({
          organizationId: organisationId,
          ...requestPayload,
        }),
      );
      return;
    }
    dispatch(fetchOrganisationProperties(requestPayload));
  }, [debouncedDeps, dispatch, fetchMode, organisationId, requestPayload]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const config: DataTableConfig<PropertyData> = useMemo(() => {
    const columns: TableColumn<PropertyData>[] = [
      {
        title: t("propertyName"),
        field: "name",
        render: (item) => (
          <span className={`font-medium line-clamp-2 ${TEXT_PRIMARY}`}>
            <TruncatedText text={item.name} maxLength={40} />
          </span>
        ),
      },
      {
        title: t("location"),
        field: "location",
        render: (item) => {
          const locationValue = item.location ?? "";
          const mapsUrl = locationValue
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationValue)}`
            : "";
          return (
            <div className="flex items-center gap-2">
              <MapPin size={14} className={TEXT_PRIMARY} />
              <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
                {truncateText(locationValue, 40, "—")}
              </span>
              {locationValue ? (
                <>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center justify-center rounded-md border border-bordergray200 dark:border-darkbordercolor1 px-2 py-1 text-textprimary dark:text-secondary hover:text-bgblack dark:hover:text-white transition-colors"
                    title={t("openInGoogleMaps")}
                    aria-label={t("openInGoogleMaps")}
                  >
                    <ExternalLink size={14} />
                  </a>
                  <CopyToClipboardPill
                    value={locationValue}
                    showText={false}
                    title={tTransactions("copy")}
                    onCopied={() =>
                      toast.success(tTransactions("copiedToClipboard"))
                    }
                    className="px-2 py-1"
                  />
                </>
              ) : null}
            </div>
          );
        },
      },
      {
        title: t("propertyType"),
        field: "propertyType",
        render: (item) => {
          const typeLabel =
            typeof item.propertyType === "number"
              ? PROPERTY_TYPE_LABELS[
                  item.propertyType as keyof typeof PROPERTY_TYPE_LABELS
                ]
              : item.propertyType;
          return (
            <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
              {typeLabel || "—"}
            </span>
          );
        },
      },
      {
        title: t("status.label"),
        field: "status",
        render: (item) => {
          const baseClass =
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border";
          const status = item.status as keyof typeof PROPERTY_STATUS_LABELS;
          const className =
            PROPERTY_STATUS_BADGE_CLASSES[status] ||
            "bg-gray-100 text-gray-700 border-gray-200";
          const statusLabel =
            PROPERTY_STATUS_LABELS[status] ?? String(item.status);

          return (
            <span className={`${baseClass} ${className}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
              {statusLabel}
            </span>
          );
        },
      },
      {
        title: t("totalValue"),
        field: "",
        render: (item) => {
          const value =
            (item as PropertyItem).approvedValuation ??
            (item as AdminProperty).totalValue;
          return (
            <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
              {formatCurrency(fromBaseUnits(value))}
            </span>
          );
        },
      },
      // {
      //   title: t("annualYield"),
      //   field: "",
      //   render: (item) => {
      //     const yieldVal =
      //       (item as PropertyItem).annualYieldPercentage ??
      //       (item as AdminProperty).annualYieldPercent;
      //     return (
      //       <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
      //         {yieldVal !== null && yieldVal !== undefined
      //           ? `${yieldVal}%`
      //           : "—"}
      //       </span>
      //     );
      //   },
      // },
      {
        title: t("pricePerShare"),
        field: "",
        render: (item) => {
          const price = (item as PropertyItem).pricePerShare;
          return (
            <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
              {price !== null && price !== undefined
                ? formatCurrency(fromBaseUnits(price))
                : "—"}
            </span>
          );
        },
      },
      {
        title: t("whitelistedUsers"),
        field: "whitelistedUsers",
        align: "center",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY} font-medium`}>
            {item.whitelistedUsers ?? 0}
          </span>
        ),
      },
      {
        title: t("investors"),
        field: "investorUsers",
        align: "center",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY} font-medium`}>
            {item.investorUsers ?? 0}
          </span>
        ),
      },
      {
        title: t("createdAt"),
        field: "",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {formatDate((item as PropertyItem).createdAt)}
          </span>
        ),
      },
    ];

    if (!hideActions || fetchMode === "adminSpecificOrganisation") {
      columns.push({
        title: t("actions"),
        field: "",
        render: (item) => {
          const canTokenize =
            item.status === PropertyStatus.OrganizationAssigned;
          const actions: TableActionItem[] = [
            {
              id: `property-details-${item.id}`,
              label: t("propertyDetails"),
              onClick: () =>
                router.push(
                  fetchMode === "adminSpecificOrganisation"
                    ? `/properties/${item.id}`
                    : `/organisations/properties/${item.id}`,
                ),
            },
          ];
          if (!hideActions) {
            actions.push({
              id: `property-action-${item.id}`,
              label: t("tokenization"),
              disabled: !canTokenize,
              onClick: () => {
                if (canTokenize) openTokenization(item);
              },
            });

            const canSubmitRentalIncome =
              item.status === PropertyStatus.Active ||
              item.status === PropertyStatus.SoldOut;

            actions.push({
              id: `property-rental-income-${item.id}`,
              label: t("rentalIncome.submitButton"),
              disabled: !canSubmitRentalIncome,
              onClick: () => {
                if (canSubmitRentalIncome) openRentalIncome(item);
              },
            });
          }

          return (
            <div className="flex items-center justify-end">
              <TableActions
                displayMode={actionsDisplayMode}
                actions={actions}
                ariaLabel={t("actions")}
              />
            </div>
          );
        },
      });
    }

    return {
      columns,
      keyExtractor: (item) => item.id,
      paginationTitle: t("organisationPropertiesTitle"),
      hideSelectCol: true,
      emptyMessage: t("noPropertiesFound"),
    };
  }, [actionsDisplayMode, fetchMode, hideActions, router, t, tTransactions]);

  return (
    <>
      <DataTable
        data={items}
        totalCount={totalCount}
        isLoading={isLoading}
        config={config}
      />
      <TokenizationModal
        open={tokenizationModalOpen}
        onClose={closeTokenization}
        onSuccess={refetchOrganisationProperties}
        property={selectedProperty}
        organisationId={organisationId}
      />
      <RentalIncomeModal
        open={rentalIncomeModalOpen}
        onClose={closeRentalIncome}
        onSuccess={refetchOrganisationProperties}
        property={selectedProperty}
      />
    </>
  );
};

export default OrganisationPropertiesTable;
