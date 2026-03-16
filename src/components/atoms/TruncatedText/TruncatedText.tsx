"use client";

import React from "react";

import Tooltip from "@/components/atoms/Tooltip/Tooltip";
import { truncateText } from "@/shared/utils";

interface TruncatedTextProps {
  text: string | null | undefined;
  maxLength?: number;
  className?: string;
  tooltipId?: string;
}

const TruncatedText: React.FC<TruncatedTextProps> = ({
  text,
  maxLength = 50,
  className = "",
  tooltipId,
}) => {
  const safeText = text ?? "";
  const isTruncated = safeText.trim().length > maxLength;
  const displayText = truncateText(safeText, maxLength, "—");

  if (!safeText) {
    return <span className={className}>—</span>;
  }

  const id =
    tooltipId ?? `truncated-text-${Math.random().toString(36).slice(2)}`;

  if (!isTruncated) {
    return <span className={className}>{displayText}</span>;
  }

  return (
    <Tooltip id={id} content={safeText}>
      <span className={`cursor-help ${className}`}>{displayText}</span>
    </Tooltip>
  );
};

export default TruncatedText;
