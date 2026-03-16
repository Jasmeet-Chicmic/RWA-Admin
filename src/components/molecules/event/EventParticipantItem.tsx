"use client";

import Link from "next/link";
import React from "react";
import { buildImageUrl } from "@/shared/utils";
import ImageWithFallback from "@/components/atoms/Image/ImageWithFallback";

interface EventParticipantItemProps {
  userId: string;
  name?: string | null;
  email?: string | null;
  userProfilePicture?: string | null;
  avatarSize?: string;
  className?: string;
  children?: React.ReactNode;
  showEmail?: boolean;
  fallbackName?: string;
}

const EventParticipantItem = ({
  userId,
  name,
  email,
  userProfilePicture,
  avatarSize = "w-9 h-9",
  className = "",
  children,
  showEmail = true,
  fallbackName = "Unknown User",
}: EventParticipantItemProps) => {
  const displayName = name || fallbackName;
  const profileUrl = `/users/view/${userId}/account`;

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <Link href={profileUrl} className="flex-shrink-0">
        <div
          className={`${avatarSize} rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center text-xs font-semibold text-textprimary shadow-sm hover:opacity-80 transition-opacity`}
        >
          {userProfilePicture ? (
            <ImageWithFallback
              src={buildImageUrl(userProfilePicture)}
              alt={displayName}
              className="w-full h-full object-cover"
              width={40}
              height={40}
            />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </div>
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={profileUrl}
          className="block hover:text-primarycolor dark:hover:text-secondarycolor transition-colors"
        >
          <p className="text-[16px] font-semibold text-textprimary dark:text-sidebartext truncate">
            {displayName}
          </p>
          {showEmail && email && (
            <p className="text-[14px] text-textparagraph dark:text-textparagraphlight truncate mt-[4px] mb-[8px]">
              {email}
            </p>
          )}
        </Link>
        {children}
      </div>
    </div>
  );
};

export default EventParticipantItem;
