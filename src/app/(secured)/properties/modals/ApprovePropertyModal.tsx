"use client";

import { Loader2, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";

import { uploadAdminPropertyDocumentsAction } from "@/api/adminPropertiesActions";
import { approvePropertyAction } from "@/api/allPropertiesActions";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import {
  PROPERTY_DOCUMENT_TYPE,
  PROPERTY_DOCUMENT_TYPE_LABELS,
} from "@/constants/properties";
import { PropertyDocument } from "@/types/properties";
import PropertyDocumentList from "../components/PropertyDocumentList";

interface ApprovePropertyModalProps {
  propertyId: string;
  propertyName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ApprovePropertyModal = ({
  propertyId,
  propertyName,
  isOpen,
  onClose,
  onSuccess,
}: ApprovePropertyModalProps) => {
  const t = useTranslations("properties");
  const [reason, setReason] = useState("");
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<number>(
    PROPERTY_DOCUMENT_TYPE.NOC,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const documentTypeOptions = useMemo(
    () =>
      Object.entries(PROPERTY_DOCUMENT_TYPE_LABELS).map(([val, label]) => ({
        value: Number(val),
        label,
      })),
    [],
  );

  const onDrop = async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      acceptedFiles.forEach((file) => formData.append("files", file));

      const res = await uploadAdminPropertyDocumentsAction(formData);

      if (res.status && res.data) {
        const newDocs: PropertyDocument[] = [];

        if (Array.isArray(res.data)) {
          (res.data as Array<{ url?: string; filePath?: string }>).forEach(
            (item) => {
              if (item.url) {
                newDocs.push({
                  type: selectedDocType,
                  fileName: item.filePath?.split("/").pop() || "document",
                  documentUrl: item.url,
                });
              }
            },
          );
        } else if (res.data.urls && res.data.filePaths) {
          (res.data.urls as string[]).forEach((url: string, index: number) => {
            newDocs.push({
              type: selectedDocType,
              fileName:
                (res.data as { filePaths: string[] }).filePaths[index]
                  ?.split("/")
                  .pop() || "document",
              documentUrl: url,
            });
          });
        }

        setDocuments((prev) => [...prev, ...newDocs]);
        toast.success(t("uploadSuccess"));
      } else {
        toast.error(res.message || t("uploadError"));
      }
    } catch {
      toast.error(t("uploadGenericError"));
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".jpg", ".jpeg", ".png"],
    },
    multiple: true,
  });

  if (!isOpen) return null;

  const handleDocumentTypeChange = (index: number, type: number) => {
    const updated = [...documents];
    updated[index].type = type;
    setDocuments(updated);
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        const res = await approvePropertyAction(propertyId, {
          reason: reason.trim(),
          documents,
        });

        if (res.status) {
          toast.success(t("approveSuccess"));
          onSuccess();
          onClose();
        } else {
          toast.error(res.message || t("approveError"));
        }
      } catch {
        toast.error(t("errorMessage"));
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-bgwhite dark:bg-darkbgprimary w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-bordergray200 dark:border-darkbordercolor1">
        {/* Header */}
        <div className="px-6 py-4 border-b border-bordergray200 dark:border-darkbordercolor1 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
          <div>
            <h3 className="text-lg font-bold text-bgblack dark:text-white">
              {t("approveProperty")}
            </h3>
            <p className="text-sm text-textprimary dark:text-secondary truncate max-w-[300px]">
              {propertyName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} className="text-textprimary dark:text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 custom-scrollbar max-h-[70vh] overflow-y-auto">
          {/* Reason */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-bgblack dark:text-white">
                {t("reasonForApproval")}
              </label>
              <span className="text-[10px] uppercase tracking-wider font-bold text-textprimary dark:text-secondary">
                {t("optional")}
              </span>
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-24 p-3 rounded-xl border border-bordergray200 dark:border-darkbordercolor1 bg-bgwhite dark:bg-darkbgbase text-sm focus:outline-none focus:ring-2 focus:ring-primarycolor transition-all resize-none dark:text-white"
              placeholder={t("approveReasonPlaceholder")}
            />
          </div>

          {/* Document Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-bgblack dark:text-white">
                {t("supportingDocuments")}
              </label>
              <span className="text-[10px] uppercase tracking-wider font-bold text-textprimary dark:text-secondary">
                {t("optional")}
              </span>
            </div>

            {/* Document Type Selector (BEFORE UPLOAD) */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-textprimary dark:text-secondary uppercase tracking-tight">
                {t("documentType")}
              </p>
              <Select
                value={
                  documentTypeOptions.find(
                    (option) => option.value === selectedDocType,
                  ) ?? null
                }
                options={documentTypeOptions}
                onChange={(option) => setSelectedDocType(Number(option?.value))}
              />
            </div>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 border-primarycolor/30 ${
                isDragActive
                  ? "border-emerald-500 bg-primarycolor dark:bg-primarycolor"
                  : "hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-full text-primarycolor/30">
                  <Upload size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-bgblack dark:text-white">
                    {t("uploadPlaceholder")}
                  </p>
                  <p className="text-xs text-textprimary dark:text-secondary mt-1">
                    {t("uploadLimitHint")}
                  </p>
                </div>
              </div>
            </div>

            {/* Uploading State */}
            {isUploading && (
              <div className="flex items-center gap-2 text-sm text-emerald-600 animate-pulse">
                <Loader2 size={16} className="animate-spin" />
                <span>{t("uploadingDocuments")}</span>
              </div>
            )}

            {/* Document List */}
            <PropertyDocumentList
              documents={documents}
              onTypeChange={handleDocumentTypeChange}
              onRemove={removeDocument}
              accentColorClass="emerald"
            />
          </div>
        </div>

        {/* Footer */}
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
            disabled={isUploading}
            className="rounded-xl px-8 h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
          >
            {t("approveProperty")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApprovePropertyModal;
