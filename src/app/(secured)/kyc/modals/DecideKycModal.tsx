"use client";

import { AlertCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "react-toastify";

import { decideKycReviewAction } from "@/api/adminKyc";
import Button from "@/components/atoms/Button";
import { KYC_VERIFICATION_STATUSES } from "@/constants/kyc";

interface DecideKycModalProps {
  kycVerificationId: string;
  investorName: string;
  decision: "approve" | "reject";
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DecideKycModal = ({
  kycVerificationId,
  investorName,
  decision,
  isOpen,
  onClose,
  onSuccess,
}: DecideKycModalProps) => {
  const t = useTranslations("kyc");
  const common = useTranslations("common");
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const isReject = decision === "reject";

  const handleConfirm = () => {
    startTransition(async () => {
      const res = await decideKycReviewAction({
        kycVerificationId,
        status: isReject
          ? KYC_VERIFICATION_STATUSES.REJECTED
          : KYC_VERIFICATION_STATUSES.APPROVED,
        ...(isReject && reason.trim()
          ? { rejectionReason: reason.trim() }
          : {}),
      });

      if (res.status) {
        toast.success(isReject ? t("rejectSuccess") : t("approveSuccess"));
        onSuccess();
        onClose();
      } else {
        toast.error(
          res.message || (isReject ? t("rejectError") : t("approveError")),
        );
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-bgwhite dark:bg-darkbgprimary w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-bordergray200 dark:border-darkbordercolor1">
        <div
          className={`px-6 py-4 border-b border-bordergray200 dark:border-darkbordercolor1 flex items-center justify-between ${
            isReject
              ? "bg-red-50/50 dark:bg-red-500/5"
              : "bg-gray-50/50 dark:bg-white/5"
          }`}
        >
          <div className="flex items-center gap-3">
            {isReject && (
              <div className="p-2 bg-red-100 dark:bg-red-500/10 rounded-full text-red-600">
                <AlertCircle size={20} />
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-bgblack dark:text-white">
                {isReject ? t("rejectModalTitle") : t("approveModalTitle")}
              </h3>
              <p className="text-sm text-textprimary dark:text-secondary truncate max-w-[260px]">
                {investorName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} className="text-textprimary dark:text-secondary" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-textparagraph dark:text-textparagraphlight">
            {isReject
              ? t("rejectModalDescription")
              : t("approveModalDescription")}
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-bgblack dark:text-white">
                {t("reasonLabel")}
              </label>
              {!isReject && (
                <span className="text-[10px] uppercase tracking-wider font-bold text-textprimary dark:text-secondary">
                  {common("notApplicable")}
                </span>
              )}
            </div>
            <textarea
              disabled={!isReject}
              value={isReject ? reason : ""}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-24 p-3 rounded-xl border border-bordergray200 dark:border-darkbordercolor1 bg-bgwhite dark:bg-darkbgbase text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all resize-none dark:text-white disabled:opacity-50"
              placeholder={t("reasonPlaceholder")}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-bordergray200 dark:border-darkbordercolor1 bg-gray-50/50 dark:bg-white/5 flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl px-6 h-11"
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            isLoading={isPending}
            className={`rounded-xl px-8 h-11 text-white shadow-lg ${
              isReject
                ? "bg-red-600 hover:bg-red-700 shadow-red-500/20"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
            }`}
          >
            {isReject ? t("confirmReject") : t("confirmApprove")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DecideKycModal;
