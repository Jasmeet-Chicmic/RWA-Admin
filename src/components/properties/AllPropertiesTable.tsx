"use client";

import { useDebounce } from "@/hooks/useDebounce";
import {
  ChevronDown,
  ExternalLink,
  MapPin,
  Menu,
  RotateCcw,
  Search,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

import ApprovePropertyModal from "@/app/(secured)/properties/modals/ApprovePropertyModal";
import AssignLLCModal from "@/app/(secured)/properties/modals/AssignLLCModal";
import RejectPropertyModal from "@/app/(secured)/properties/modals/RejectPropertyModal";
import Pagination from "@/components/atoms/Pagination";
import Table, { TableColumn } from "@/components/atoms/Table/Table";
import TableActions, {
  TableActionDisplayMode,
  TableActionItem,
} from "@/components/atoms/TableActions";
import CopyToClipboardPill from "@/components/atoms/CopyToClipboardPill/CopyToClipboardPill";
import FilterSidebar from "@/components/molecules/FilterSidebar/FilterSidebar";
import { truncateText } from "@/shared/utils";
import {
  DEFAULT_PAGE_SIZE,
  PROPERTY_STATUS,
  PROPERTY_STATUS_BADGE_CLASSES,
  PROPERTY_STATUS_FILTER_OPTIONS,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  PropertyStatusType,
  PropertyType,
} from "@/constants/properties";
import { formatDisplayCurrency, fromBaseUnits } from "@/shared/utils/unitUtils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllProperties } from "@/store/propertiesSlice";
import { GetAllPropertiesParams, PropertyItem } from "@/types/properties";

const getStatusLabel = (status: number): string =>
  PROPERTY_STATUS_LABELS[status as PropertyStatusType] ?? String(status);

const getStatusBadgeClass = (status: number): string =>
  PROPERTY_STATUS_BADGE_CLASSES[status as PropertyStatusType] ??
  "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";

const getPropertyTypeLabel = (type: number): string =>
  PROPERTY_TYPE_LABELS[type as PropertyType] ?? String(type);

// const formatPercentage = (value: number | null): string => {
//   if (value === null || value === undefined) return "—";
//   return `${value.toFixed(2)}%`;
// };

const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const parseStatusParam = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const AllPropertiesTable = ({
  fixedStatus,
  hideStatusFilter = false,
}: {
  fixedStatus?: number;
  hideStatusFilter?: boolean;
}) => {
  const t = useTranslations("properties");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { items, totalCount, isLoading } = useAppSelector(
    (state) => state.properties.all,
  );
  const ownerUserIdFilter = searchParams.get("userId")?.trim() ?? "";
  const whitelistedUserIdFilter =
    searchParams.get("whitelistedUserId")?.trim() ?? "";

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchText, setSearchText] = useState("");
  const [statusFilterNumber, setStatusFilterNumber] = useState<
    number | undefined
  >(fixedStatus);

  useEffect(() => {
    setStatusFilterNumber(fixedStatus);
  }, [fixedStatus]);

  const [selectedProperty, setSelectedProperty] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isAssignLLCModalOpen, setIsAssignLLCModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const lastRequestKeyRef = useRef<string | null>(null);
  const actionsDisplayMode: TableActionDisplayMode = "dropdown";

  const combinedDeps = useMemo(
    () =>
      JSON.stringify({
        page: currentPage,
        pageSize,
        status: statusFilterNumber ?? null,
        search: searchText || null,
        userId: ownerUserIdFilter || null,
        whitelistedUserId: whitelistedUserIdFilter || null,
      }),
    [
      currentPage,
      pageSize,
      statusFilterNumber,
      searchText,
      ownerUserIdFilter,
      whitelistedUserIdFilter,
    ],
  );

  const debouncedDeps = useDebounce(combinedDeps, 300);

  const payload = useMemo((): GetAllPropertiesParams | null => {
    try {
      const parsed = JSON.parse(debouncedDeps) as {
        page: number;
        pageSize: number;
        status: number | null;
        search: string | null;
        userId: string | null;
        whitelistedUserId: string | null;
      };

      return {
        page: parsed.page,
        pageSize: parsed.pageSize,
        ...(typeof parsed.status === "number" && Number.isFinite(parsed.status)
          ? { status: parsed.status }
          : {}),
        ...(parsed.search ? { search: parsed.search } : {}),
        ...(parsed.userId ? { userId: parsed.userId } : {}),
        ...(parsed.whitelistedUserId
          ? { whitelistedUserId: parsed.whitelistedUserId }
          : {}),
      };
    } catch {
      return null;
    }
  }, [debouncedDeps]);

  const loadProperties = useCallback(() => {
    if (!payload) return;
    dispatch(fetchAllProperties(payload));
  }, [dispatch, payload]);

  useEffect(() => {
    if (!payload) return;
    if (lastRequestKeyRef.current === debouncedDeps) return;
    lastRequestKeyRef.current = debouncedDeps;
    dispatch(fetchAllProperties(payload));
  }, [debouncedDeps, dispatch, payload]);
  const handlePageChange = (pageZeroBased: number) => {
    setCurrentPage(pageZeroBased + 1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    if (fixedStatus !== undefined) return;
    const parsed = parseStatusParam(value || null);
    setStatusFilterNumber(parsed);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    if (fixedStatus !== undefined) return;
    setStatusFilterNumber(undefined);
    setCurrentPage(1);
    setIsFilterOpen(false);
    router.push(pathname);
  };

  const handleApprove = useCallback((item: PropertyItem) => {
    setSelectedProperty({ id: item.id, name: item.name });
    setIsApproveModalOpen(true);
  }, []);

  const handleReject = useCallback((item: PropertyItem) => {
    setSelectedProperty({ id: item.id, name: item.name });
    setIsRejectModalOpen(true);
  }, []);

  const handleAssignLLC = useCallback((item: PropertyItem) => {
    setSelectedProperty({ id: item.id, name: item.name });
    setIsAssignLLCModalOpen(true);
  }, []);

  const columns: TableColumn<PropertyItem>[] = useMemo(
    () => [
      {
        title: t("propertyName"),
        field: "name" as keyof PropertyItem,
        render: (item: PropertyItem) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/properties/${item.id}`);
            }}
            className="font-medium text-bgblack dark:text-white underline hover:opacity-90"
            title={item.name || item.id}
          >
            {item.name || "—"}
          </button>
        ),
      },
      {
        title: t("location"),
        field: "location" as keyof PropertyItem,
        render: (item: PropertyItem) => {
          const locationValue = item.location ?? "";
          const mapsUrl = locationValue
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationValue)}`
            : "";
          return (
            <div className="flex items-center gap-2">
              <MapPin
                size={14}
                className="text-bgblack dark:text-white shrink-0"
              />
              <span className="text-[0.875rem] text-bgblack dark:text-white">
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
                    title={tCommon("copy")}
                    onCopied={() => toast.success(tCommon("copiedToClipboard"))}
                    className="px-2 py-1"
                  />
                </>
              ) : null}
            </div>
          );
        },
      },
      {
        title: t("organisationName"),
        field: "organisation" as keyof PropertyItem,
        render: (item: PropertyItem) => {
          const organisationName =
            item.organization?.name ?? item.organisation?.name ?? "";
          const display = organisationName || "—";
          return (
            <span className="text-[0.875rem] text-bgblack dark:text-white/90">
              {truncateText(display, 30, "—")}
            </span>
          );
        },
      },
      {
        title: t("statusLabel"),
        field: "status" as keyof PropertyItem,
        render: (item: PropertyItem) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[14px] font-medium border ${getStatusBadgeClass(item.status)}`}
          >
            {getStatusLabel(item.status)}
          </span>
        ),
      },
      {
        title: t("propertyType"),
        field: "propertyType" as keyof PropertyItem,
        render: (item: PropertyItem) => (
          <span>{getPropertyTypeLabel(item.propertyType)}</span>
        ),
      },
      {
        title: t("approvedValuation"),
        field: "approvedValuation" as keyof PropertyItem,
        render: (item: PropertyItem) => (
          <span className="font-medium text-bgblack dark:text-white">
            {formatDisplayCurrency(fromBaseUnits(item.approvedValuation))}
          </span>
        ),
      },
      // {
      //   title: t("annualYield"),
      //   field: "annualYieldPercentage" as keyof PropertyItem,
      //   render: (item: PropertyItem) => (
      //     <span>{formatPercentage(item.annualYieldPercentage)}</span>
      //   ),
      // },
      {
        title: t("pricePerShare"),
        field: "pricePerShare" as keyof PropertyItem,
        render: (item: PropertyItem) => (
          <span className="font-medium text-bgblack dark:text-white">
            {formatDisplayCurrency(fromBaseUnits(item.pricePerShare))}
          </span>
        ),
      },
      {
        title: t("whitelistedUsers"),
        field: "whitelistedUsers" as keyof PropertyItem,
        align: "center",
        render: (item: PropertyItem) => (
          <span className="font-medium text-bgblack dark:text-white">
            {item.whitelistedUsers ?? 0}
          </span>
        ),
      },
      {
        title: t("investors"),
        field: "investorUsers" as keyof PropertyItem,
        align: "center",
        render: (item: PropertyItem) => (
          <span className="font-medium text-bgblack dark:text-white">
            {item.investorUsers ?? 0}
          </span>
        ),
      },
      {
        title: t("createdAt"),
        field: "createdAt" as keyof PropertyItem,
        render: (item: PropertyItem) => (
          <span>{formatDate(item.createdAt)}</span>
        ),
      },
      {
        title: t("actions"),
        field: "id" as keyof PropertyItem,
        render: (item: PropertyItem) => {
          const actions: TableActionItem[] = [
            {
              id: `property-details-${item.id}`,
              label: t("propertyDetails"),
              onClick: () => router.push(`/properties/${item.id}`),
            },
          ];

          if (item.status === PROPERTY_STATUS.PENDING_APPROVAL) {
            actions.push(
              {
                id: `approve-${item.id}`,
                label: t("approve"),
                onClick: () => handleApprove(item),
                className: "text-emerald-600 dark:text-emerald-400",
              },
              {
                id: `reject-${item.id}`,
                label: t("reject"),
                onClick: () => handleReject(item),
                className: "text-red-600 dark:text-red-400",
              },
            );
          } else if (item.status === PROPERTY_STATUS.ADMIN_APPROVED) {
            actions.push({
              id: `assign-${item.id}`,
              label: t("assignToOrganization"),
              onClick: () => handleAssignLLC(item),
              className: "text-indigo-600 dark:text-indigo-400",
            });
          } else if (item.status === PROPERTY_STATUS.ACTIVE) {
            // When a property is already Active, only "Property Details" should be available.
            // No approve/reject/assign/disapprove actions are allowed.
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
      },
    ],
    [
      actionsDisplayMode,
      handleApprove,
      handleAssignLLC,
      handleReject,
      router,
      t,
      tCommon,
    ],
  );

  return (
    <div className="space-y-0">
      {/* Header with Search and Filter */}
      <div className="bg-bgwhite px-[15px] lg:px-5 3xl:px-6 pt-[15px] lg:pt-5 3xl:pt-7 pb-3 rounded-[20px_20px_0_0] dark:bg-darkbgprimary dark:border-darkbordercolor1">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-bgblack dark:text-white">
              {t("properties")}
            </h2>
            <p className="text-sm text-textprimary dark:text-secondary mt-0.5">
              {t("manageAndViewAllProperties")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative">
              <Search
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textprimary dark:text-secondary"
                size={18}
              />
              <input
                type="text"
                placeholder={t("searchProperties")}
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                className="pr-10 px-4 py-3 w-full sm:w-[260px] dark:border-white/50 border border-bordergray200 placeholder:text-[#8F9BBA] bg-bgwhite dark:bg-darkbgprimary rounded-[10px] focus:outline-none transition-all duration-200 text-bgblack dark:text-white"
              />
            </div>
            {!hideStatusFilter && (
              <button
                type="button"
                onClick={() => setIsFilterOpen(true)}
                className="inline-flex h-[46px] items-center gap-2 rounded-[10px] border border-primarycolor px-4 py-2 font-semibold text-black transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-0 dark:border-secondarycolor dark:bg-secondarycolor dark:text-black dark:hover:opacity-90 bg-primarycolor"
              >
                <Menu size={16} strokeWidth={2.25} />
                <span>{t("filters")}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <Table<PropertyItem>
        data={items}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage={t("noPropertiesFound")}
      />

      {/* Pagination */}
      <Pagination
        totalItems={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        title={t("properties")}
      />

      {!hideStatusFilter && (
        <FilterSidebar
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          title={t("filters")}
          footer={
            <button
              type="button"
              onClick={handleClearFilters}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 dark:bg-darkbgprimary text-labelprimary dark:text-darklabelprimary rounded-xl hover:bg-gray-200 dark:hover:bg-labelprimary transition-all border bordergray200 dark:border-labelprimary font-medium"
            >
              <RotateCcw size={18} />
              <span>{t("clearAllFilters")}</span>
            </button>
          }
        >
          <div>
            <label
              htmlFor="property-status-filter-sidebar"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-textparagraph dark:text-textparagraphlight"
            >
              {t("statusLabel")}
            </label>
            <div className="relative">
              <select
                id="property-status-filter-sidebar"
                value={
                  statusFilterNumber === undefined
                    ? ""
                    : String(statusFilterNumber)
                }
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="appearance-none pr-8 pl-4 py-3 w-full dark:border-white/50 border border-bordergray200 bg-bgwhite dark:bg-darkbgprimary rounded-[10px] focus:outline-none transition-all duration-200 text-bgblack dark:text-white text-sm cursor-pointer"
              >
                {PROPERTY_STATUS_FILTER_OPTIONS.map((option) => (
                  <option
                    key={String(option.value)}
                    value={String(option.value)}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textprimary dark:text-secondary pointer-events-none"
                size={16}
              />
            </div>
          </div>
        </FilterSidebar>
      )}

      {/* Modals */}
      {selectedProperty && (
        <>
          <ApprovePropertyModal
            isOpen={isApproveModalOpen}
            onClose={() => setIsApproveModalOpen(false)}
            propertyId={selectedProperty.id}
            propertyName={selectedProperty.name}
            onSuccess={loadProperties}
          />
          <RejectPropertyModal
            isOpen={isRejectModalOpen}
            onClose={() => setIsRejectModalOpen(false)}
            propertyId={selectedProperty.id}
            propertyName={selectedProperty.name}
            onSuccess={loadProperties}
          />
          <AssignLLCModal
            isOpen={isAssignLLCModalOpen}
            onClose={() => setIsAssignLLCModalOpen(false)}
            propertyId={selectedProperty.id}
            propertyName={selectedProperty.name}
            onSuccess={loadProperties}
          />
        </>
      )}
    </div>
  );
};

export default AllPropertiesTable;
