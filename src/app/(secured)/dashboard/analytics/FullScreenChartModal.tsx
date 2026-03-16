"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface FullScreenChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const FullScreenChartModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: FullScreenChartModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-8">
      <div className="bg-bgwhite dark:bg-darkbgprimary w-full h-full rounded-[20px] shadow-2xl overflow-hidden flex flex-col border border-bordergray200 dark:border-darkbordercolor1">
        <div className="flex items-center justify-between p-6 border-b border-bordergray200 dark:border-darkbordercolor1">
          <div>
            <h3 className="text-[1.25rem] lg:text-[1.5rem] font-bold text-textprimary dark:text-bgwhite">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-6 h-6 text-textprimary dark:text-bgwhite" />
          </button>
        </div>
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </div>
    </div>
  );
};

export default FullScreenChartModal;
