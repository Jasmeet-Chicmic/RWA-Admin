"use client";

import { ChevronDown } from "lucide-react";

import CustomMenu from "@/components/atoms/Menu/Menu";
import { TEXT_SIZE_SM } from "@/shared/styles";

export interface StatusToggleMenuProps {
  /**
   * Current boolean status value.
   */
  isActive: boolean;
  /**
   * Whether an update operation is in progress.
   * Disables interactions and dims the button when true.
   */
  isLoading: boolean;
  /**
   * Label to show when the status is active.
   */
  activeLabel: string;
  /**
   * Label to show when the status is inactive.
   */
  inactiveLabel: string;
  /**
   * Called when the user selects a new status value.
   */
  onChange: (nextValue: boolean) => void;
}

const StatusToggleMenu = ({
  isActive,
  isLoading,
  activeLabel,
  inactiveLabel,
  onChange,
}: StatusToggleMenuProps) => {
  return (
    <CustomMenu
      menuButton={
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${TEXT_SIZE_SM} font-bold transition-all duration-200 border cursor-pointer ${
            isActive
              ? "bg-primarycolor/10 text-primarycolor border-primarycolor/20 dark:bg-primarycolor/10 dark:text-white/80 dark:border-secondarycolor/10"
              : "bg-red-50 text-red-600 border-red-500 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isActive ? "bg-primarycolor dark:bg-white/80" : "bg-red-500"
            }`}
          />
          {isActive ? activeLabel : inactiveLabel}
          <ChevronDown size={14} className="opacity-60" />
        </div>
      }
      items={[
        {
          label: (
            <div className="flex items-center gap-2 py-1">
              <div className="w-2 h-2 rounded-full bg-primarycolor dark:bg-white/80" />
              <span className="font-medium">{activeLabel}</span>
            </div>
          ),
          onClick: () => {
            if (!isLoading && !isActive) {
              onChange(true);
            }
          },
          disabled: isActive || isLoading,
        },
        {
          label: (
            <div className="flex items-center gap-2 py-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="font-medium">{inactiveLabel}</span>
            </div>
          ),
          onClick: () => {
            if (!isLoading && isActive) {
              onChange(false);
            }
          },
          disabled: !isActive || isLoading,
        },
      ]}
    />
  );
};

export default StatusToggleMenu;
