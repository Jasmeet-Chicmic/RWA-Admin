"use client";

import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "../Button";

export type ExportFormat = "excel" | "csv";

interface ExportButtonProps {
  onExport: (format: ExportFormat) => void;
  isLoading?: boolean;
  className?: string;
}

const ExportButton = ({
  onExport,
  isLoading = false,
  className = "",
}: ExportButtonProps) => {
  const [showOptions, setShowOptions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFormatSelect = (format: ExportFormat) => {
    onExport(format);
    setShowOptions(false);
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <Button
        variant="outline"
        size="sm"
        leftIcon={<Download size={16} />}
        onClick={() => setShowOptions(!showOptions)}
        isLoading={isLoading}
      >
        Export
      </Button>
      {showOptions && (
        <div className="absolute right-0 mt-2 w-32 bg-bgwhite dark:bg-darkbgprimary rounded-md shadow-lg border bordergray200 dark:border-darkbgprimary z-50">
          <div className="py-1">
            <button
              onClick={() => handleFormatSelect("excel")}
              className="w-full text-left px-4 py-2 text-sm text-labelprimary dark:text-darklabelprimary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Excel
            </button>
            <button
              onClick={() => handleFormatSelect("csv")}
              className="w-full text-left px-4 py-2 text-sm text-labelprimary dark:text-darklabelprimary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
