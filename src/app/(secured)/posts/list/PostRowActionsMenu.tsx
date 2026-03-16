"use client";

import { Eye, EyeOff, Flag, Star, StarOff } from "lucide-react";
import { useTranslations } from "next-intl";

import CustomModal from "@/components/molecules/CustomModal/CustomModal";
import {
  AdminPost,
  ADMIN_BULK_ACTION_TYPE,
  ADMIN_BULK_ACTION_TYPE_LABELS,
} from "../helpers/types";
import { TEXT_PRIMARY_DARK as TEXT_PRIMARY } from "@/shared/styles";

// ── Config ───────────────────────────────────────────────────

const BULK_ACTIONS_CONFIG = [
  {
    category: "Visibility & Status",
    actions: [
      {
        type: ADMIN_BULK_ACTION_TYPE.FEATURE_CONTENT,
        icon: Star,
        color: "text-amber-500",
      },
      {
        type: ADMIN_BULK_ACTION_TYPE.UNFEATURE_CONTENT,
        icon: StarOff,
        color: "text-gray-400",
      },
      {
        type: ADMIN_BULK_ACTION_TYPE.HIDE_CONTENT,
        icon: EyeOff,
        color: "text-gray-500",
      },
      {
        type: ADMIN_BULK_ACTION_TYPE.UNHIDE_CONTENT,
        icon: Eye,
        color: "text-primarycolor",
      },
    ],
  },
  {
    category: "Safety & Moderation",
    actions: [
      {
        type: ADMIN_BULK_ACTION_TYPE.FLAG_FOR_REVIEW,
        icon: Flag,
        color: "text-red-500",
      },
    ],
  },
];

function isActionEnabled(
  actionType: number,
  available: AdminPost["availableActions"],
): boolean {
  return (
    (actionType === ADMIN_BULK_ACTION_TYPE.FEATURE_CONTENT &&
      available.canFeature) ||
    (actionType === ADMIN_BULK_ACTION_TYPE.UNFEATURE_CONTENT &&
      available.canUnfeature) ||
    (actionType === ADMIN_BULK_ACTION_TYPE.FLAG_FOR_REVIEW &&
      available.canFlagForReview) ||
    (actionType === ADMIN_BULK_ACTION_TYPE.HIDE_CONTENT && available.canHide) ||
    (actionType === ADMIN_BULK_ACTION_TYPE.UNHIDE_CONTENT &&
      available.canUnhide)
  );
}

// ── Component ───────────────────────────────────────────────

export interface PostRowActionsMenuProps {
  isOpen: boolean;
  item: AdminPost | null;
  onClose: () => void;
  onSelectAction: (actionType: number, label: string, postId: string) => void;
}

const PostRowActionsMenu = ({
  isOpen,
  item,
  onClose,
  onSelectAction,
}: PostRowActionsMenuProps) => {
  const t = useTranslations("posts");

  if (!item) return null;

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("Post actions")}
      size="sm"
    >
      <div className="space-y-1">
        {BULK_ACTIONS_CONFIG.map((group, idx) => (
          <div key={group.category}>
            {idx > 0 && (
              <div className="my-2 border-t border-gray-100 dark:border-gray-800" />
            )}
            <div className="px-1 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {t(group.category)}
            </div>
            {group.actions.map((action) => {
              const Icon = action.icon;
              const label = t(ADMIN_BULK_ACTION_TYPE_LABELS[action.type]);
              const isEnabled = isActionEnabled(
                action.type,
                item.availableActions,
              );

              return (
                <button
                  key={action.type}
                  type="button"
                  disabled={!isEnabled}
                  onClick={() => {
                    if (!isEnabled) return;
                    onClose();
                    onSelectAction(action.type, label, item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    isEnabled
                      ? `${TEXT_PRIMARY} hover:bg-primarycolor/5 dark:hover:bg-secondarycolor/5`
                      : "text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-60"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 ${
                      isEnabled ? action.color : "text-gray-300"
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </CustomModal>
  );
};

export default PostRowActionsMenu;
