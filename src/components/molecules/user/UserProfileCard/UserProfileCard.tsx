import Image from "next/image";
import { MapPin, Mail, Phone, Briefcase, Star } from "lucide-react";
import { useTranslations } from "next-intl";

import { dummyProfile } from "@/assets";

import { User } from "@/shared/types";
import { Gender, GENDER_LABELS } from "@/shared/constants";
import {
  LEVEL_OF_SENIORITY,
  LEVEL_OF_SENIORITY_LABELS,
  BADGE_TYPE,
  BADGE_TYPE_KEYS,
} from "@/app/(secured)/users/helpers/constant";
import { buildDisplayName, buildImageUrl } from "@/shared/utils";
import ProfileCardShell, {
  ProfileCardRow,
} from "@/components/molecules/ProfileCardShell";

const UserProfileCard = ({ userData }: { userData: User }) => {
  const {
    fullName,
    firstName,
    lastName,
    email,
    phoneNumber,
    country,
    city,
    location,
    jobTitle,
    companyName,
    userProfilePicture,
    gender,
    isActive,
    levelOfSeniority,
    badgeType,
    isAdminBadgeAssigned,
    adminAssignedBadge,
  } = userData;

  const t = useTranslations("users");

  const displayName = buildDisplayName(fullName, firstName, lastName);

  const displayEmail = email || t("N/A");
  const displayPhone = phoneNumber || t("N/A");

  const displayGender = (() => {
    if (gender === null || gender === undefined || gender === "") {
      return t("N/A");
    }

    const numericGender = Number(gender);
    if (!Number.isNaN(numericGender) && numericGender in Gender) {
      return GENDER_LABELS[numericGender as Gender];
    }

    return gender;
  })();

  const displaySeniority = (() => {
    if (levelOfSeniority === null || levelOfSeniority === undefined) {
      return t("N/A");
    }
    return LEVEL_OF_SENIORITY_LABELS[levelOfSeniority as LEVEL_OF_SENIORITY];
  })();

  const displayBadge = (() => {
    const source =
      (isAdminBadgeAssigned ? adminAssignedBadge : badgeType) ?? null;
    if (source === null || source === undefined) {
      return t("N/A");
    }

    const numeric =
      typeof source === "string" ? Number(source) : (source as number);

    if (Number.isFinite(numeric) && BADGE_TYPE_KEYS[numeric as BADGE_TYPE]) {
      const key = BADGE_TYPE_KEYS[numeric as BADGE_TYPE];
      return t(key);
    }

    return t("N/A");
  })();

  const displayLocation =
    location ||
    [city, country]
      .filter((part) => part && part.trim().length > 0)
      .join(", ") ||
    t("Location not specified");

  const profileSrc =
    buildImageUrl(userProfilePicture) || (dummyProfile as unknown as string);

  const subtitle =
    jobTitle || companyName
      ? `${jobTitle ?? ""}${jobTitle && companyName ? " · " : ""}${
          companyName ?? ""
        }`
      : undefined;

  const statusSection = (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-1 text-primarycolor dark:text-sidebartext/60">
        <MapPin className="w-4 h-4" />
        <span className="text-[14px] md:text-[0.95rem] font-medium">
          {displayLocation}
        </span>
      </div>
      <div
        className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-semibold ${
          isActive
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isActive ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span>{isActive ? t("Active") : t("Inactive")}</span>
      </div>
    </div>
  );

  const rows: ProfileCardRow[] = [
    {
      icon: (
        <Mail className="w-[25px] h-[25px] text-primarycolor dark:text-white" />
      ),
      label: t("Email Address"),
      value: displayEmail,
    },
    {
      icon: (
        <Phone className="w-[25px] h-[25px] text-primarycolor dark:text-white" />
      ),
      label: t("Contact Number"),
      value: displayPhone,
    },
    {
      icon: (
        <span className="text-[25px] font-semibold text-primarycolor dark:text-white">
          {t("Gender").charAt(0)}
        </span>
      ),
      label: t("Gender"),
      value: displayGender,
    },
    {
      icon: (
        <Briefcase className="w-[25px] h-[25px] text-primarycolor dark:text-secondarycolor" />
      ),
      label: t("Seniority Level"),
      value: displaySeniority,
    },
    {
      icon: (
        <Star className="w-[25px] h-[25px] text-primarycolor dark:text-secondarycolor" />
      ),
      label: t("Admin Badge"),
      value: displayBadge,
    },
  ];

  const avatar = (
    <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primarycolor/10 to-secondarycolor/10 dark:from-secondarycolor/20 dark:to-primarycolor/20 flex items-center justify-center p-1">
      <Image
        src={profileSrc}
        alt={displayName}
        width={120}
        height={120}
        className="rounded-full object-cover"
      />
    </div>
  );

  return (
    <ProfileCardShell
      avatar={avatar}
      title={displayName}
      subtitle={subtitle}
      statusSection={statusSection}
      rows={rows}
    />
  );
};

export default UserProfileCard;
