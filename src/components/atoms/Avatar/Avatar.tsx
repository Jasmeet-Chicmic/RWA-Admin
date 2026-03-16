import * as React from "react";
import Image from "../Image";

type AvatarProps = {
  className?: string;
  children: React.ReactNode;
};

export function Avatar({ children, className = "" }: AvatarProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full overflow-hidden bg-gray-200 ${className}`}
    >
      {children}
    </div>
  );
}

type AvatarImageProps = {
  src?: string;
  alt?: string;
};

export function AvatarImage({ src = "", alt = "Avatar" }: AvatarImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      className="w-full h-full object-cover rounded-full"
    />
  );
}

type AvatarFallbackProps = {
  children: React.ReactNode;
};

export function AvatarFallback({ children }: AvatarFallbackProps) {
  return (
    <div className="flex items-center justify-center w-full h-full bg-darklabelprimary text-sm font-medium text-bgwhite">
      {children}
    </div>
  );
}
