import Link from "next/link";

import { ArrowLeft, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { getGroupDetailAction } from "@/api/groups";
import { AdminGroupDetail } from "@/app/(secured)/groups/helpers/types";
import { PRIVATE_ROUTES } from "@/shared/routes";
import ProfilePageLayout, {
  ProfileStat,
} from "@/components/layouts/ProfilePageLayout/ProfilePageLayout";
import GroupProfileCard from "@/components/molecules/group/GroupProfileCard";
import EventParticipantItem from "@/components/molecules/event/EventParticipantItem";
import FormattedDate from "@/components/atoms/FormattedDate";

const GroupViewPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const t = await getTranslations("groups");

  const response = await getGroupDetailAction(id);
  const group: AdminGroupDetail | undefined = response?.data;

  if (!group) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-2">
            {t("Group not found")}
          </p>
        </div>
      </div>
    );
  }

  const stats: ProfileStat[] = [
    {
      title: t("Members"),
      value: group.membersCount ?? 0,
      subtitle: t("Total members"),
      icon: <Users className="w-6 h-6 text-bgwhite dark:text-white" />,
      color: "bg-primarycolor dark:bg-secondarycolor",
    },
    {
      title: t("User Reports"),
      value: group.reportCount ?? 0,
      subtitle: t("Report Count by Users"),
      icon: <Users className="w-6 h-6 text-bgwhite dark:text-white" />,
      color: "bg-primarycolor dark:bg-secondarycolor",
    },
    {
      title: t("Group Activity Score"),
      value: group.healthScore ?? 0,
      subtitle: t("Group Activity Score"),
      icon: <Users className="w-6 h-6 text-bgwhite dark:text-white" />,
      color: "bg-primarycolor dark:bg-secondarycolor",
    },
  ];

  return (
    <>
      {/* Back to list */}
      <div className="flex mt-[20px] mb-2">
        <Link
          href={PRIVATE_ROUTES.GROUPS_LIST}
          className="inline-flex items-center gap-2 text-sm font-medium text-textparagraph dark:text-textparagraphlight hover:text-primarycolor dark:hover:text-primarycolor transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("Back to groups")}</span>
        </Link>
      </div>

      <ProfilePageLayout
        leftPanel={<GroupProfileCard group={group} />}
        stats={stats}
      >
        {/* Description */}
        {group.description && (
          <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-3 lg:p-4 3xl:p-6 space-y-2">
            <h3 className="text-[16px] md:text-lg font-semibold text-textprimary dark:text-sidebartext">
              {t("Description")}
            </h3>
            <p className="text-[15px] text-textparagraph dark:text-textparagraphlight">
              {group.description}
            </p>
          </div>
        )}

        {/* Rules */}
        {group.rules && (
          <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-3 lg:p-4 3xl:p-6 space-y-2">
            <h3 className="text-[16px] md:text-lg font-semibold text-textprimary dark:text-sidebartext">
              {t("Rules")}
            </h3>
            <div
              className="prose prose-sm max-w-none text-textparagraph dark:text-textparagraphlight prose-p:mb-2"
              dangerouslySetInnerHTML={{ __html: group.rules }}
            />
          </div>
        )}

        {/* Owner, admins, moderators & members */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Owner */}
          <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-4 space-y-3">
            <h3 className="text-[16px] md:text-lg font-semibold text-textprimary dark:text-sidebartext">
              {t("Owner")}
            </h3>
            <EventParticipantItem
              userId={group.owner.id}
              name={group.owner.fullName}
              email={group.owner.email}
              userProfilePicture={group.owner.profilePicture}
              avatarSize="w-10 h-10"
            />
          </div>

          {/* Admins */}
          <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-4 space-y-3">
            <h3 className="text-[16px] md:text-lg font-semibold text-textprimary dark:text-sidebartext">
              {t("Admins")}
            </h3>
            {group.admins.length ? (
              <div
                className={`space-y-3 ${
                  group.admins.length > 5
                    ? "max-h-72 overflow-y-auto pr-1 custom-scrollbar"
                    : ""
                }`}
              >
                <ul className="space-y-3">
                  {group.admins.map((admin) => (
                    <li key={admin.id}>
                      <EventParticipantItem
                        userId={admin.userId}
                        name={admin.fullName}
                        email={admin.email}
                        userProfilePicture={admin.profilePicture}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-textparagraph dark:text-textparagraphlight">
                {t("No admins available")}
              </p>
            )}
          </div>

          {/* Moderators */}
          <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-4 space-y-3">
            <h3 className="text-[16px] md:text-lg font-semibold text-textprimary dark:text-sidebartext">
              {t("Moderators")}
            </h3>
            {group.moderators && group.moderators.length ? (
              <div
                className={`space-y-3 ${
                  group.moderators.length > 5
                    ? "max-h-72 overflow-y-auto pr-1 custom-scrollbar"
                    : ""
                }`}
              >
                <ul className="space-y-3">
                  {group.moderators.map((mod) => (
                    <li key={mod.id}>
                      <EventParticipantItem
                        userId={mod.userId}
                        name={mod.fullName}
                        email={mod.email}
                        userProfilePicture={mod.profilePicture}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-textparagraph dark:text-textparagraphlight">
                {t("No moderators available")}
              </p>
            )}
          </div>

          {/* Members */}
          <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-4 space-y-3">
            <h3 className="text-[16px] md:text-lg font-semibold text-textprimary dark:text-sidebartext">
              {t("Members")}
            </h3>
            {group.members && group.members.length ? (
              <div
                className={`space-y-3 ${
                  group.members.length > 5
                    ? "max-h-72 overflow-y-auto pr-1 custom-scrollbar"
                    : ""
                }`}
              >
                <ul className="space-y-3">
                  {group.members.map((member) => (
                    <li key={member.id}>
                      <EventParticipantItem
                        userId={member.userId}
                        name={member.fullName}
                        email={member.email}
                        userProfilePicture={member.profilePicture}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-textparagraph dark:text-textparagraphlight">
                {t("No members available")}
              </p>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-4 space-y-1 text-sm text-textparagraph dark:text-textparagraphlight">
          <p className="text-[12px] lg:text-[14px]">
            <span className="text-[12px] lg:text-[14px] font-semibold">
              {t("Created On")}:
            </span>{" "}
            <FormattedDate date={group.createdOn} />
          </p>

          <p className="text-[12px] lg:text-[14px]">
            <span className="text-[12px] lg:text-[14px] font-semibold">
              {t("Closed")}:
            </span>{" "}
            {group.isClosed ? t("Yes") : t("No")}
          </p>
        </div>
      </ProfilePageLayout>
    </>
  );
};

export default GroupViewPage;
