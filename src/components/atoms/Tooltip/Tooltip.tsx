"use client";

import React from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";

const TOOLTIP_PLACE = {
  TOP: "top",
  BOTTOM: "bottom",
  LEFT: "left",
  RIGHT: "right",
} as const;

type TooltipPlace = (typeof TOOLTIP_PLACE)[keyof typeof TOOLTIP_PLACE];

interface TooltipProps {
  id: string;
  content: string;
  children: React.ReactNode;
  place?: TooltipPlace;
  className?: string;
  delayShow?: number;
  delayHide?: number;
}

const Tooltip = ({
  id,
  content,
  children,
  place = TOOLTIP_PLACE.TOP,
  className = "",
  delayShow = 200,
  delayHide = 100,
}: TooltipProps) => {
  return (
    <>
      <span
        data-tooltip-id={id}
        data-tooltip-content={content}
        className={className}
      >
        {children}
      </span>
      <ReactTooltip
        id={id}
        place={place}
        delayShow={delayShow}
        delayHide={delayHide}
        className="!rounded-lg !px-3 !py-1.5 !text-xs !font-medium !shadow-lg !z-[9999] !max-w-[500px] !break-words !whitespace-pre-wrap !bg-gray-900 !text-white dark:!bg-gray-100 dark:!text-gray-900"
      />
    </>
  );
};

export { TOOLTIP_PLACE };
export type { TooltipProps, TooltipPlace };
export default Tooltip;
