"use client";

import React, { useState, useCallback, useId } from "react";

export interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg" | "xl";
  interactive?: boolean;
  readonly?: boolean; // When true, makes component non-interactive (readonly mode)
  allowHalf?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
  starClassName?: string; // Custom class for individual stars
  variant?: "unicode" | "svg"; // Choose between Unicode or SVG stars
  filledColor?: string; // Custom color for filled stars (Tailwind class like 'text-yellow-400')
  emptyColor?: string; // Custom color for empty stars (Tailwind class like 'text-gray-300')
  showText?: boolean; // Show rating text next to stars
  showRating?: boolean; // Show numeric rating (when showText is true)
  disabled?: boolean; // Disable interaction even if interactive is true
  ariaLabel?: string; // Accessibility label
  legendText?: string; // Text for the screen reader legend (defaults to 'Rating')
}

// SVG Star Components
const StarEmpty = ({
  size,
  className,
}: {
  size: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke="#E5E7EB"
      strokeWidth="2"
      fill="transparent"
    />
  </svg>
);

const StarHalf = ({
  size,
  className,
  gradientId,
}: {
  size: number;
  className?: string;
  gradientId: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="50%" stopColor="#FCD34D" />
        <stop offset="50%" stopColor="transparent" />
      </linearGradient>
    </defs>
    <path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke="#E5E7EB"
      strokeWidth="2"
      fill={`url(#${gradientId})`}
    />
  </svg>
);

const StarFull = ({
  size,
  className,
  filledColor,
}: {
  size: number;
  className?: string;
  filledColor?: string;
}) => {
  // If filledColor is a Tailwind class, we'll apply it via className, otherwise use as inline style
  const fillColor =
    filledColor && !filledColor.startsWith("text-") ? filledColor : "#FCD34D";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill={fillColor}
        stroke="#F59E0B"
        strokeWidth="1"
      />
    </svg>
  );
};

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  readonly = false,
  allowHalf = false,
  onRatingChange,
  className = "",
  starClassName = "",
  variant = "svg",
  filledColor,
  emptyColor,
  showText = false,
  showRating = false,
  disabled = false,
  ariaLabel,
  legendText = "Rating",
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const gradientId = useId();

  // readonly takes precedence over interactive
  const isInteractive = !readonly && interactive && !disabled;

  // Size mapping for both SVG and Unicode
  const sizeMap = {
    sm: { svg: 14, unicode: "text-sm" },
    md: { svg: 20, unicode: "text-base" },
    lg: { svg: 24, unicode: "text-lg" },
    xl: { svg: 32, unicode: "text-2xl" },
  };

  const starSize = sizeMap[size].svg;
  const unicodeSizeClass = sizeMap[size].unicode;
  const displayRating = hoverRating ?? rating;

  const handleStarClick = useCallback(
    (starIndex: number) => {
      if (!isInteractive || !onRatingChange) return;

      const newRating = allowHalf ? starIndex + 0.5 : starIndex + 1;
      onRatingChange(Math.round(newRating)); // Round to whole number for now
    },
    [isInteractive, onRatingChange, allowHalf],
  );

  const handleStarHover = useCallback(
    (starIndex: number) => {
      if (!isInteractive) return;

      const newRating = allowHalf ? starIndex + 0.5 : starIndex + 1;
      setHoverRating(newRating);
    },
    [isInteractive, allowHalf],
  );

  const handleMouseLeave = useCallback(() => {
    if (!isInteractive) return;
    setHoverRating(null);
  }, [isInteractive]);

  const renderSVGStar = (index: number) => {
    const starValue = index + 1;
    const isFullStar = displayRating >= starValue;
    const isHalfStar =
      allowHalf &&
      displayRating >= starValue - 0.5 &&
      displayRating < starValue;

    const starClasses = isInteractive
      ? `${starClassName} cursor-pointer hover:scale-110 transition-transform`
      : starClassName;

    if (isFullStar) {
      return (
        <StarFull
          key={index}
          size={starSize}
          className={starClasses}
          filledColor={filledColor}
        />
      );
    } else if (isHalfStar) {
      return (
        <StarHalf
          key={index}
          size={starSize}
          className={starClasses}
          gradientId={gradientId}
        />
      );
    } else {
      return <StarEmpty key={index} size={starSize} className={starClasses} />;
    }
  };

  const renderUnicodeStar = (index: number) => {
    const starValue = index + 1;
    const isFilled = displayRating >= starValue;

    const filledColorClass = filledColor ?? "text-yellow-400";
    const emptyColorClass = emptyColor ?? "text-gray-300";
    const colorClass = isFilled ? filledColorClass : emptyColorClass;

    const baseClasses = `${unicodeSizeClass} ${starClassName} ${colorClass}`;
    const starClasses = isInteractive
      ? `${baseClasses} hover:text-yellow-400 transition-colors cursor-pointer`
      : baseClasses;

    const starLabel = starValue === 1 ? "star" : "stars";
    const ariaLabelText = isInteractive
      ? `Rate ${starValue} ${starLabel}`
      : undefined;

    return (
      <button
        key={index}
        type="button"
        className={starClasses}
        onClick={() => handleStarClick(index)}
        onMouseEnter={() => handleStarHover(index)}
        onKeyDown={(e) => {
          if (isInteractive && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleStarClick(index);
          }
        }}
        disabled={!isInteractive}
        aria-label={ariaLabelText}
        tabIndex={isInteractive ? 0 : -1}
      >
        ★
      </button>
    );
  };

  const ratingText = showText ? (
    <span className="ml-2 text-sm text-gray-600">
      {showRating && `${rating} `}
      star{rating === 1 ? "" : "s"}
    </span>
  ) : null;

  const defaultAriaLabel = isInteractive ? "Rate this item" : "Rating display";
  const componentAriaLabel = ariaLabel ?? defaultAriaLabel;

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      onMouseLeave={handleMouseLeave}
      aria-label={componentAriaLabel}
    >
      <fieldset
        className="flex items-center gap-1 border-none p-0 m-0"
        disabled={disabled}
      >
        {variant === "unicode" && isInteractive && (
          <legend className="sr-only">{legendText}</legend>
        )}
        {Array.from({ length: maxRating }, (_, index) => {
          if (variant === "svg") {
            const starNumber = index + 1;
            const starLabel = starNumber === 1 ? "star" : "stars";
            const ariaLabelText = isInteractive
              ? `Rate ${starNumber} ${starLabel}`
              : undefined;

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleStarClick(index)}
                onMouseEnter={() => handleStarHover(index)}
                onKeyDown={(e) => {
                  if (isInteractive && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    handleStarClick(index);
                  }
                }}
                className={isInteractive ? "cursor-pointer" : ""}
                disabled={!isInteractive}
                aria-label={ariaLabelText}
                tabIndex={isInteractive ? 0 : -1}
              >
                {renderSVGStar(index)}
              </button>
            );
          }
          return renderUnicodeStar(index);
        })}
      </fieldset>
      {ratingText}
    </div>
  );
};

export default StarRating;
