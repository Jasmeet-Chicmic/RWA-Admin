"use client";

import { EllipsisVertical, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ListingOptionType } from "./utils/types";

interface DropdownMenuProps {
  options: ListingOptionType[];
  onSelect?: (value: number) => void;
  isLoading?: boolean;
  disabledOptionValues?: number[];
}

const DropdownMenu = ({
  options,
  onSelect,
  isLoading = false,
  disabledOptionValues = [],
}: DropdownMenuProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative inline-flex">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={isLoading}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition disabled:opacity-60 disabled:cursor-not-allowed dark:hover:bg-gray-800"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-500 dark:bordercolor1" />
        ) : (
          <EllipsisVertical className="w-5 h-5 text-gray-500 dark:bordercolor1" />
        )}
      </button>

      {/* Dropdown content */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-36 bg-bgwhite rounded shadow-lg border border-bordergray100 z-50 dark:bg-darkbgprimary dark:border-darkbordercolor1">
          <ul className="py-1 text-sm text-labelprimary dark:bordercolor1">
            {options.map((option) => (
              <li key={option.value}>
                {(() => {
                  const isDisabled =
                    isLoading || disabledOptionValues.includes(option.value);

                  return (
                    <button
                      type="button"
                      onClick={() => {
                        if (isDisabled) return;
                        onSelect?.(option.value);
                        setOpen(false);
                      }}
                      disabled={isDisabled}
                      className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-gray-100 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed dark:hover:bg-primaryhover dark:text-white"
                    >
                      {option.icon && (
                        <span className="flex items-center">{option.icon}</span>
                      )}
                      <span>{option.label}</span>
                    </button>
                  );
                })()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
