"use client";

import { useCallback, useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import SearchToolbar from "@/components/atoms/SearchToolbar";
import Pagination from "@/components/atoms/Pagination";
import Table, { TableColumn } from "@/components/atoms/Table";
import ConfirmationModal from "@/components/molecules/ConfirmationModal/ConfirmationModal";
import {
  AdminEvent,
  EVENT_CATEGORY_LABELS,
  EVENT_FORMAT_LABELS,
  EVENT_STATUS,
  EVENT_STATUS_LABELS,
  TICKET_TYPE_LABEL_KEYS,
} from "@/app/(secured)/events/helpers/types";
import { deleteEventAction } from "@/api/events";
import FormattedDate from "@/components/atoms/FormattedDate";
import { useTableQuerySync } from "@/hooks/useTableQuerySync";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";

interface UserEventsTableProps {
  data: AdminEvent[];
  totalCount: number;
  userId: string;
  searchText: string;
}

const UserEventsTable = ({
  data,
  totalCount,
  searchText,
}: UserEventsTableProps) => {
  const router = useRouter();
  const t = useTranslations("events");

  const { currentPage, pageSize, handlePageChange, handlePageSizeChange } =
    useTableQuerySync({
      defaultPageSize: 10,
      defaultSortKey: "",
    });

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const columns: TableColumn<AdminEvent>[] = [
    {
      title: t("eventTitle"),
      field: "title",
      render: (item) => (
        <span
          className={`font-medium line-clamp-2 ${TEXT_PRIMARY}`}
          title={item.title}
        >
          {item.title || "—"}
        </span>
      ),
    },
    {
      title: t("eventCategory"),
      field: "eventCategory",
      render: (item) => (
        <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
          {EVENT_CATEGORY_LABELS[item.eventCategory] ?? "—"}
        </span>
      ),
    },
    {
      title: t("eventFormat"),
      field: "format",
      render: (item) => (
        <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
          {EVENT_FORMAT_LABELS[item.format] ?? "—"}
        </span>
      ),
    },
    {
      title: t("eventStatus"),
      field: "status",
      render: (item) => (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${TEXT_SIZE_SM} font-bold border ${getStatusStyle(item.status)}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(item.status)}`}
          />
          {EVENT_STATUS_LABELS[item.status] ?? "—"}
        </span>
      ),
    },
    {
      title: t("eventStartDate"),
      field: "startDateTime",
      render: (item) => (
        <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
          {item.startDateTime ? (
            <FormattedDate date={item.startDateTime} />
          ) : (
            "—"
          )}
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
      title: t("dateCreated"),
      field: "createdOn",
      render: (item) => (
        <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
          <FormattedDate date={item.createdOn} />
        </span>
      ),
    },
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

  return (
    <div className="min-w-0 w-full overflow-hidden space-y-4 bg-bgwhite dark:bg-darkbgprimary dark:border-darkbordercolor1 border border-b border-bordergray200ordercolor1 rounded-[20px] p-4 lg:p-5 3xl:p-6">
      <div className="bg-bgwhite dark:bg-darkbgprimary">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2
              className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
            >
              {t("userEvents")}
            </h2>
            <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
              {t("userEventsSubtitle")}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <SearchToolbar
              initialQuery={searchText}
              placeholder={t("searchEvents")}
              queryParamName="searchText"
            />
          </div>
        </div>
      </div>

      <div className="bg-bgwhite dark:bg-darkbgprimary overflow-x-auto">
        <Table<AdminEvent>
          data={data}
          columns={columns}
          keyExtractor={(item) => item.id}
          hideSelectCol
          emptyMessage={t("noEventsFound")}
        />
        <Pagination
          totalItems={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          title="events"
          className="!pb-0 border-b-0 !px-0"
        />
      </div>

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
    </div>
  );
};

export default UserEventsTable;
