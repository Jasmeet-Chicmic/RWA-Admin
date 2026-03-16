"use client";

import React, {
  ComponentProps,
  ForwardedRef,
  forwardRef,
  useEffect,
  useState,
} from "react";
import NextImage from "next/image";
import { dummyProfile } from "@/assets";

type NextImageProps = ComponentProps<typeof NextImage>;

export interface ImageWithFallbackProps extends NextImageProps {
  /**
   * Optional custom fallback image source.
   * Defaults to `/fallback.png` from the public directory.
   */
  fallbackSrc?: string;
}

const ImageWithFallbackInner = (
  {
    src,
    alt,
    onError,
    onLoad,
    fallbackSrc = dummyProfile.src,
    ...rest
  }: ImageWithFallbackProps,
  ref: ForwardedRef<HTMLImageElement>,
) => {
  const [currentSrc, setCurrentSrc] = useState<NextImageProps["src"]>(src);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [hasFinalError, setHasFinalError] = useState(false);

  // Reset state whenever the original src changes
  useEffect(() => {
    setCurrentSrc(src);
    setIsUsingFallback(false);
    setHasFinalError(false);
  }, [src]);

  const handleLoad: NextImageProps["onLoad"] = (event) => {
    // Clear any previous error state when the image loads successfully
    setHasFinalError(false);
    onLoad?.(event);
  };

  const handleError: NextImageProps["onError"] = (event) => {
    onError?.(event);

    // If the original image fails, try the fallback once.
    if (!isUsingFallback) {
      setIsUsingFallback(true);
      setCurrentSrc(fallbackSrc);
      return;
    }

    // If the fallback also fails, stop trying to render images
    setHasFinalError(true);
  };

  // If both the original and fallback images fail, render nothing to avoid loops.
  if (hasFinalError) {
    return null;
  }

  return (
    <NextImage
      ref={ref}
      src={currentSrc}
      alt={alt}
      onLoad={handleLoad}
      onError={handleError}
      {...rest}
    />
  );
};

const ImageWithFallback = forwardRef<HTMLImageElement, ImageWithFallbackProps>(
  ImageWithFallbackInner,
);

ImageWithFallback.displayName = "ImageWithFallback";

export default ImageWithFallback;
