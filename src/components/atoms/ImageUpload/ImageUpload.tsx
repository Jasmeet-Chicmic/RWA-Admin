"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { BASE_URL } from "@/shared/constants";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";

// Upload file types
export const UPLOAD_FILE_TYPE = {
  BONUS_BACKGROUND_IMAGE: 1,
  ROOM_LOGO: 2,
  GAME_ICON: 3,
  DEFAULT: 1,
};

interface ImageUploadProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  uploadFunction?: (formData: FormData) => Promise<{
    status: boolean;
    message?: string;
    data?: { filePath: string };
  }>;
  fileType?: number;
  accept?: string;
  maxSize?: number; // in MB
  aspectRatio?: string; // e.g., "16/9", "1/1", "4/3"
  validateAspectRatio?: boolean; // Enable strict aspect ratio validation
  placeholder?: string;
  className?: string;
  previewClassName?: string;
  disabled?: boolean;
  id?: string;
}

const getImageSrc = (path: string) => {
  if (!path) return "";
  if (path.startsWith("blob:") || path.startsWith("http")) return path;
  const baseUrl = BASE_URL?.replace(/\/$/, "") || "";
  const encodedPath = encodeURI(path);
  return `${baseUrl}/${encodedPath}`;
};

const ImageUpload = ({
  label,
  value,
  onChange,
  required = false,
  uploadFunction,
  fileType = UPLOAD_FILE_TYPE.DEFAULT,
  accept = "image/*",
  maxSize = 5, // 5MB default
  aspectRatio = "16/9",
  validateAspectRatio = false,
  placeholder = "Click or drag to upload",
  className = "",
  previewClassName = "",
  disabled = false,
  id,
}: ImageUploadProps) => {
  const [preview, setPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();

  const inputId =
    id ||
    `image-upload-${label ? label.replaceAll(/\s+/g, "-").toLowerCase() : generatedId.replaceAll(":", "")}`;

  useEffect(() => {
    if (value) {
      setPreview(value);
    } else {
      setPreview("");
    }
  }, [value]);

  const validateAspectRatioAsync = (
    file: File,
    targetRatio: string,
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = document.createElement("img");
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const imageRatio = img.width / img.height;
        const [targetWidth, targetHeight] = targetRatio.split("/").map(Number);
        const targetRatioValue = targetWidth / targetHeight;

        // Allow 5% tolerance for aspect ratio (to account for rounding)
        const tolerance = targetRatioValue * 0.05;
        const isValid = Math.abs(imageRatio - targetRatioValue) <= tolerance;

        if (!isValid) {
          toast.error(`Incorrect image aspect ratio.`);
        }
        resolve(isValid);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(false);
      };

      img.src = objectUrl;
    });
  };

  const validateFile = async (file: File): Promise<boolean> => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return false;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return false;
    }

    // Validate aspect ratio if enabled
    if (validateAspectRatio && aspectRatio) {
      const isValidRatio = await validateAspectRatioAsync(file, aspectRatio);
      if (!isValidRatio) {
        return false;
      }
    }

    return true;
  };

  const handleFileUpload = async (file: File) => {
    const isValid = await validateFile(file);
    if (!isValid) return;

    const blobUrl = URL.createObjectURL(file);
    setPreview(blobUrl);
    setIsUploading(true);

    try {
      if (uploadFunction) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", String(fileType));

        const result = await uploadFunction(formData);
        if (result.status && result.data?.filePath) {
          setPreview(result.data.filePath);
          onChange(result.data.filePath);
          toast.success("Image uploaded successfully");
          URL.revokeObjectURL(blobUrl);
        } else {
          toast.error(result.message || "Failed to upload image");
          setPreview(value || "");
          URL.revokeObjectURL(blobUrl);
        }
      } else {
        // No upload function - just use blob URL for local preview
        onChange(blobUrl);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error uploading image");
      setPreview(value || "");
      URL.revokeObjectURL(blobUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input for re-upload
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview("");
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading && inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className={`${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <button
        type="button"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        disabled={disabled || isUploading}
        aria-label={label || "Upload image"}
        className={`
          relative overflow-hidden rounded-[20px] border-2 border-dashed transition-all duration-300 cursor-pointer group w-full text-left
          ${
            isDragging
              ? "border-b border-bordergray200gpurple1 bg-primarycolor/5 dark:bg-primarycolor/10"
              : preview
                ? "border-transparent"
                : "bordergray200 dark:border-darkbgprimary bg-gray-50/50 dark:bg-darkbgprimary/30 hover:border-b border-bordergray200gpurple1/50 hover:bg-primarycolor/5 dark:hover:bg-primarycolor/10"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${previewClassName}
        `}
        style={{ aspectRatio }}
      >
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {preview ? (
          // Preview state
          <div className="relative w-full h-full bg-[#042e14]">
            <Image
              src={getImageSrc(preview)}
              alt={label || "Uploaded image"}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105"
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bgbgblack/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <div className="flex gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isUploading || disabled}
                  className="p-3 bgbgwhite/90 dark:bg-darkbgprimary/90 text-red-500 rounded-2xl hover:bg-red-500 hover:text-bgwhite transition-all shadow-xl backdrop-blur-md"
                  title="Remove image"
                >
                  <X size={20} />
                </button>
                <button
                  type="button"
                  onClick={handleClick}
                  disabled={isUploading || disabled}
                  className="p-3 bg-primarycolor text-bgwhite rounded-2xl shadow-xl hover:bg-primarycolor/90 transition-all"
                  title="Change image"
                >
                  <Upload size={20} />
                </button>
              </div>
            </div>

            {/* Loading overlay */}
            {isUploading && (
              <div className="absolute inset-0 bgbgwhite/60 dark:bg-darkbgprimary/60 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={32} className="text-bgpurple1 animate-spin" />
                  <span className="text-xs font-bold text-bgpurple1 uppercase tracking-wider">
                    Uploading
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Empty state
          <div className="absolute inset-0 flex flex-col items-center justify-center bordercolor1 dark:text-gray-500 p-6">
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={40} className="text-bgpurple1 animate-spin" />
                <p className="text-sm font-bold text-bgpurple1 uppercase tracking-wider">
                  Processing...
                </p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-[20px] bg-bgwhite dark:bg-darkbgprimary flex items-center justify-center mb-4 shadow-sm border border-bordergray100 dark:border-labelprimary transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md">
                  {isDragging ? (
                    <Upload size={28} className="text-bgpurple1" />
                  ) : (
                    <ImageIcon
                      size={28}
                      className="text-bgpurple1 opacity-60"
                    />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-textprimary dark:text-gray-200 mb-1">
                    {isDragging ? "Drop to upload" : placeholder}
                  </p>
                  <p className="text-[12px] font-medium text-sidebartext dark:text-gray-500">
                    Supports JPG, PNG, GIF (Max {maxSize}MB)
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </button>
    </div>
  );
};

export default ImageUpload;
