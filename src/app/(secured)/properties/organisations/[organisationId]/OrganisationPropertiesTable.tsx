"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

import { TableColumn } from "@/components/atoms/Table";
import TableActions, {
  TableActionDisplayMode,
  TableActionItem,
} from "@/components/atoms/TableActions";
import TruncatedText from "@/components/atoms/TruncatedText/TruncatedText";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { useDebounce } from "@/hooks/useDebounce";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import { formatDisplayCurrency, fromBaseUnits } from "@/shared/utils/unitUtils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminSpecificOrganisationProperties,
  fetchOrganisationProperties,
} from "@/store/propertiesSlice";
import { PropertyItem } from "../../helpers/allPropertiesTypes";
import {
  PROPERTY_STATUS_BADGE_CLASSES,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
} from "../../helpers/propertiesConstants";
import { AdminProperty, PropertyStatus } from "../../helpers/types";
import { TokenizationModal } from "./TokenizationModal";

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
  const [selectedProperty, setSelectedProperty] =
    useState<AdminProperty | null>(null);
  const [distributedPropertyIds, setDistributedPropertyIds] = useState<
    Record<string, boolean>
  >({});
  const actionsDisplayMode: TableActionDisplayMode = "dropdown";

  const openTokenization = (property: PropertyData) => {
    setSelectedProperty(property as AdminProperty);
    setTokenizationModalOpen(true);
  };

  const closeTokenization = () => {
    setTokenizationModalOpen(false);
    setSelectedProperty(null);
  };

  const handleDistribute = useCallback(
    (propertyId: string) => {
      setDistributedPropertyIds((prev) => ({
        ...prev,
        [propertyId]: true,
      }));
      toast.success(t("distributedSuccess"));
    },
    [t],
  );

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
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            <TruncatedText text={item.location} maxLength={40} />
          </span>
        ),
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
      {
        title: t("annualYield"),
        field: "",
        render: (item) => {
          const yieldVal =
            (item as PropertyItem).annualYieldPercentage ??
            (item as AdminProperty).annualYieldPercent;
          return (
            <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
              {yieldVal !== null && yieldVal !== undefined
                ? `${yieldVal}%`
                : "—"}
            </span>
          );
        },
      },
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
        title: t("createdAt"),
        field: "",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {formatDate((item as PropertyItem).createdAt)}
          </span>
        ),
      },
    ];

    if (!hideActions) {
      columns.push({
        title: t("actions"),
        field: "",
        render: (item) => {
          const isActiveProperty = item.status === PropertyStatus.Active;
          const canTokenize =
            item.status === PropertyStatus.OrganizationAssigned;
          const isDistributed = !!distributedPropertyIds[item.id];
          const shouldDisable =
            isDistributed || (!isActiveProperty && !canTokenize);
          let primaryActionLabel = t("tokenization");
          if (isActiveProperty) {
            primaryActionLabel = isDistributed
              ? t("distributed")
              : t("distribute");
          }
          const actions: TableActionItem[] = [
            {
              id: `property-details-${item.id}`,
              label: t("propertyDetails"),
              onClick: () =>
                router.push(`/organisations/properties/${item.id}`),
            },
            {
              id: `property-action-${item.id}`,
              label: primaryActionLabel,
              disabled: shouldDisable,
              onClick: () => {
                if (isActiveProperty) {
                  handleDistribute(item.id);
                  return;
                }
                if (canTokenize) openTokenization(item);
              },
            },
          ];

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
  }, [
    actionsDisplayMode,
    distributedPropertyIds,
    handleDistribute,
    hideActions,
    router,
    t,
  ]);

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
    </>
  );
};

export default OrganisationPropertiesTable;
