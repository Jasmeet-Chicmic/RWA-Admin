"use client";

import ActionMenu from "@/components/atoms/ActionMenu";
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
export const TABLE_ACTION_DISPLAY_MODES = {
  INLINE: "inline" as const,
  DROPDOWN: "dropdown" as const,
};

type TableActionsProps = {
  actions: TableActionItem[];
  displayMode?: TableActionDisplayMode;
  ariaLabel?: string;
};

const TableActions = ({
  actions,
  displayMode = TABLE_ACTION_DISPLAY_MODES.INLINE,
  ariaLabel = "Table row actions",
}: TableActionsProps) => {
  if (displayMode === TABLE_ACTION_DISPLAY_MODES.INLINE) {
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
    <ActionMenu
      ariaLabel={ariaLabel}
      trigger={
        <span className="inline-flex items-center justify-center rounded-md p-2 text-textprimary hover:bg-gray-100 dark:text-sidebartext dark:hover:bg-labelprimary">
          <MoreVertical size={16} />
        </span>
      }
      items={actions.map((action) => ({
        id: action.id,
        disabled: action.disabled,
        onClick: action.onClick,
        className: action.className,
        label: (
          <span className="inline-flex items-center gap-2">
            {action.icon}
            <span>{action.label}</span>
          </span>
        ),
      }))}
    />
  );
};

export default TableActions;
