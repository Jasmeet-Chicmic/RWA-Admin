"use client";
import React, { useState, useMemo, useEffect } from "react";
import { X } from "lucide-react";
import CheckClickOutside from "../CheckClickOutside";
import NextImage, { ImageProps } from "next/image";
import { BASE_URL } from "@/shared/constants";

const Image = ({
  src,
  alt,
  onClick = () => {},
  showModal = false,
  className = "",
  ...props
}: ImageProps & {
  showModal?: boolean;
}) => {
  const [isValid, setIsValid] = useState(true);
  const [modal, setModal] = useState(false);
  const handleImageLoad = () => {
    setIsValid(true);
  };

  const handleImageError = () => {
    setIsValid(false);
  };

  const imageSource = useMemo(() => {
    if (src) {
      setIsValid(true);
      // Check if the src has a valid image property
      const isFullUrl = /^(http|https):\/\//.test(src as string);
      return isFullUrl
        ? src
        : `${BASE_URL}${(src as string)?.startsWith("/") ? src : `/${src}`}`;
    } else {
      // If no valid URL is found, use a default image
      setIsValid(false);
    }
  }, [src]);
  const handleEscapeKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      console.log("Escape key pressed");
      setModal(false);
    }
  };
  useEffect(() => {
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);
  return isValid && imageSource ? (
    <>
      <NextImage
        src={imageSource}
        alt={alt || ""}
        onLoad={handleImageLoad}
        onError={handleImageError}
        onClick={(e) => {
          if (showModal) {
            setModal(true);
          }
          onClick(e);
        }}
        className={`${showModal ? "cursor-pointer" : ""} ${className}`}
        {...props}
      />
      {modal && imageSource ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-2">
          <CheckClickOutside onClick={() => setModal(false)}>
            <div className="bg-bgwhite dark:bg-darkbgprimary rounded-lg shadow-lg w-full max-w-sm mt-2 p-3 pt-10 relative">
              <button
                type="button"
                className="absolute top-2 right-2 p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
                onClick={() => setModal(false)}
                aria-label="Close image modal"
              >
                <X size={20} />
              </button>
              <NextImage
                src={imageSource}
                alt={alt || ""}
                onLoad={handleImageLoad}
                onError={handleImageError}
                {...props}
              />
            </div>
          </CheckClickOutside>
        </div>
      ) : null}
    </>
  ) : null;
};

export default Image;
