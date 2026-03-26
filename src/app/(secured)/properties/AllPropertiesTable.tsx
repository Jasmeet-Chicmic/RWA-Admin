"use client";

import {
  useEffect,
  useState,
  useTransition,
  useCallback,
  useMemo,
} from "react";
import { useTranslations } from "next-intl";
import { Search, ChevronDown } from "lucide-react";

import Table, { TableColumn } from "@/components/atoms/Table/Table";
import Pagination from "@/components/atoms/Pagination";
import { getAllPropertiesAction } from "@/api/allPropertiesActions";
import { PropertyItem } from "./helpers/allPropertiesTypes";
import {
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUS_BADGE_CLASSES,
  PROPERTY_STATUS_FILTER_OPTIONS,
  PROPERTY_TYPE_LABELS,
  DEFAULT_PAGE_SIZE,
  PROPERTY_STATUS,
  PropertyStatusType,
  PropertyType,
} from "./helpers/propertiesConstants";
import { formatDisplayCurrency, fromBaseUnits } from "@/shared/utils/unitUtils";
import ApprovePropertyModal from "./modals/ApprovePropertyModal";
import RejectPropertyModal from "./modals/RejectPropertyModal";
import AssignLLCModal from "./modals/AssignLLCModal";

const getStatusLabel = (status: number): string =>
  PROPERTY_STATUS_LABELS[status as PropertyStatusType] ?? String(status);

const getStatusBadgeClass = (status: number): string =>
  PROPERTY_STATUS_BADGE_CLASSES[status as PropertyStatusType] ??
  "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";

const getPropertyTypeLabel = (type: number): string =>
  PROPERTY_TYPE_LABELS[type as PropertyType] ?? String(type);

const formatPercentage = (value: number | null): string => {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(2)}%`;
};

const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const AllPropertiesTable = ({
  initialData,
  initialTotalCount,
}: {
  initialData: PropertyItem[];
  initialTotalCount: number;
}) => {
  const t = useTranslations("properties");
  const [isPending, startTransition] = useTransition();

  const [data, setData] = useState<PropertyItem[]>(initialData);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | string>("");

  const [selectedProperty, setSelectedProperty] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isAssignLLCModalOpen, setIsAssignLLCModalOpen] = useState(false);

  const fetchData = useCallback(
    (page: number, size: number, search: string, status: number | string) => {
      startTransition(async () => {
        const params: {
          page: number;
          pageSize: number;
          search?: string;
          status?: number | string;
        } = {
          page,
          pageSize: size,
        };
        if (search) params.search = search;
        if (status !== "") params.status = status;

        const res = await getAllPropertiesAction(params);
        setData(res?.items ?? []);
        setTotalCount(res?.totalCount ?? 0);
      });
    },
    [],
  );

  useEffect(() => {
    fetchData(currentPage, pageSize, searchText, statusFilter);
  }, [currentPage, pageSize, searchText, statusFilter, fetchData]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page + 1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "" ? "" : Number(value));
    setCurrentPage(1);
  };

  const handleApprove = (item: PropertyItem) => {
    setSelectedProperty({ id: item.id, name: item.name });
    setIsApproveModalOpen(true);
  };

  const handleReject = (item: PropertyItem) => {
    setSelectedProperty({ id: item.id, name: item.name });
    setIsRejectModalOpen(true);
  };

  const handleAssignLLC = (item: PropertyItem) => {
    setSelectedProperty({ id: item.id, name: item.name });
    setIsAssignLLCModalOpen(true);
  };

  const columns: TableColumn<PropertyItem>[] = useMemo(
    () => [
      {
        title: t("Property Name"),
        field: "name" as keyof PropertyItem,
        render: (item: PropertyItem) => (
          <span className="font-medium text-bgblack dark:text-white">
            {item.name || "—"}
          </span>
        ),
      },
      {
        title: t("Location"),
        field: "location" as keyof PropertyItem,
        render: (item: PropertyItem) => <span>{item.location || "—"}</span>,
      },
      {
        title: t("StatusLabel"),
        field: "status" as keyof PropertyItem,
        render: (item: PropertyItem) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(item.status)}`}
          >
            {getStatusLabel(item.status)}
          </span>
        ),
      },
      {
        title: t("Property Type"),
        field: "propertyType" as keyof PropertyItem,
        render: (item: PropertyItem) => (
          <span>{getPropertyTypeLabel(item.propertyType)}</span>
        ),
      },
      {
        title: t("Approved Valuation"),
        field: "approvedValuation" as keyof PropertyItem,
        render: (item: PropertyItem) => (
          <span className="font-medium text-bgblack dark:text-white">
            {formatDisplayCurrency(fromBaseUnits(item.approvedValuation))}
          </span>
        ),
      },
      {
        title: t("Annual Yield"),
        field: "annualYieldPercentage" as keyof PropertyItem,
        render: (item: PropertyItem) => (
          <span>{formatPercentage(item.annualYieldPercentage)}</span>
        ),
      },
      {
        title: t("Price Per Share"),
        field: "pricePerShare" as keyof PropertyItem,
        render: (item: PropertyItem) => (
          <span className="font-medium text-bgblack dark:text-white">
            {formatDisplayCurrency(fromBaseUnits(item.pricePerShare))}
          </span>
        ),
      },
      {
        title: t("Created At"),
        field: "createdAt" as keyof PropertyItem,
        render: (item: PropertyItem) => (
          <span>{formatDate(item.createdAt)}</span>
        ),
      },
      {
        title: t("Actions"),
        field: "id" as keyof PropertyItem,
        render: (item: PropertyItem) => (
          <div className="flex items-center gap-2 justify-end">
            {item.status === PROPERTY_STATUS.PENDING_APPROVAL ? (
              <>
                <button
                  onClick={() => handleApprove(item)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                >
                  {t("Approve")}
                </button>
                <button
                  onClick={() => handleReject(item)}
                  className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                >
                  {t("Reject")}
                </button>
              </>
            ) : item.status === PROPERTY_STATUS.ADMIN_APPROVED ? (
              <button
                onClick={() => handleAssignLLC(item)}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
              >
                {t("Assign to LLC")}
              </button>
            ) : item.status === PROPERTY_STATUS.ACTIVE ? (
              <button
                onClick={() => handleReject(item)}
                className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
              >
                {t("Disapprove")}
              </button>
            ) : (
              <span className="text-xs text-textprimary dark:text-secondary italic">
                {t("No actions")}
              </span>
            )}
          </div>
        ),
      },
    ],
    [t],
  );

  return (
    <div className="space-y-0">
      {/* Header with Search and Filter */}
      <div className="bg-bgwhite px-[15px] lg:px-5 3xl:px-6 pt-[15px] lg:pt-5 3xl:pt-7 pb-3 rounded-[20px_20px_0_0] dark:bg-darkbgprimary dark:border-darkbordercolor1">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-bgblack dark:text-white">
              {t("Properties")}
            </h2>
            <p className="text-sm text-textprimary dark:text-secondary mt-0.5">
              {t("Manage and view all properties")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="appearance-none pr-8 pl-4 py-3 w-full sm:w-[180px] dark:border-white/50 border border-bordergray200 bg-bgwhite dark:bg-darkbgprimary rounded-[10px] focus:outline-none transition-all duration-200 text-bgblack dark:text-white text-sm cursor-pointer"
              >
                {PROPERTY_STATUS_FILTER_OPTIONS.map((option) => (
                  <option key={String(option.value)} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textprimary dark:text-secondary pointer-events-none"
                size={16}
              />
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textprimary dark:text-secondary"
                size={18}
              />
              <input
                type="text"
                placeholder={t("Search Properties")}
                value={searchText}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pr-10 px-4 py-3 w-full sm:w-[260px] dark:border-white/50 border border-bordergray200 placeholder:text-[#8F9BBA] bg-bgwhite dark:bg-darkbgprimary rounded-[10px] focus:outline-none transition-all duration-200 text-bgblack dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table<PropertyItem>
        data={data}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading={isPending}
        emptyMessage={t("No properties found")}
      />

      {/* Pagination */}
      <Pagination
        totalItems={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        title={t("Properties")}
      />

      {/* Modals */}
      {selectedProperty && (
        <>
          <ApprovePropertyModal
            isOpen={isApproveModalOpen}
            onClose={() => setIsApproveModalOpen(false)}
            propertyId={selectedProperty.id}
            propertyName={selectedProperty.name}
            onSuccess={() =>
              fetchData(currentPage, pageSize, searchText, statusFilter)
            }
          />
          <RejectPropertyModal
            isOpen={isRejectModalOpen}
            onClose={() => setIsRejectModalOpen(false)}
            propertyId={selectedProperty.id}
            propertyName={selectedProperty.name}
            onSuccess={() =>
              fetchData(currentPage, pageSize, searchText, statusFilter)
            }
          />
          <AssignLLCModal
            isOpen={isAssignLLCModalOpen}
            onClose={() => setIsAssignLLCModalOpen(false)}
            propertyId={selectedProperty.id}
            propertyName={selectedProperty.name}
            onSuccess={() =>
              fetchData(currentPage, pageSize, searchText, statusFilter)
            }
          />
        </>
      )}
    </div>
  );
};

export default AllPropertiesTable;
