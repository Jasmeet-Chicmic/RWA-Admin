"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Edit3, Eye, Trash2 } from "lucide-react";

import StatusChip from "@/components/atoms/StatusChip";
import { TableColumn } from "@/components/atoms/Table";
import TableActions, {
  TableActionDisplayMode,
} from "@/components/atoms/TableActions";
import ConfirmationModal from "@/components/molecules/ConfirmationModal/ConfirmationModal";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { RentalIncomeModal } from "@/app/(secured)/properties/organisations/[organisationId]/RentalIncomeModal";
import { rentalIncomeService } from "@/services/rental-income-service";
import { LOGIN_ROLE } from "@/shared/constants";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import { PRIVATE_ROUTES } from "@/shared/routes";
import { useAppSelector } from "@/store/hooks";
import { formatDisplayCurrency, fromBaseUnits } from "@/shared/utils/unitUtils";
import { RentalIncomeListItem } from "@/types/rental-income";

export const RENTAL_INCOME_STATUS = {
  SUBMITTED: 1,
  DISTRIBUTED: 2,
} as const;

const RENT_STATUS_BADGE_CLASSES: Record<number, string> = {
  [RENTAL_INCOME_STATUS.SUBMITTED]:
    "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
  [RENTAL_INCOME_STATUS.DISTRIBUTED]:
    "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
};

const DEFAULT_STATUS_BADGE_CLASS =
  "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";

type RentManagementTableProps = {
  data: RentalIncomeListItem[];
  totalCount: number;
  isLoading?: boolean;
  onRefresh?: () => void;
};

const RentManagementTable = ({
  data,
  totalCount,
  isLoading = false,
  onRefresh,
}: RentManagementTableProps) => {
  const router = useRouter();
  const t = useTranslations("properties");
  const common = useTranslations("common");
  const { role } = useAppSelector((state) => state.authProfile);
  const isReadOnlyAdmin = role === LOGIN_ROLE.ADMIN;
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editLoadingId, setEditLoadingId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });
  const [editModal, setEditModal] = useState<{
    open: boolean;
    item: RentalIncomeListItem | null;
  }>({ open: false, item: null });
  const actionsDisplayMode: TableActionDisplayMode = "dropdown";

  const config: DataTableConfig<RentalIncomeListItem> = useMemo(() => {
    const columns: TableColumn<RentalIncomeListItem>[] = [
      {
        title: t("rentManagement.propertyName"),
        field: "property",
        render: (item) => {
          const propertyId = item.property?.id;
          const propertyName = item.property?.name || "—";
          if (!propertyId) {
            return (
              <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
                {propertyName}
              </span>
            );
          }
          return (
            <Link
              href={`${PRIVATE_ROUTES.ORGANISATIONS_PROPERTIES}/${propertyId}`}
              className={`underline ${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}
              title={propertyName}
            >
              {propertyName}
            </Link>
          );
        },
      },
      {
        title: t("rentManagement.status"),
        field: "status",
        render: (item) => {
          const statusLabel =
            item.status === RENTAL_INCOME_STATUS.SUBMITTED
              ? t("rentManagement.statusSubmitted")
              : item.status === RENTAL_INCOME_STATUS.DISTRIBUTED
                ? t("rentManagement.statusDistributed")
                : t("status");
          const badgeClass =
            RENT_STATUS_BADGE_CLASSES[item.status] ??
            DEFAULT_STATUS_BADGE_CLASS;
          return <StatusChip label={statusLabel} className={badgeClass} />;
        },
      },
      {
        title: t("rentManagement.amountReceived"),
        field: "amountReceived",
        align: "right",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {formatDisplayCurrency(fromBaseUnits(item.amountReceived))}
          </span>
        ),
      },
      {
        title: t("rentManagement.distributableIncome"),
        field: "distributableIncome",
        align: "right",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {formatDisplayCurrency(fromBaseUnits(item.distributableIncome))}
          </span>
        ),
      },
      {
        title: t("rentManagement.investorUsers"),
        field: "investorUsers",
        align: "center",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.investorUsers ?? 0}
          </span>
        ),
      },
      {
        title: common("actions"),
        field: "",
        align: "right",
        render: (item) => {
          const canEdit = item.status === RENTAL_INCOME_STATUS.SUBMITTED;
          const canDelete = item.status === RENTAL_INCOME_STATUS.SUBMITTED;
          const isEditLoading = editLoadingId === item.id;
          const isDeleting = deletingId === item.id;
          return (
            <div className="flex items-center justify-end">
              <TableActions
                displayMode={actionsDisplayMode}
                actions={[
                  {
                    id: `view-rental-income-${item.id}`,
                    label: common("view"),
                    icon: <Eye className="w-4 h-4" />,
                    onClick: () => {
                      router.push(
                        `${PRIVATE_ROUTES.RENT_MANAGEMENT}/${item.id}`,
                      );
                    },
                  },
                  ...(!isReadOnlyAdmin
                    ? [
                        {
                          id: `edit-rental-income-${item.id}`,
                          label: common("edit"),
                          disabled: !canEdit || isDeleting || isEditLoading,
                          icon: <Edit3 className="w-4 h-4" />,
                          onClick: () => {
                            if (!canEdit || isDeleting || isEditLoading) return;
                            void (async () => {
                              try {
                                setEditLoadingId(item.id);
                                const detailRes =
                                  await rentalIncomeService.getRentalIncomeDetail(
                                    {
                                      rentalIncomeId: item.id,
                                    },
                                  );
                                const detail = detailRes.data;
                                if (!detail) {
                                  throw new Error(
                                    t("rentManagement.editMissingFields"),
                                  );
                                }
                                setEditModal({ open: true, item: detail });
                              } catch (error) {
                                const message =
                                  error instanceof Error
                                    ? error.message
                                    : t("rentManagement.editError");
                                toast.error(
                                  message || t("rentManagement.editError"),
                                );
                              } finally {
                                setEditLoadingId(null);
                              }
                            })();
                          },
                        },
                        {
                          id: `delete-rental-income-${item.id}`,
                          label: common("delete"),
                          disabled: !canDelete || isDeleting || isEditLoading,
                          icon: <Trash2 className="w-4 h-4" />,
                          className: "text-red-600",
                          onClick: () => {
                            if (!canDelete || isDeleting) return;
                            setDeleteModal({ open: true, id: item.id });
                          },
                        },
                      ]
                    : []),
                ]}
              />
            </div>
          );
        },
      },
    ];

    return {
      columns,
      keyExtractor: (item) => item.id,
      paginationTitle: t("rentManagement.paginationTitle"),
      hideSelectCol: true,
      emptyMessage: t("rentManagement.noRecords"),
      searchPlaceholder: t("rentManagement.searchPlaceholder"),
      header: (
        <div>
          <h2
            className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
          >
            {t("rentManagement.title")}
          </h2>
          <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
            {t("rentManagement.subtitle")}
          </p>
        </div>
      ),
    };
  }, [common, deletingId, editLoadingId, isReadOnlyAdmin, router, t]);

  return (
    <>
      <DataTable<RentalIncomeListItem>
        data={data}
        totalCount={totalCount}
        isLoading={isLoading}
        config={config}
      />
      {!isReadOnlyAdmin && (
        <ConfirmationModal
          isOpen={deleteModal.open}
          onClose={() => {
            if (deletingId) return;
            setDeleteModal({ open: false, id: null });
          }}
          onConfirm={async () => {
            if (!deleteModal.id) return;
            try {
              setDeletingId(deleteModal.id);
              await rentalIncomeService.deleteRentalIncome({
                rentalIncomeId: deleteModal.id,
              });
              toast.success(t("rentManagement.deleteSuccess"));
              setDeleteModal({ open: false, id: null });
              onRefresh?.();
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : t("rentManagement.deleteError");
              toast.error(message || t("rentManagement.deleteError"));
            } finally {
              setDeletingId(null);
            }
          }}
          title={common("delete")}
          message={t("rentManagement.deleteConfirm")}
          isLoading={!!deletingId}
        />
      )}
      {!isReadOnlyAdmin && (
        <RentalIncomeModal
          open={editModal.open}
          onClose={() => setEditModal({ open: false, item: null })}
          onSuccess={onRefresh}
          property={
            editModal.item?.property
              ? {
                  id: editModal.item.property.id,
                }
              : null
          }
          mode="edit"
          rentalIncome={editModal.item}
        />
      )}
    </>
  );
};

export default RentManagementTable;
