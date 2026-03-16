"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

export interface SeeMoreProps {
  description: string;
  maxLines?: number;
  className?: string;
}

export default function SeeMore({
  description,
  maxLines = 2,
  className = "",
}: SeeMoreProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [truncatedText, setTruncatedText] = useState(description);
  const [needsTruncate, setNeedsTruncate] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("common");

  useEffect(() => {
    if (!description?.trim()) {
      setNeedsTruncate(false);
      setTruncatedText(description);
      return;
    }

    const measure = () => {
      if (!containerRef.current || !measureRef.current) return;

      const style = getComputedStyle(containerRef.current);
      const lineHeight = parseFloat(style.lineHeight || "20");
      const maxHeight = lineHeight * maxLines;
      const el = measureRef.current;

      el.innerText = description;
      if (el.scrollHeight <= maxHeight) {
        setNeedsTruncate(false);
        setTruncatedText(description);
        return;
      }

      setNeedsTruncate(true);
      let left = 0;
      let right = description.length;
      let bestFit = description;
      const seeMoreSuffix = `... ${t("See more")}`;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        el.innerText = description.substring(0, mid) + seeMoreSuffix;

        if (el.scrollHeight <= maxHeight) {
          bestFit = description.substring(0, mid);
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      setTruncatedText(bestFit.trim());
    };

    const timeoutId = setTimeout(measure, 10);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", measure);
    };
  }, [description, maxLines, t]);

  if (!description?.trim()) return null;

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", maxWidth: "100%" }}
    >
      <div
        ref={measureRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          height: "auto",
          overflow: "visible",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          pointerEvents: "none",
        }}
        aria-hidden
      />

      {isExpanded ? (
        <div
          ref={containerRef}
          className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words"
        >
          {description}{" "}
          {needsTruncate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className="text-primarycolor dark:text-secondarycolor hover:underline font-medium"
            >
              {t("See less")}
            </button>
          )}
        </div>
      ) : (
        <div
          ref={containerRef}
          className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words"
        >
          {needsTruncate ? (
            <>
              {truncatedText}...{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                }}
                className="text-primarycolor dark:text-secondarycolor hover:underline font-medium"
              >
                {t("See more")}
              </button>
            </>
          ) : (
            description
          )}
        </div>
      )}
    </div>
  );
}
