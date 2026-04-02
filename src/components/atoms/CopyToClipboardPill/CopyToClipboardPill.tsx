"use client";

import { Copy } from "lucide-react";
import { useCallback } from "react";

export type CopyToClipboardPillProps = {
  value: string;
  displayValue?: string;
  title?: string;
  className?: string;
  onCopied?: () => void;
  showText?: boolean;
};

const DEFAULT_PILL_CLASS =
  "bg-primarycolor/10 text-primarycolor border-primarycolor/30 hover:bg-primarycolor/15 dark:bg-secondarycolor/15 dark:text-secondarycolor dark:border-secondarycolor/30 dark:hover:bg-secondarycolor/25 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors";

const CopyToClipboardPill = ({
  value,
  displayValue,
  title,
  className,
  onCopied,
  showText = true,
}: CopyToClipboardPillProps) => {
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    onCopied?.();
  }, [onCopied, value]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={title ?? value}
      className={`${DEFAULT_PILL_CLASS}${className ? ` ${className}` : ""}`}
    >
      {showText ? (
        <span className="max-w-[170px] truncate">{displayValue ?? value}</span>
      ) : null}
      <Copy size={12} />
    </button>
  );
};

export default CopyToClipboardPill;

