"use client";

import CustomMenu from "@/components/atoms/Menu/Menu";
import { MoreVertical } from "lucide-react";
import React from "react";

export type TableActionItem = {
  id: string;
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
};

export type TableActionDisplayMode = "inline" | "dropdown";

type TableActionsProps = {
  actions: TableActionItem[];
  displayMode?: TableActionDisplayMode;
  ariaLabel?: string;
};

const TableActions = ({
  actions,
  displayMode = "inline",
  ariaLabel = "Table row actions",
}: TableActionsProps) => {
  if (displayMode === "inline") {
    return (
      <div
        className="flex items-center gap-2 justify-end"
        role="group"
        aria-label={ariaLabel}
      >
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            disabled={action.disabled}
            onClick={action.onClick}
            className={action.className}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="inline-flex">
      <CustomMenu
        menuButton={
          <button
            type="button"
            aria-label={ariaLabel}
            className="inline-flex items-center justify-center rounded-md p-2 text-textprimary hover:bg-gray-100 dark:text-sidebartext dark:hover:bg-labelprimary"
          >
            <MoreVertical size={16} />
          </button>
        }
        items={actions.map((action) => ({
          label: (
            <span
              className={`flex items-center gap-2 ${action.className || "text-textprimary dark:text-sidebartext"}`}
            >
              {action.icon}
              {action.label}
            </span>
          ),
          onClick: action.onClick,
          disabled: action.disabled,
        }))}
        itemClassName="!px-3 !py-2 !text-left !text-sm"
      />
    </div>
  );
};

export default TableActions;
