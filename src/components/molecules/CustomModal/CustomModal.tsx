"use client";

import clsx from "clsx";
import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

import CheckClickOutside from "@/components/atoms/CheckClickOutside";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}
const sizeClassMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
};
const CustomModal = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  size = "lg",
}: ModalProps) => {
  // Close modal with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 dark:bg-black/40 backdrop-blur-sm overflow-y-auto py-8">
      <CheckClickOutside
        onClick={onClose}
        className={clsx("w-full px-4 my-auto", sizeClassMap[size], className)}
      >
        <div
          className={`bg-bgwhite dark:bg-darkbgprimary rounded-[20px] shadow-lg p-8 relative border border-bordercolor1 dark:border-bordercolor2 max-h-[90vh] flex flex-col ${className}`}
          role="dialog"
          aria-modal="true"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors z-10"
            aria-label="Close"
          >
            <X size={20} strokeWidth={2} />
          </button>

          {/* Title */}
          {title && (
            <h3 className="text-[1.25rem] lg:text-[1.5rem] font-bold mb-6 text-textprimary dark:text-sidebartext leading-none pr-8">
              {title}
            </h3>
          )}

          {/* Modal Content */}
          <div className="text-textparagraph dark:text-sidebartext/80 flex-1 min-h-0">
            {children}
          </div>
        </div>
      </CheckClickOutside>
    </div>
  );
};

export default CustomModal;
