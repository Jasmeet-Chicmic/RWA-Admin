"use client";

import { AdminWhitelistRequestItem } from "@/api/adminKyc.types";
import { rejectWhitelistRequestAction } from "@/api/adminKyc";
import {
  AssignablePropertyItem,
  getAssignablePropertiesAction,
  registerIdentityCompletionAction,
} from "@/api/user";
import CopyToClipboardPill from "@/components/atoms/CopyToClipboardPill/CopyToClipboardPill";
import SearchInput from "@/components/atoms/SearchInput/SearchInput";
import { useWalletState } from "@/components/providers/WalletStateProvider";
import { TableColumn } from "@/components/atoms/Table";
import FilterSidebar from "@/components/molecules/FilterSidebar/FilterSidebar";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { WHITELIST_REQUEST_STATUS } from "@/constants/whitelistRequests";
import { useDebounce } from "@/hooks/useDebounce";
import {
  IDENTITY_REGISTRY_ABI,
  TOKEN_ABI,
} from "@/lib/contracts/tokenization/abis";
import { buildGasConfig } from "@/lib/contracts/tokenization/gasConfig";
import { TEXT_PRIMARY_DARK as TEXT_PRIMARY } from "@/shared/styles";
import { handleWeb3Error } from "@/shared/utils/web3Error";
import {
  CheckCircle2,
  ChevronDown,
  Loader2,
  Menu,
  RotateCcw,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Address } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { useAppKit } from "@reown/appkit/react";

type Row = AdminWhitelistRequestItem;

const formatDateTime = (iso?: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
};

const truncateWallet = (address: string) =>
  address.length > 13
    ? `${address.slice(0, 6)}...${address.slice(address.length - 4)}`
    : address;

const statusLabelKey = (status: number) => {
  if (status === WHITELIST_REQUEST_STATUS.PENDING) return "claimStatusPending";
  if (status === WHITELIST_REQUEST_STATUS.APPROVED)
    return "claimStatusApproved";
  if (status === WHITELIST_REQUEST_STATUS.REJECTED)
    return "claimStatusRejected";
  return "claimStatusUnknown";
};

const statusBadgeClass = (status: number) => {
  if (status === WHITELIST_REQUEST_STATUS.PENDING) {
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
  }
  if (status === WHITELIST_REQUEST_STATUS.APPROVED) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
  }
  if (status === WHITELIST_REQUEST_STATUS.REJECTED) {
    return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
  }
  return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/40 dark:text-gray-300 dark:border-gray-600";
};

const RegisterPropertyRequestsTable = ({
  data,
  totalCount,
}: {
  data: Row[];
  totalCount: number;
}) => {
  const t = useTranslations("kyc");
  const tCommon = useTranslations("common");
  const tUsers = useTranslations("users");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { isConnected } = useWalletState();
  const { open } = useAppKit();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const initialSearch = searchParams.get("searchText") ?? "";
  const [searchValue, setSearchValue] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchValue, 500);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loadingState, setLoadingState] = useState<{
    id: string;
    action: "register" | "reject";
  } | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectRowId, setRejectRowId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const statusFilterValue = searchParams.get("status") ?? "";

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const currentSearch = params.get("searchText") || "";
    const newSearch = debouncedSearch || "";
    if (newSearch !== currentSearch) {
      if (newSearch) {
        params.set("searchText", newSearch);
      } else {
        params.delete("searchText");
      }
      params.delete("skip");
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [debouncedSearch, router, searchParams]);

  const updateStatusFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("skip");
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setIsFilterOpen(false);
    router.push(pathname);
  };

  const handleRegisterIdentity = useCallback(
    async (row: Row) => {
      if (!row.user?.id || !row.user.walletAddress || !row.property?.id) {
        toast.error(tUsers("missingIdentityOrTokenAddress"));
        return;
      }
      if (!isConnected) {
        open();
        return;
      }
      if (!walletClient || !publicClient) {
        toast.error(tUsers("walletNotReady"));
        return;
      }

      try {
        setLoadingState({ id: row.id, action: "register" });
        const assignableRes = await getAssignablePropertiesAction({
          userId: row.user.id,
          page: 1,
          pageSize: 100,
        });
        const assignableItems =
          (assignableRes?.data?.items as
            | AssignablePropertyItem[]
            | undefined) ?? [];
        const selectedProperty = assignableItems.find(
          (item) => item.id === row.property?.id,
        );
        const tokenAddress = selectedProperty?.tokenAddress as
          | Address
          | undefined;
        const identityAddress = row.user?.identityContractAddress as
          | Address
          | undefined;
        if (!tokenAddress || !identityAddress) {
          toast.error(tUsers("missingIdentityOrTokenAddress"));
          return;
        }

        const identityRegistryAddress = (await publicClient.readContract({
          address: tokenAddress,
          abi: TOKEN_ABI,
          functionName: "identityRegistry",
        })) as Address;
        const gasConfig = buildGasConfig(walletClient.chain?.id);
        const txHash = await walletClient.writeContract({
          address: identityRegistryAddress,
          abi: IDENTITY_REGISTRY_ABI,
          functionName: "registerIdentity",
          args: [row.user.walletAddress as Address, identityAddress, 42],
          account: walletClient.account!,
          chain: walletClient.chain,
          gas: BigInt(800000),
          maxPriorityFeePerGas: gasConfig.maxPriorityFeePerGas,
          maxFeePerGas: gasConfig.maxFeePerGas,
        });
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });
        if (receipt.status !== "success") {
          throw new Error("registerIdentity transaction failed.");
        }

        const backendRes = await registerIdentityCompletionAction({
          propertyId: row.property.id,
          userId: row.user.id,
          transactionHash: receipt.transactionHash,
        });
        if (!backendRes?.status || (backendRes?.statusCode ?? 500) >= 400) {
          throw new Error(
            backendRes?.message || tUsers("registerIdentityBackendFailed"),
          );
        }
        toast.success(backendRes?.message || tUsers("registerIdentitySuccess"));
        router.refresh();
      } catch (error) {
        toast.error(handleWeb3Error(error));
      } finally {
        setLoadingState(null);
      }
    },
    [isConnected, open, publicClient, router, tUsers, walletClient],
  );

  const handleRejectConfirm = useCallback(async () => {
    if (!rejectRowId) return;
    try {
      setLoadingState({ id: rejectRowId, action: "reject" });
      const res = await rejectWhitelistRequestAction({
        whitelistRequestId: rejectRowId,
        reason: rejectReason,
      });
      if (!res?.status || (res?.statusCode ?? 500) >= 400) {
        throw new Error(res?.message || "Failed to reject whitelist request.");
      }
      setRejectModalOpen(false);
      setRejectRowId(null);
      setRejectReason("");
      toast.success(res?.message || t("confirmDisapprove"));
      router.refresh();
    } catch (error) {
      toast.error(handleWeb3Error(error));
    } finally {
      setLoadingState(null);
    }
  }, [rejectReason, rejectRowId, router, t]);

  const config: DataTableConfig<Row> = useMemo(() => {
    const columns: TableColumn<Row>[] = [
      {
        field: "user",
        title: t("walletAddress"),
        render: (item) => {
          const addr = item.user?.walletAddress;
          if (!addr) return <span className={TEXT_PRIMARY}>-</span>;
          return (
            <CopyToClipboardPill
              value={addr}
              displayValue={truncateWallet(addr)}
              title={addr}
              onCopied={() => toast.success(tCommon("copiedToClipboard"))}
            />
          );
        },
      },
      {
        field: "property",
        title: tCommon("properties"),
        render: (item) => (
          <span className={TEXT_PRIMARY}>{item.property?.name || "-"}</span>
        ),
      },
      {
        field: "status",
        title: t("claimStatus"),
        render: (item) => (
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadgeClass(item.status)}`}
          >
            {item.status === WHITELIST_REQUEST_STATUS.APPROVED ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : item.status === WHITELIST_REQUEST_STATUS.REJECTED ? (
              <XCircle className="w-3.5 h-3.5" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            )}
            {t(statusLabelKey(item.status))}
          </span>
        ),
      },
      {
        field: "createdAt",
        title: t("createdAt"),
        render: (item) => (
          <span className={TEXT_PRIMARY}>{formatDateTime(item.createdAt)}</span>
        ),
      },
      {
        field: "approvedAt",
        title: t("claimStatusApproved"),
        render: (item) => (
          <span className={TEXT_PRIMARY}>
            {formatDateTime(item.approvedAt)}
          </span>
        ),
      },
      {
        field: "rejectionReason",
        title: t("rejectionReason"),
        render: (item) => (
          <span
            className={`max-w-[220px] truncate block ${TEXT_PRIMARY}`}
            title={item.rejectionReason ?? ""}
          >
            {item.rejectionReason || "-"}
          </span>
        ),
      },
      {
        field: "",
        title: tCommon("actions"),
        render: (item) => {
          const canAct = item.status === WHITELIST_REQUEST_STATUS.PENDING;
          const isRegistering =
            loadingState?.id === item.id && loadingState.action === "register";
          const isRejecting =
            loadingState?.id === item.id && loadingState.action === "reject";

          return (
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                title={tUsers("registerIdentityAction")}
                aria-label={tUsers("registerIdentityAction")}
                disabled={isRegistering || isRejecting || !canAct}
                onClick={() => void handleRegisterIdentity(item)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isRegistering ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                title={t("disapprove")}
                aria-label={t("disapprove")}
                disabled={isRegistering || isRejecting || !canAct}
                onClick={() => {
                  setRejectRowId(item.id);
                  setRejectReason("");
                  setRejectModalOpen(true);
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isRejecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </button>
            </div>
          );
        },
      },
    ];

    return {
      columns,
      keyExtractor: (item) => item.id,
      paginationTitle: tCommon("registerPropertyRequests"),
      hideSelectCol: true,
      emptyMessage: t("noClaimRequests"),
      header: (
        <div className="bg-bgwhite dark:bg-darkbgprimary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2
                className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
              >
                {tCommon("registerPropertyRequests")}
              </h2>
              <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                {t("claimRequestsSubtitle")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <SearchInput
                value={searchValue}
                onChange={setSearchValue}
                placeholder={t("searchPlaceholder")}
                className="w-full sm:w-[250px] md:w-[320px]"
              />
              <button
                type="button"
                onClick={() => setIsFilterOpen(true)}
                className="inline-flex h-[42px] items-center gap-2 rounded-xl border border-primarycolor px-4 py-2 font-semibold text-black transition-all duration-200 hover:opacity-90 dark:border-secondarycolor dark:bg-secondarycolor dark:text-black bg-primarycolor"
              >
                <Menu size={16} strokeWidth={2.25} />
                <span>{t("filters")}</span>
              </button>
            </div>
          </div>
        </div>
      ),
    };
  }, [handleRegisterIdentity, loadingState, searchValue, t, tCommon, tUsers]);

  return (
    <>
      <DataTable data={data} totalCount={totalCount} config={config} />
      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title={t("filters")}
        footer={
          <button
            type="button"
            onClick={clearFilters}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 dark:bg-darkbgprimary text-labelprimary dark:text-darklabelprimary rounded-xl hover:bg-gray-200 dark:hover:bg-labelprimary transition-all border bordergray200 dark:border-labelprimary font-medium"
          >
            <RotateCcw size={18} />
            <span>{t("clearAllFilters")}</span>
          </button>
        }
      >
        <div>
          <label
            htmlFor="whitelist-status-filter"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-textparagraph dark:text-textparagraphlight"
          >
            {t("claimStatus")}
          </label>
          <div className="relative">
            <select
              id="whitelist-status-filter"
              value={statusFilterValue}
              onChange={(e) => updateStatusFilter(e.target.value)}
              className="appearance-none pr-8 pl-4 py-3 w-full border border-bordergray200 bg-bgwhite dark:bg-darkbgprimary rounded-[10px] focus:outline-none transition-all duration-200 text-bgblack dark:text-white text-sm cursor-pointer dark:border-darkbordercolor1"
            >
              <option value="">{t("allStatuses")}</option>
              <option value={String(WHITELIST_REQUEST_STATUS.PENDING)}>
                {t("claimStatusPending")}
              </option>
              <option value={String(WHITELIST_REQUEST_STATUS.APPROVED)}>
                {t("claimStatusApproved")}
              </option>
              <option value={String(WHITELIST_REQUEST_STATUS.REJECTED)}>
                {t("claimStatusRejected")}
              </option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textprimary dark:text-secondary pointer-events-none"
              size={16}
            />
          </div>
        </div>
      </FilterSidebar>
      {rejectModalOpen && rejectRowId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-bgwhite p-6 shadow-lg dark:bg-darkbgprimary">
            <h2 className={`mb-2 text-lg font-semibold ${TEXT_PRIMARY}`}>
              {t("disapproveModalTitle")}
            </h2>
            <p className="mb-4 text-sm text-textparagraph dark:text-textparagraphlight">
              {t("disapproveModalDescription")}
            </p>
            <label className="mb-1 block text-xs font-medium text-labelprimary dark:text-darklabelprimary">
              {t("reasonOptionalLabel")}
            </label>
            <textarea
              className="mb-4 h-24 w-full resize-none rounded-lg border border-bordergray200 bg-bgwhite px-3 py-2 text-sm text-textprimary focus:outline-none focus:ring-1 focus:ring-primarycolor dark:border-darkbordercolor1 dark:bg-darkbgbase dark:text-white"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t("reasonPlaceholder")}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-bordergray200 px-4 py-2 text-sm font-medium text-textprimary hover:bg-gray-50 dark:border-darkbordercolor1 dark:text-darklabelprimary dark:hover:bg-darkbgbase"
                onClick={() => {
                  if (loadingState?.action === "reject") return;
                  setRejectModalOpen(false);
                  setRejectRowId(null);
                  setRejectReason("");
                }}
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
                disabled={loadingState?.action === "reject"}
                onClick={() => void handleRejectConfirm()}
              >
                {t("confirmDisapprove")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default RegisterPropertyRequestsTable;
