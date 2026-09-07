"use client";

import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import DecideKycModal from "../modals/DecideKycModal";
import Button from "@/components/atoms/Button";
import { KycReviewDetail } from "@/api/adminKyc.types";
import {
  KYC_LEVEL_LABELS,
  KYC_VERIFICATION_STATUSES,
  KYC_VERIFICATION_STATUS_BADGE_CLASSES,
  KYC_VERIFICATION_STATUS_LABELS,
  KycLevel,
  KycVerificationStatus,
  getKycDocumentLabel,
} from "@/constants/kyc";
import { TEXT_PRIMARY_DARK as TEXT_PRIMARY } from "@/shared/styles";

const formatDateTime = (iso: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
};

interface KycReviewDetailContentProps {
  detail: KycReviewDetail;
}

const KycReviewDetailContent = ({ detail }: KycReviewDetailContentProps) => {
  const t = useTranslations("kyc");
  const common = useTranslations("common");
  const router = useRouter();
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null);

  const isPending = detail.status === KYC_VERIFICATION_STATUSES.PENDING;
  const statusLabel =
    KYC_VERIFICATION_STATUS_LABELS[detail.status as KycVerificationStatus] ??
    String(detail.status);
  const statusBadgeClass =
    KYC_VERIFICATION_STATUS_BADGE_CLASSES[
      detail.status as KycVerificationStatus
    ] ?? "bg-gray-100 text-gray-700 border-gray-200";
  const levelLabel =
    KYC_LEVEL_LABELS[detail.kycLevel as KycLevel] ?? String(detail.kycLevel);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <button
        onClick={() => router.push("/kyc")}
        className="inline-flex items-center gap-2 text-sm font-medium text-textprimary dark:text-secondary hover:text-primarycolor dark:hover:text-secondarycolor transition-colors"
      >
        <ArrowLeft size={16} />
        {t("backToQueue")}
      </button>

      <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordergray200 dark:border-darkbordercolor1 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className={`text-xl font-bold ${TEXT_PRIMARY}`}>
              {detail.userProfile?.name || "-"}
            </h2>
            <p className="text-sm text-textprimary dark:text-secondary">
              {detail.userProfile?.email || "-"}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadgeClass}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {statusLabel}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-bordergray200 dark:border-darkbordercolor1">
          <div>
            <p className="text-[11px] font-bold text-textprimary dark:text-secondary uppercase tracking-wider">
              {t("kycLevel")}
            </p>
            <p className={`text-sm font-medium ${TEXT_PRIMARY}`}>
              {levelLabel}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-textprimary dark:text-secondary uppercase tracking-wider">
              {t("createdAt")}
            </p>
            <p className={`text-sm font-medium ${TEXT_PRIMARY}`}>
              {formatDateTime(detail.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-textprimary dark:text-secondary uppercase tracking-wider">
              {t("reviewedAt")}
            </p>
            <p className={`text-sm font-medium ${TEXT_PRIMARY}`}>
              {formatDateTime(detail.reviewedAt)}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-textprimary dark:text-secondary uppercase tracking-wider">
              {t("expiresAt")}
            </p>
            <p className={`text-sm font-medium ${TEXT_PRIMARY}`}>
              {formatDateTime(detail.expiresAt)}
            </p>
          </div>
        </div>

        {detail.rejectionReason && (
          <div className="p-3 bg-red-50 dark:bg-red-500/5 rounded-xl border border-red-100 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400 font-medium leading-relaxed">
            {detail.rejectionReason}
          </div>
        )}
      </div>

      <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordergray200 dark:border-darkbordercolor1 p-6 space-y-3">
        <h3
          className={`text-sm font-bold uppercase tracking-wider ${TEXT_PRIMARY}`}
        >
          {t("documents")} ({detail.documents.length})
        </h3>

        {detail.documents.length === 0 ? (
          <p className="text-sm text-textprimary dark:text-secondary">
            {t("noDocuments")}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {detail.documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-bordergray200 dark:border-darkbordercolor1 bg-white dark:bg-white/5 shadow-sm hover:border-primarycolor/50 transition-colors"
              >
                <div className="p-2.5 bg-gray-50 dark:bg-white/5 rounded-lg text-primarycolor">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-bgblack dark:text-white truncate">
                    {getKycDocumentLabel(doc.type)}
                  </p>
                  {doc.issuerName && (
                    <p className="text-[11px] text-textprimary dark:text-secondary truncate">
                      {doc.issuerName}
                    </p>
                  )}
                </div>
                <ExternalLink
                  size={16}
                  className="text-textprimary dark:text-secondary"
                />
              </a>
            ))}
          </div>
        )}
      </div>

      {isPending && (
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="danger"
            className="rounded-xl px-8 h-11"
            onClick={() => setDecision("reject")}
          >
            {t("reject")}
          </Button>
          <Button
            variant="success"
            className="rounded-xl px-8 h-11"
            onClick={() => setDecision("approve")}
          >
            {common("approve")}
          </Button>
        </div>
      )}

      {decision && (
        <DecideKycModal
          kycVerificationId={detail.id}
          investorName={detail.userProfile?.name || ""}
          decision={decision}
          isOpen
          onClose={() => setDecision(null)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
};

export default KycReviewDetailContent;
