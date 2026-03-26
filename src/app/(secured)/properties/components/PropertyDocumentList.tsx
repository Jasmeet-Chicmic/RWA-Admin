"use client";

import { FileText, Trash2, ChevronDown } from "lucide-react";
import { PropertyDocument } from "../helpers/allPropertiesTypes";
import { PROPERTY_DOCUMENT_TYPE_LABELS } from "../helpers/propertiesConstants";

interface PropertyDocumentListProps {
  documents: PropertyDocument[];
  onTypeChange: (index: number, type: number) => void;
  onRemove: (index: number) => void;
  accentColorClass?: string;
}

const PropertyDocumentList = ({
  documents,
  onTypeChange,
  onRemove,
  accentColorClass = "emerald",
}: PropertyDocumentListProps) => {
  if (documents.length === 0) return null;

  const accentBg =
    accentColorClass === "emerald"
      ? "bg-emerald-50 dark:bg-emerald-500/10"
      : "bg-red-50 dark:bg-red-500/10";
  const accentText =
    accentColorClass === "emerald" ? "text-emerald-600" : "text-red-600";
  const ringFocus =
    accentColorClass === "emerald"
      ? "focus:ring-emerald-500/50"
      : "focus:ring-red-500/50";

  return (
    <div className="space-y-2 mt-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar border-t border-bordergray200 dark:border-darkbordercolor1 pt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[11px] font-bold text-bgblack dark:text-white uppercase tracking-wider">
          Uploaded Documents ({documents.length})
        </h4>
      </div>
      {documents.map((doc, index) => (
        <div
          key={`${doc.documentUrl}-${index}`}
          className="flex items-center gap-3 p-3 rounded-xl border border-bordergray200 dark:border-darkbordercolor1 bg-white dark:bg-white/5 shadow-sm"
        >
          <div className={`p-2.5 ${accentBg} rounded-lg ${accentText}`}>
            <FileText size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-bgblack dark:text-white truncate">
              {doc.fileName}
            </p>
            <div className="mt-1.5 relative max-w-[160px]">
              <select
                value={doc.type}
                onChange={(e) => onTypeChange(index, Number(e.target.value))}
                className={`w-full text-[11px] font-medium bg-gray-50 dark:bg-darkbgbase border border-bordergray200 dark:border-darkbordercolor1 rounded-lg pl-2 pr-8 py-1.5 outline-none focus:ring-1 ${ringFocus} dark:text-white appearance-none cursor-pointer hover:border-emerald-500/50 transition-colors`}
              >
                {Object.entries(PROPERTY_DOCUMENT_TYPE_LABELS).map(
                  ([val, label]) => (
                    <option
                      key={val}
                      value={val}
                      className="dark:bg-darkbgprimary"
                    >
                      {label}
                    </option>
                  ),
                )}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-textprimary dark:text-secondary">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
          <button
            onClick={() => onRemove(index)}
            className="p-2.5 text-textprimary dark:text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default PropertyDocumentList;
