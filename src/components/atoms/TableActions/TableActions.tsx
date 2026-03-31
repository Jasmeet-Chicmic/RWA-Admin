"use client";

import ActionMenu from "@/components/atoms/ActionMenu";
import {
  Building2,
  Check,
  Coins,
  Edit3,
  Eye,
  MoreVertical,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
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

const toLabelText = (label: React.ReactNode): string => {
  if (typeof label === "string") return label.toLowerCase();
  if (typeof label === "number") return String(label).toLowerCase();
  return "";
};

const matchesAction = (action: TableActionItem, patterns: string[]) => {
  const id = action.id.toLowerCase();
  const label = toLabelText(action.label);
  return patterns.some(
    (pattern) => id.includes(pattern) || label.includes(pattern),
  );
};

const getDefaultActionIcon = (action: TableActionItem): React.ReactNode => {
  const iconProps = { className: "w-4 h-4" };

  if (matchesAction(action, ["view", "details"])) {
    return <Eye {...iconProps} />;
  }
  if (matchesAction(action, ["approve"])) return <Check {...iconProps} />;
  if (matchesAction(action, ["reject", "disapprove"])) {
    return <X {...iconProps} />;
  }
  if (matchesAction(action, ["assign", "organisation", "organization"])) {
    return <Building2 {...iconProps} />;
  }
  if (matchesAction(action, ["edit", "update"])) {
    return <Edit3 {...iconProps} />;
  }
  if (matchesAction(action, ["delete", "remove"])) {
    return <Trash2 {...iconProps} />;
  }
  if (matchesAction(action, ["distribute", "token", "mint"])) {
    return <Coins {...iconProps} />;
  }
  return <ShieldCheck {...iconProps} />;
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
            {action.icon ?? getDefaultActionIcon(action)}
            <span>{action.label}</span>
          </span>
        ),
      }))}
    />
  );
};

export default TableActions;
