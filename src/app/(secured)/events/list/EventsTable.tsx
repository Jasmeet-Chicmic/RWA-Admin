"use client";

import { useCallback, useMemo, useState } from "react";
import { Eye, Trash2, Menu, RotateCcw, ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import SearchToolbar from "@/components/atoms/SearchToolbar";
import SelectFilter from "@/components/atoms/SelectFilter";
import DateRangeFilter from "@/components/atoms/DateRangeFilter/DateRangeFilter";
import FilterSidebar from "@/components/molecules/FilterSidebar";
import ConfirmationModal from "@/components/molecules/ConfirmationModal/ConfirmationModal";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { TableColumn } from "@/components/atoms/Table";
import {
  AdminEvent,
  EVENT_CATEGORY_LABELS,
  EVENT_FORMAT_LABELS,
  EVENT_STATUS,
  EVENT_STATUS_LABELS,
  TICKET_TYPE_LABEL_KEYS,
} from "@/app/(secured)/events/helpers/types";
import { deleteEventAction, updateEventAccessAction } from "@/api/events";
import { createSortableColumn } from "@/shared/utils";
import FormattedDate from "@/components/atoms/FormattedDate";
import { SORT_DIRECTIONS } from "@/shared/types";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import CustomMenu from "@/components/atoms/Menu/Menu";
import { TableHeaderWithInfo } from "@/components/atoms/TableHeaderWithInfo";

// ── Filter option constants ────────────────────────────────

const STATUS_FILTER_OPTIONS = Object.entries(EVENT_STATUS_LABELS).map(
  ([value, label]) => ({ label, value }),
);

const CATEGORY_FILTER_OPTIONS = Object.entries(EVENT_CATEGORY_LABELS).map(
  ([value, label]) => ({ label, value }),
);

const FORMAT_FILTER_OPTIONS = Object.entries(EVENT_FORMAT_LABELS).map(
  ([value, label]) => ({ label, value }),
);

// ── Component ──────────────────────────────────────────────

interface EventsTableProps {
  data: AdminEvent[];
  totalCount: number;
  searchText: string;
}

const EventsTable = ({ data, totalCount, searchText }: EventsTableProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("events");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const ticketTypeFilterOptions = useMemo(
    () =>
      Object.entries(TICKET_TYPE_LABEL_KEYS).map(([value, key]) => ({
        value: Number(value),
        label: t(key),
      })),
    [t],
  );

  const handleDeleteEvent = useCallback(
    async (id: string) => {
      if (!id) return;
      setDeletingId(id);
      try {
        const res = await deleteEventAction({ eventIds: [id] });
        const ok =
          (res as { status?: boolean })?.status === true ||
          (res as { success?: boolean })?.success === true;
        if (ok) {
          toast.success(
            (res as { message?: string })?.message ??
              t("eventDeletedSuccessfully"),
          );
          setDeleteModal({ open: false, id: null });
          router.refresh();
        } else {
          toast.error(
            (res as { message?: string })?.message ?? t("failedToDeleteEvent"),
          );
          setDeleteModal({ open: false, id: null });
        }
      } catch (error) {
        console.error("Failed to delete event", error);
        toast.error(t("failedToDeleteEvent"));
        setDeleteModal({ open: false, id: null });
      } finally {
        setDeletingId(null);
      }
    },
    [router, t],
  );

  const handleToggleStatus = useCallback(
    async (id: string, isActive: boolean) => {
      if (!id) return;
      setActionLoading(`status-${id}`);
      try {
        const res = await updateEventAccessAction({
          eventId: id,
          isActive,
        });
        const ok =
          (res as { status?: boolean })?.status === true ||
          (res as { success?: boolean })?.success === true;
        if (ok) {
          toast.success(
            (res as { message?: string })?.message ??
              t("eventAccessUpdatedSuccessfully"),
          );
          router.refresh();
        } else {
          toast.error(
            (res as { message?: string })?.message ??
              t("failedToUpdateEventAccess"),
          );
        }
      } catch (error) {
        console.error("Failed to update event access", error);
        toast.error(t("failedToUpdateEventAccess"));
      } finally {
        setActionLoading(null);
      }
    },
    [router, t],
  );

  const getStatusStyle = (status: number): string => {
    switch (status) {
      case EVENT_STATUS.DRAFT:
        return "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
      case EVENT_STATUS.ONGOING:
        return "bg-primarycolor/10 text-primarycolor border-primarycolor/20 dark:bg-primarycolor/10 dark:text-white/80 dark:border-secondarycolor/10";
      case EVENT_STATUS.PUBLISHED:
        return "bg-primarycolor text-white border-primarycolor";
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  const getStatusDotColor = (status: number): string => {
    switch (status) {
      case EVENT_STATUS.ONGOING:
        return "bg-primarycolor dark:bg-white/80";
      case EVENT_STATUS.PUBLISHED:
        return "bg-white";
      default:
        return "bg-gray-500";
    }
  };

  const config: DataTableConfig<AdminEvent> = useMemo(() => {
    const columns: TableColumn<AdminEvent>[] = [
      createSortableColumn(
        "title",
        t("eventTitle"),
        (item) => (
          <span
            className={`font-medium line-clamp-2 ${TEXT_PRIMARY}`}
            title={item.title}
          >
            {item.title || "—"}
          </span>
        ),
        "Title",
      ),
      createSortableColumn(
        "eventCategory",
        t("eventCategory"),
        (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {EVENT_CATEGORY_LABELS[item.eventCategory] ?? "—"}
          </span>
        ),
        "EventCategory",
      ),
      createSortableColumn(
        "format",
        t("eventFormat"),
        (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {EVENT_FORMAT_LABELS[item.format] ?? "—"}
          </span>
        ),
        "Format",
      ),
      {
        title: (
          <TableHeaderWithInfo
            label={t("eventStatus")}
            options={[t("draft"), t("unpublished"), t("published")]}
          />
        ),
        field: "status",
        sortable: true,
        sortKey: "Status",
        render: (item) => (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${TEXT_SIZE_SM} font-bold border ${getStatusStyle(item.status)}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(item.status)}`}
            />
            {item.status !== undefined
              ? t(EVENT_STATUS_LABELS[item.status])
              : "—"}
          </span>
        ),
      },
      createSortableColumn(
        "startDateTime",
        t("eventStartDate"),
        (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.startDateTime ? (
              <FormattedDate date={item.startDateTime} />
            ) : (
              "—"
            )}
          </span>
        ),
        "StartDateTime",
      ),
      {
        title: t("eventEndDate"),
        field: "endDateTime",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.endDateTime ? <FormattedDate date={item.endDateTime} /> : "—"}
          </span>
        ),
      },
      {
        title: t("eventVenue"),
        field: "venue",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.venue || "—"}
          </span>
        ),
      },
      {
        title: t("eventCountry"),
        field: "country",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.country || "—"}
          </span>
        ),
      },
      {
        title: t("eventTicketType"),
        field: "ticketType",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.ticketType !== undefined &&
            TICKET_TYPE_LABEL_KEYS[item.ticketType]
              ? t(TICKET_TYPE_LABEL_KEYS[item.ticketType])
              : "—"}
          </span>
        ),
      },
      {
        title: (
          <TableHeaderWithInfo
            label={t("eventVisibility")}
            options={[t("active"), t("inactive")]}
          />
        ),
        field: "isActive",
        render: (item) => {
          const isActive = item.isActive ?? false;
          const isLoading = actionLoading === `status-${item.id}`;

          return (
            <CustomMenu
              menuButton={
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${TEXT_SIZE_SM} font-bold transition-all duration-200 border cursor-pointer ${
                    isActive
                      ? "bg-primarycolor/10 text-primarycolor border-primarycolor/20 dark:bg-primarycolor/10 dark:text-white/80 dark:border-secondarycolor/10"
                      : "bg-red-50 text-red-600 border-red-500 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive
                        ? "bg-primarycolor dark:bg-white/80"
                        : "bg-red-500"
                    }`}
                  />
                  {isActive ? t("active") : t("inactive")}
                  <ChevronDown size={14} className="opacity-60" />
                </div>
              }
              items={[
                {
                  label: (
                    <div className="flex items-center gap-2 py-1">
                      <div className="w-2 h-2 rounded-full bg-primarycolor dark:bg-white/80" />
                      <span className="font-medium">{t("active")}</span>
                    </div>
                  ),
                  onClick: () => {
                    if (!isActive && !isLoading && item.id) {
                      handleToggleStatus(item.id, true);
                    }
                  },
                  disabled: isActive || isLoading,
                },
                {
                  label: (
                    <div className="flex items-center gap-2 py-1">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="font-medium">{t("inactive")}</span>
                    </div>
                  ),
                  onClick: () => {
                    if (isActive && !isLoading && item.id) {
                      handleToggleStatus(item.id, false);
                    }
                  },
                  disabled: !isActive || isLoading,
                },
              ]}
            />
          );
        },
      },
      createSortableColumn(
        "createdOn",
        t("dateCreated"),
        (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            <FormattedDate date={item.createdOn} />
          </span>
        ),
        "CreatedOn",
      ),
      {
        title: t("actions"),
        field: "",
        fixed: "right",
        render: (item) => (
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!item.id) return;
                router.push(`/events/view/${item.id}`);
              }}
              className="text-gray-500 hover:text-primarycolor dark:hover:text-secondarycolor transition-colors dark:text-sidebartext"
              title={t("viewEvent")}
            >
              <Eye size={18} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteModal({ open: true, id: item.id });
              }}
              className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors dark:text-sidebartext disabled:opacity-50"
              title={t("delete")}
              disabled={deletingId === item.id}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ),
      },
    ];

    return {
      columns,
      keyExtractor: (item) => item.id,
      paginationTitle: "events",
      hideSelectCol: true,
      emptyMessage: t("noEventsFound"),
      queryConfig: {
        defaultSortKey: "CreatedOn",
        defaultSortDirection: SORT_DIRECTIONS.DESC,
      },
      header: (
        <>
          <div className="bg-bgwhite dark:bg-darkbgprimary">
            <div className="dark:border-darkbgprimary">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2
                    className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
                  >
                    {t("events")}
                  </h2>
                  <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                    {t("headerSubtitle")}
                  </p>
                </div>
                <div className="flex items-initial space-x-4">
                  <SearchToolbar
                    initialQuery={searchText}
                    placeholder={t("searchEvents")}
                    queryParamName="searchText"
                  />
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 transition-all duration-200 focus:outline-none focus:ring-0 font-medium bg-primarycolor text-bgwhite dark:bg-secondarycolor dark:text-white hover:bg-primaryhover dark:hover:bg-secondaryhover rounded-lg"
                  >
                    <Menu size={18} />
                    <span>{t("filters")}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <FilterSidebar
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            title={t("eventFilters")}
            footer={
              <button
                onClick={() => {
                  router.push(pathname);
                  setIsFilterOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 dark:bg-darkbgprimary text-labelprimary dark:text-darklabelprimary rounded-xl hover:bg-gray-200 dark:hover:bg-labelprimary transition-all border bordergray200 dark:border-labelprimary font-medium"
              >
                <RotateCcw size={18} />
                <span>{t("clearAllFilters")}</span>
              </button>
            }
          >
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="status-filter"
                  className="block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2"
                >
                  {t("status")}
                </label>
                <SelectFilter
                  id="status-filter"
                  paramName="status"
                  options={STATUS_FILTER_OPTIONS}
                  placeholder={t("selectStatus")}
                />
              </div>

              <div>
                <label
                  htmlFor="category-filter"
                  className="block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2"
                >
                  {t("category")}
                </label>
                <SelectFilter
                  id="category-filter"
                  paramName="eventCategory"
                  options={CATEGORY_FILTER_OPTIONS}
                  placeholder={t("selectCategory")}
                />
              </div>

              <div>
                <label
                  htmlFor="format-filter"
                  className="block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2"
                >
                  {t("format")}
                </label>
                <SelectFilter
                  id="format-filter"
                  paramName="format"
                  options={FORMAT_FILTER_OPTIONS}
                  placeholder={t("selectFormat")}
                />
              </div>

              <div>
                <label
                  htmlFor="ticket-type-filter"
                  className="block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2"
                >
                  {t("ticketType")}
                </label>
                <SelectFilter
                  id="ticket-type-filter"
                  paramName="ticketType"
                  options={ticketTypeFilterOptions}
                  placeholder={t("selectTicketType")}
                />
              </div>

              <div>
                <label
                  htmlFor="start-date-range-filter"
                  className="block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2"
                >
                  {t("startDateRange")}
                </label>
                <DateRangeFilter
                  id="start-date-range-filter"
                  initialFromDate={searchParams.get("startDateFrom") || ""}
                  initialToDate={searchParams.get("startDateTo") || ""}
                  useUrlParams={false}
                  onApply={(fromDate, toDate) => {
                    const newParams = new URLSearchParams(
                      searchParams.toString(),
                    );
                    newParams.delete("skip");
                    if (fromDate) {
                      newParams.set("startDateFrom", fromDate);
                    } else {
                      newParams.delete("startDateFrom");
                    }
                    if (toDate) {
                      newParams.set("startDateTo", toDate);
                    } else {
                      newParams.delete("startDateTo");
                    }
                    router.push(`?${newParams.toString()}`);
                    setIsFilterOpen(false);
                  }}
                  onClear={() => {
                    const newParams = new URLSearchParams(
                      searchParams.toString(),
                    );
                    newParams.delete("startDateFrom");
                    newParams.delete("startDateTo");
                    newParams.delete("skip");
                    router.push(`?${newParams.toString()}`);
                    setIsFilterOpen(false);
                  }}
                />
              </div>
            </div>
          </FilterSidebar>
        </>
      ),
    };
  }, [
    searchText,
    isFilterOpen,
    searchParams,
    router,
    pathname,
    deletingId,
    actionLoading,
    handleToggleStatus,
    t,
    ticketTypeFilterOptions,
  ]);

  return (
    <>
      <DataTable data={data} totalCount={totalCount} config={config} />

      <ConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => {
          if (deletingId) return;
          setDeleteModal({ open: false, id: null });
        }}
        onConfirm={async () => {
          if (!deleteModal.id) return;
          await handleDeleteEvent(deleteModal.id);
        }}
        title={t("deleteEvent")}
        message={t("deleteEventConfirmation")}
        isLoading={!!deletingId}
      />
    </>
  );
};

export default EventsTable;
