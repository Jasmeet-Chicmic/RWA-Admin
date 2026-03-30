"use client";
import { Plus, ChevronDown, Pencil, Trash2, Eye } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import {
  deleteAdminPromoCodeAction,
  updateAdminPromoCodeAction,
} from "@/api/promoCodes";
import Button from "@/components/atoms/Button";
import CustomMenu from "@/components/atoms/Menu/Menu";
import { TableHeaderWithInfo } from "@/components/atoms/TableHeaderWithInfo";
import Pagination from "@/components/atoms/Pagination";
import SearchToolbar from "@/components/atoms/SearchToolbar";
import Table, { TableColumn } from "@/components/atoms/Table";
import ConfirmationModal from "@/components/molecules/ConfirmationModal/ConfirmationModal";
import { PromoCode, SORT_DIRECTION, SORT_DIRECTIONS } from "@/shared/types";
import {
  PROMO_DISCOUNT_TYPE,
  PROMO_DISCOUNT_TYPE_LABELS,
  PROMO_DURATION,
  PROMO_DURATION_LABELS,
} from "@/shared/constants";
import {
  TEXT_SIZE_SM,
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
} from "@/shared/styles";

import AddPromoCodeModal from "./AddPromoCodeModal";

const PromoCodesTable = ({
  data,
  searchText,
}: {
  data: { data: PromoCode[]; count: number };
  searchText: string;
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState<
    PromoCode | undefined
  >(undefined);
  const [modal, setModal] = useState<{
    open: boolean;
    data?: PromoCode;
  }>({ open: false });
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<SORT_DIRECTION>(
    SORT_DIRECTIONS.ASC,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const t = useTranslations("promoCodes");
  const tCommon = useTranslations("common");

  const handleToggleStatus = useCallback(
    async (promoCode: PromoCode, newStatus: boolean) => {
      const promoId = promoCode.id || promoCode._id;
      if (!promoId) {
        toast.error(
          tCommon("{entity} ID is missing", { entity: t("promoCode") }),
        );
        return;
      }

      setIsActionLoading(`status-${promoId}`);
      try {
        const res = await updateAdminPromoCodeAction({
          id: promoId as string,
          description: promoCode.description || "",
          validFrom: promoCode.validFrom || new Date().toISOString(),
          validUntil: promoCode.validUntil || null,
          isActive: newStatus,
        });
        if (res.success && res.statusCode === 200) {
          toast.success(
            res.message ||
              tCommon("{entity} {action} successfully", {
                entity: t("promoCodeStatus"),
                action: tCommon("updated"),
              }),
          );
          router.refresh();
        } else {
          toast.error(
            res.message ||
              tCommon("Failed to {action} {entity}", {
                action: tCommon("update"),
                entity: t("promoCodeStatus").toLowerCase(),
              }),
          );
        }
      } catch (error) {
        console.error("Error updating promo code status:", error);
        toast.error(
          tCommon("An error occurred while {action} {entity}", {
            action: tCommon("updating"),
            entity: t("promoCodeStatus").toLowerCase(),
          }),
        );
      } finally {
        setIsActionLoading(null);
      }
    },
    [router, t, tCommon],
  );

  const handleEditPromoCode = useCallback((item: PromoCode) => {
    // Use the item directly from the list, ensuring it has an id
    setSelectedPromoCode({
      ...item,
      id: item.id || (item._id as string),
    });
    setOpen(true);
  }, []);

  const handleDeleteClick = useCallback((item: PromoCode) => {
    setModal({ open: true, data: item });
  }, []);

  const handleViewPromoCode = useCallback(
    (item: PromoCode) => {
      const promoId = item.id || item._id;
      if (!promoId) {
        toast.error(
          tCommon("{entity} ID is missing", { entity: t("promoCode") }),
        );
        return;
      }
      router.push(`/promo-codes/view/${promoId}`, { scroll: false });
    },
    [router, t, tCommon],
  );

  const columns: TableColumn<PromoCode>[] = [
    {
      title: t("promoCode"),
      field: "code",
    },
    {
      title: t("promoTitle"),
      field: "title",
      sortable: true,
      sortKey: "description",
    },
    {
      title: t("discountValueAndType"),
      field: "discountValue",
      render: (item) => {
        const type = item.discountType as PROMO_DISCOUNT_TYPE | undefined;
        const value = item.discountValue;
        const currency = item.currency || "";
        if (!type || value == null) return "-";

        if (type === PROMO_DISCOUNT_TYPE.PERCENTAGE) {
          return `${value}% (${PROMO_DISCOUNT_TYPE_LABELS[type]})`;
        }

        return `${value} ${currency} (${PROMO_DISCOUNT_TYPE_LABELS[type]})`;
      },
    },
    {
      title: t("validDuration"),
      field: "duration",
      render: (item) => {
        const duration = item.duration as PROMO_DURATION | undefined;
        if (!duration) return "-";
        const label = PROMO_DURATION_LABELS[duration];
        if (duration === PROMO_DURATION.REPEATING && item.durationInMonths) {
          return `${label} (${item.durationInMonths} ${t("months")})`;
        }
        return label;
      },
    },
    {
      title: t("timesRedeemed"),
      field: "redemptionCount",
      render: (item) => (
        <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
          {item.redemptionCount ?? 0}
        </span>
      ),
    },
    {
      title: t("maxUsageLimit"),
      field: "maxRedemptions",
      render: (item) => (
        <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
          {item.maxRedemptions ?? 0}
        </span>
      ),
    },
    {
      title: (
        <TableHeaderWithInfo
          label={t("promoStatus")}
          options={[t("active"), t("inactive")]}
        />
      ),
      field: "isActive",
      render: (item) => {
        const isActive = item.isActive ?? false;
        const promoId = item.id || item._id || "";
        const isLoading = isActionLoading === `status-${promoId}`;

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
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? "bg-primarycolor dark:bg-white/80" : "bg-red-500"
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
                onClick: () => void handleToggleStatus(item, true),
                disabled: isActive || isLoading,
              },
              {
                label: (
                  <div className="flex items-center gap-2 py-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="font-medium">{t("inactive")}</span>
                  </div>
                ),
                onClick: () => void handleToggleStatus(item, false),
                disabled: !isActive || isLoading,
              },
            ]}
          />
        );
      },
      sortable: true,
      sortKey: "isActive",
    },
    {
      title: t("actions"),
      field: "",
      render: (item) => (
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => handleViewPromoCode(item)}
            className="text-gray-500 hover:text-primarycolor dark:hover:text-secondarycolor transition-colors dark:text-sidebartext"
            title={tCommon("View")}
          >
            <Eye size={18} />
          </button>
          <button
            type="button"
            onClick={() => handleEditPromoCode(item)}
            className="text-gray-500 hover:text-primarycolor dark:hover:text-secondarycolor transition-colors dark:text-sidebartext"
            title={t("edit")}
          >
            <Pencil size={18} />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteClick(item)}
            className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors dark:text-sidebartext"
            title={t("delete")}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
      fixed: "right",
    },
  ];
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (currentPage > 1) {
      newParams.set("skip", ((currentPage - 1) * pageSize).toString());
    } else {
      newParams.delete("skip"); // Optional: clean URL
    }

    if (pageSize !== 10) {
      newParams.set("limit", pageSize.toString());
    } else {
      newParams.delete("limit");
    }
    if (sortKey) {
      newParams.set("sortKey", sortKey);
      newParams.set("sortDirection", sortDirection.toString());
    } else {
      newParams.delete("sortKey");
      newParams.delete("sortDirection");
    }

    router.push(`?${newParams.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, sortKey, sortDirection]);
  const handleDelete = async () => {
    const promoId = modal.data?.id || modal.data?._id;
    if (!promoId) {
      toast.error(t("promoCodeIdIsMissing"));
      return;
    }

    try {
      const res = await deleteAdminPromoCodeAction(promoId as string);
      if (res.success && res.statusCode === 200) {
        toast.success(
          res.message ||
            tCommon("{entity} {action} successfully", {
              entity: t("promoCode"),
              action: tCommon("deleted"),
            }),
        );
        router.refresh();
        setModal({ open: false });
      } else {
        toast.error(
          res.message ||
            tCommon("Failed to {action} {entity}", {
              action: tCommon("delete"),
              entity: t("promoCode").toLowerCase(),
            }),
        );
      }
    } catch (error) {
      console.error("Error deleting promo code:", error);
      toast.error(
        tCommon("An error occurred while {action} {entity}", {
          action: tCommon("deleting"),
          entity: t("promoCode").toLowerCase(),
        }),
      );
    }
  };
  return (
    <>
      {/* Header bar (match Podcasts / Users style) */}
      <div className="bg-bgwhite px-5 3xl:px-6 pt-5 3xl:pt-7 pb-3 rounded-[20px_20px_0_0] dark:bg-darkbgprimary dark:border-darkbordercolor1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2
              className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
            >
              {t("promoCodes")}
            </h2>
            <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
              {t("promoCodesSubtitle")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-initial gap-3 space-x-0">
            <SearchToolbar
              initialQuery={searchText}
              placeholder={t("searchPromoCode")}
              queryParamName="searchText"
            />
            <Button
              variant="primary"
              type="button"
              className="flex-none min-h-[46px]"
              onClick={() => setOpen(true)}
            >
              <Plus size={18} />
              <span>{t("addNewPromoCode")}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Table container */}
      <div className="bg-bgwhite dark:bg-darkbgprimary rounded-b-[20px] overflow-hidden">
        <Table<PromoCode>
          data={data?.data || []}
          columns={columns}
          keyExtractor={(item) => (item._id as string) || item.id || ""}
          handleSort={(sortKey, sortDirection) => {
            setSortKey(sortKey);
            setSortDirection(sortDirection);
          }}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
        />
        <Pagination
          totalItems={data?.count ?? 0}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page + 1)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1); // reset to first page
          }}
          title="promo codes"
        />
      </div>

      <ConfirmationModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false })}
        onConfirm={handleDelete}
        title={t("deletePromoCode")}
        message={t("areYouSureYouWantToDeleteThisPromoCode")}
      />
      <AddPromoCodeModal
        open={open}
        setOpen={setOpen}
        promoCode={selectedPromoCode}
        setSelectedPromoCode={setSelectedPromoCode}
      />
    </>
  );
};

export default PromoCodesTable;
