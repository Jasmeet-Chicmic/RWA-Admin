import { User, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  AdminGroupDetail,
  GROUP_TYPE_LABELS,
} from "@/app/(secured)/groups/helpers/types";
import { buildImageUrl } from "@/shared/utils";
import ProfileCardShell, {
  ProfileCardRow,
} from "@/components/molecules/ProfileCardShell";
import ImageWithFallback from "@/components/atoms/Image/ImageWithFallback";

const GroupProfileCard = ({ group }: { group: AdminGroupDetail }) => {
  const t = useTranslations("groups");

  const logoSrc = group.logoPicture ? buildImageUrl(group.logoPicture) : null;

  const avatar = (
    <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primarycolor/10 to-secondarycolor/10 dark:from-secondarycolor/20 dark:to-primarycolor/20 flex items-center justify-center p-1 overflow-hidden">
      {logoSrc ? (
        <ImageWithFallback
          src={logoSrc}
          alt={group.name}
          width={120}
          height={120}
          className="rounded-full object-cover w-full h-full"
        />
      ) : (
        <Users className="w-10 h-10 text-primarycolor dark:text-secondarycolor" />
      )}
    </div>
  );

  const statusSection = (
    <div className="flex flex-col items-center gap-3 mt-2">
      <div className="flex items-center gap-1 text-primarycolor dark:text-sidebartext/60">
        <User className="w-4 h-4" />
        <span className="text-[14px] md:text-[0.95rem] font-medium">
          {group.owner.fullName}
        </span>
      </div>
      <div
        className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-semibold ${
          group.isActive
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            group.isActive ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span>{group.isActive ? t("Active") : t("Inactive")}</span>
      </div>
    </div>
  );

  const rows: ProfileCardRow[] = [
    {
      icon: (
        <Users className="w-[25px] h-[25px] text-primarycolor dark:text-white" />
      ),
      label: t("Owner"),
      value: group.owner.email || "-",
    },
    {
      icon: (
        <Users className="w-[25px] h-[25px] text-primarycolor dark:text-white" />
      ),
      label: t("Type"),
      value: GROUP_TYPE_LABELS[group.type] ?? "-",
    },
    {
      icon: (
        <Users className="w-[25px] h-[25px] text-primarycolor dark:text-white" />
      ),
      label: t("Members"),
      value: String(group.membersCount ?? 0),
    },
    {
      icon: (
        <Users className="w-[25px] h-[25px] text-primarycolor dark:text-white" />
      ),
      label: t("Reports"),
      value: String(group.reportCount ?? 0),
    },
  ];

  return (
    <ProfileCardShell
      avatar={avatar}
      title={group.name}
      subtitle={group.tags ?? undefined}
      statusSection={statusSection}
      rows={rows}
    />
  );
};

export default GroupProfileCard;
