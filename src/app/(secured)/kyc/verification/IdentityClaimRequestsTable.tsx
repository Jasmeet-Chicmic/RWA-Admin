"use client";

import { Check, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  encodeAbiParameters,
  hexToBytes,
  keccak256,
  toBytes,
  type Address,
} from "viem";
import { useSignMessage } from "wagmi";

import {
  approveIdentityClaimRequestAction,
  rejectIdentityClaimRequestAction,
} from "@/api/adminKyc";
import { IdentityClaimRequestItem } from "@/api/adminKyc.types";
import CopyToClipboardPill from "@/components/atoms/CopyToClipboardPill/CopyToClipboardPill";
import { TableColumn } from "@/components/atoms/Table";
import TableActions, {
  TableActionDisplayMode,
} from "@/components/atoms/TableActions";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { CLAIM_TOPIC } from "@/constants/claimTopic";
import { TEXT_PRIMARY_DARK as TEXT_PRIMARY } from "@/shared/styles";
import { handleWeb3Error } from "@/shared/utils/web3Error";

type Row = IdentityClaimRequestItem;
type LoadingAction = "approve" | "reject_confirm";

const CLAIM_REQUEST_STATUS = {
  PENDING: 1,
  APPROVED: 2,
  REJECTED: 3,
  COMPLETED: 4,
} as const;

const TOPIC_STRINGS: Record<number, string> = {
  [CLAIM_TOPIC.KYC_APPROVED]: "KYC_APPROVED",
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
};

const truncateWallet = (address: string) =>
  address.length > 13
    ? `${address.slice(0, 6)}...${address.slice(address.length - 4)}`
    : address;

const claimTopicLabel = (
  topic: number,
  t: ReturnType<typeof useTranslations>,
): string => {
  if (topic === CLAIM_TOPIC.KYC_APPROVED) return t("topicKycApproved");
  return String(topic);
};

const buildClaimHash = (
  identityAddress: Address,
  topic: number,
  data: `0x${string}`,
): `0x${string}` => {
  const topicStr = TOPIC_STRINGS[topic] ?? String(topic);
  const topicHash = keccak256(toBytes(topicStr));
  // console.log("topicHash", topicHash);
  const encoded = encodeAbiParameters(
    [{ type: "address" }, { type: "uint256" }, { type: "bytes" }],
    [identityAddress, BigInt(topicHash), data],
  );
  return keccak256(encoded);
};

const claimStatusKey = (status: number | undefined) => {
  if (status === CLAIM_REQUEST_STATUS.PENDING) return "claimStatusPending";
  if (status === CLAIM_REQUEST_STATUS.APPROVED) return "claimStatusApproved";
  if (status === CLAIM_REQUEST_STATUS.REJECTED) return "claimStatusRejected";
  if (status === CLAIM_REQUEST_STATUS.COMPLETED) return "claimStatusCompleted";
  return "claimStatusUnknown";
};

const claimStatusBadgeClass = (status: number) => {
  if (status === CLAIM_REQUEST_STATUS.PENDING) {
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
  }
  if (status === CLAIM_REQUEST_STATUS.APPROVED) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
  }
  if (status === CLAIM_REQUEST_STATUS.REJECTED) {
    return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
  }
  if (status === CLAIM_REQUEST_STATUS.COMPLETED) {
    return "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800";
  }
  return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/40 dark:text-gray-300 dark:border-gray-600";
};

const IdentityClaimRequestsTable = ({
  data,
  totalCount,
}: {
  data: Row[];
  totalCount: number;
}) => {
  const t = useTranslations("kyc");
  const tTransactions = useTranslations("transactions");
  const common = useTranslations("common");
  const { signMessageAsync } = useSignMessage();
  const router = useRouter();
  const [loadingState, setLoadingState] = useState<{
    id: string;
    action: LoadingAction;
  } | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectRowId, setRejectRowId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const actionsDisplayMode: TableActionDisplayMode = "inline";

  const config: DataTableConfig<Row> = useMemo(() => {
    const columns: TableColumn<Row>[] = [
      {
        field: "user",
        title: t("walletAddress"),
        render: (item) => {
          const addr = item.user?.walletAddress;
          if (!addr) {
            return <span className={TEXT_PRIMARY}>-</span>;
          }
          return (
            <CopyToClipboardPill
              value={addr}
              displayValue={truncateWallet(addr)}
              title={addr}
              onCopied={() => toast.success(tTransactions("copiedToClipboard"))}
            />
          );
        },
      },
      {
        field: "topic",
        title: t("topic"),
        render: (item) => (
          <span className={TEXT_PRIMARY}>{claimTopicLabel(item.topic, t)}</span>
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
        field: "status",
        title: t("claimStatus"),
        render: (item) => (
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${claimStatusBadgeClass(item.status)}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {t(claimStatusKey(item.status))}
          </span>
        ),
      },
      {
        field: "",
        title: common("actions"),
        render: (item) => {
          const canAct = item.status === CLAIM_REQUEST_STATUS.PENDING;
          return (
            <TableActions
              displayMode={actionsDisplayMode}
              actions={(() => {
                const isApproving =
                  loadingState?.id === item.id &&
                  loadingState.action === "approve";
                const isRejectSubmitting =
                  loadingState?.id === item.id &&
                  loadingState.action === "reject_confirm";
                const isAnyActionLoading = isApproving || isRejectSubmitting;

                return [
                  {
                    id: "approve",
                    label: common("approve"),
                    disabled: isAnyActionLoading || !canAct,
                    className:
                      "inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-600 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed",
                    icon: isApproving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    ),
                    onClick: () => {
                      if (isAnyActionLoading || !item.id || !canAct) return;
                      void (async () => {
                        try {
                          setLoadingState({ id: item.id, action: "approve" });
                          const claimHash = buildClaimHash(
                            item.identityContractAddress as Address,
                            item.topic ?? CLAIM_TOPIC.KYC_APPROVED,
                            (item.data as `0x${string}`) ?? "0x",
                          );
                          console.log("claimHash", claimHash);
                          const signature = (await signMessageAsync({
                            message: { raw: hexToBytes(claimHash) },
                          })) as `0x${string}`;
                          const res = await approveIdentityClaimRequestAction(
                            item.id,
                            signature,
                          );
                          if (!res?.status || (res?.statusCode ?? 500) >= 400) {
                            throw new Error(
                              res?.message ||
                                "Failed to approve claim request.",
                            );
                          }
                          toast.success(common("approve"));
                          router.refresh();
                        } catch (error) {
                          toast.error(handleWeb3Error(error));
                        } finally {
                          setLoadingState(null);
                        }
                      })();
                    },
                  },
                  {
                    id: "reject",
                    label: t("disapprove"),
                    disabled: isAnyActionLoading || !canAct,
                    className:
                      "inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded bg-red-50 text-red-600 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed",
                    icon: isRejectSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    ),
                    onClick: () => {
                      if (isAnyActionLoading || !item.id || !canAct) return;
                      setRejectRowId(item.id);
                      setRejectReason("");
                      setRejectModalOpen(true);
                    },
                  },
                ];
              })()}
            />
          );
        },
      },
    ];

    return {
      columns,
      keyExtractor: (item) => item.id,
      paginationTitle: t("claimRequestsTitle"),
      hideSelectCol: true,
      emptyMessage: t("noClaimRequests"),
      header: (
        <div className="bg-bgwhite dark:bg-darkbgprimary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2
                className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
              >
                {t("claimRequestsTitle")}
              </h2>
              <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                {t("claimRequestsSubtitle")}
              </p>
            </div>
          </div>
        </div>
      ),
    };
  }, [common, loadingState, router, signMessageAsync, t, tTransactions]);

  return (
    <>
      <DataTable data={data} totalCount={totalCount} config={config} />

      {rejectModalOpen && rejectRowId && (
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
                  if (loadingState?.action === "reject_confirm") return;
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
                disabled={loadingState?.action === "reject_confirm"}
                onClick={() => {
                  if (
                    !rejectRowId ||
                    loadingState?.action === "reject_confirm"
                  ) {
                    return;
                  }
                  void (async () => {
                    try {
                      setLoadingState({
                        id: rejectRowId,
                        action: "reject_confirm",
                      });
                      const res = await rejectIdentityClaimRequestAction(
                        rejectRowId,
                        rejectReason,
                      );
                      if (!res?.status || (res?.statusCode ?? 500) >= 400) {
                        throw new Error(
                          res?.message || "Failed to disapprove claim request.",
                        );
                      }
                      setRejectModalOpen(false);
                      setRejectRowId(null);
                      setRejectReason("");
                      router.refresh();
                    } catch (error) {
                      toast.error(handleWeb3Error(error));
                    } finally {
                      setLoadingState(null);
                    }
                  })();
                }}
              >
                {t("confirmDisapprove")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IdentityClaimRequestsTable;
