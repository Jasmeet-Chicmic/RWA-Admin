import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  Globe2,
  MapPin,
  Users,
  Star,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { getEventDetailAction } from "@/api/events";
import { AdminEventDetail } from "@/app/(secured)/events/helpers/types";
import { PRIVATE_ROUTES } from "@/shared/routes";
import { normalizeHtml } from "@/shared/utils";
import { formatToFixed } from "@/shared/utils/unitUtils";
import FormattedDate from "@/components/atoms/FormattedDate";
import ProfilePageLayout, {
  ProfileStat,
} from "@/components/layouts/ProfilePageLayout/ProfilePageLayout";
import EventProfileCard from "@/components/molecules/event/EventProfileCard";
import EventParticipantItem from "@/components/molecules/event/EventParticipantItem";
import StarRating from "@/components/atoms/StarRating";

const EventViewPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const t = await getTranslations("events");

  const response = await getEventDetailAction(id);
  const event: AdminEventDetail | undefined = response?.data;

  if (!event) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-2">
            {t("eventNotFound")}
          </p>
        </div>
      </div>
    );
  }

  const normalizedDescription = normalizeHtml(event.description);

  const eventStats: ProfileStat[] = [
    {
      title: t("attendees"),
      value: event.attendeesCount ?? 0,
      subtitle: t("totalAttendees"),
      icon: <Users className="w-6 h-6 text-bgwhite dark:text-white" />,
      color: "bg-primarycolor dark:bg-secondarycolor",
    },
    {
      title: t("speakers"),
      value: event.speakersCount ?? 0,
      subtitle: t("totalSpeakers"),
      icon: <Users className="w-6 h-6 text-bgwhite dark:text-white" />,
      color: "bg-primarycolor dark:bg-secondarycolor",
    },
    {
      title: t("createdOn"),
      value: <FormattedDate date={event.createdOn} showTime={false} />,
      subtitle: t("createdOn"),
      icon: <CalendarDays className="w-6 h-6 text-bgwhite dark:text-white" />,
      color: "bg-primarycolor dark:bg-secondarycolor",
    },
  ];

  return (
    <>
      {/* Back to list */}
      <div className="flex mt-[20px] mb-2">
        <Link
          href={PRIVATE_ROUTES.EVENTS_LIST}
          className="inline-flex items-center gap-2 text-sm font-medium text-textparagraph dark:text-textparagraphlight hover:text-primarycolor dark:hover:text-primarycolor transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("backToEvents")}</span>
        </Link>
      </div>

      <ProfilePageLayout
        leftPanel={<EventProfileCard event={event} />}
        stats={eventStats}
      >
        {/* Description */}
        {normalizedDescription && (
          <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-3 lg:p-4 3xl:p-6 space-y-2">
            <h3 className="text-[16px] md:text-lg font-semibold text-textprimary dark:text-sidebartext">
              {t("description")}
            </h3>
            <div
              className="prose prose-sm max-w-none break-words text-bgblack font-normal dark:text-white/80 prose-p:mb-2"
              dangerouslySetInnerHTML={{ __html: normalizedDescription }}
            />
          </div>
        )}

        {/* Meta grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-3 lg:p-4 3xl:p-6 flex items-start gap-3">
            <CalendarDays className="w-5 h-5 text-primarycolor dark:text-white mt-1" />
            <div>
              <h3 className="text-[16px] md:text-lg font-semibold text-textprimary dark:text-sidebartext">
                {t("eventSchedule")}
              </h3>
              <p className="text-sm font-medium text-textprimary dark:text-sidebartext mt-1">
                <FormattedDate date={event.startDateTime} showTime={false} />{" "}
                <span className="text-xs text-textparagraph dark:text-textparagraphlight">
                  {t("to")}
                </span>{" "}
                <FormattedDate date={event.endDateTime} showTime={false} />
              </p>
            </div>
          </div>

          <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-3 lg:p-4 3xl:p-6 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primarycolor dark:text-white mt-1" />
            <div>
              <h3 className="text-[16px] md:text-lg font-semibold text-textprimary dark:text-sidebartext">
                {t("location")}
              </h3>
              <p className="text-sm font-medium text-textprimary dark:text-sidebartext mt-1">
                {event.venue ||
                  event.locationSummary ||
                  [event.city, event.country].filter(Boolean).join(", ") ||
                  t("locationNotSpecified")}
              </p>
            </div>
          </div>

          <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-3 lg:p-4 3xl:p-6 flex items-start gap-3">
            <Star className="w-5 h-5 text-primarycolor dark:text-white mt-1" />
            <div className="flex-1">
              <h3 className="text-[16px] md:text-lg font-semibold text-textprimary dark:text-sidebartext mb-1">
                {t("rating")}
              </h3>
              <div className="flex items-center gap-2 flex-wrap 3xl:flex-nowrap">
                <StarRating
                  rating={event.averageRating ?? 0}
                  readonly
                  allowHalf
                  size="sm"
                  variant="svg"
                  filledColor="#FCD34D"
                />
                <span className="text-sm font-semibold text-textprimary dark:text-sidebartext">
                  {formatToFixed(event.averageRating ?? 0, 2)} / 5
                </span>
                <span className="text-xs text-textparagraph dark:text-textparagraphlight">
                  ({event.ratingCount ?? 0}{" "}
                  {event.ratingCount === 1 ? t("rating") : t("ratings")})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement */}
        {/* <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-3 lg:p-4 3xl:p-6 flex items-start gap-3">
          <Users className="w-5 h-5 text-primarycolor dark:text-white mt-1" />
          <div>
            <h3 className="text-[16px] md:text-lg font-semibold text-textprimary dark:text-sidebartext">
              {t("engagement")}
            </h3>
            <p className="text-sm text-textprimary dark:text-sidebartext mt-1 flex flex-wrap gap-2">
              <span>
                {t("attendees")}:{" "}
                <span className="font-semibold">{event.attendeesCount}</span>
              </span>
              <span>
                {t("interested")}:{" "}
                <span className="font-semibold">
                  {event.interestedUsersCount}
                </span>
              </span>
            </p>
          </div>
        </div> */}

        {/* Link & audience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-3 lg:p-4 3xl:p-6 space-y-3">
            <h3 className="text-[16px] md:text-lg font-semibold text-textprimary dark:text-sidebartext flex items-center gap-2">
              <Globe2 className="w-4 h-4" />
              {t("eventLink")}
            </h3>
            {event.eventLink ? (
              <a
                href={event.eventLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primarycolor dark:text-primarycolor underline underline-offset-2 break-all"
              >
                {event.eventLink}
              </a>
            ) : (
              <p className="text-sm text-textparagraph dark:text-textparagraphlight">
                {t("noEventLinkProvided")}
              </p>
            )}
          </div>

          <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-3 lg:p-4 3xl:p-6 space-y-3">
            <h3 className="text-[16px] md:text-lg font-semibold text-textprimary dark:text-sidebartext">
              {t("targetAudience")}
            </h3>
            <p className="text-sm text-textparagraph dark:text-textparagraphlight">
              {event.targetAudience || t("noTargetAudienceSpecified")}
            </p>
          </div>
        </div>

        {/* People: organizers, attendees & speakers */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-3 lg:p-4 3xl:p-6 space-y-3">
            <h3 className="text-[16px] md:text-lg font-semibold text-textprimary dark:text-sidebartext">
              {t("organizers")}
            </h3>
            {event.organizersCount > 0 && event.organizers.length > 0 ? (
              <ul className="space-y-3 max-h-[180px] overflow-y-auto">
                {event.organizers.map((org) => (
                  <li key={org.userId}>
                    <EventParticipantItem
                      userId={org.userId}
                      name={org.name}
                      email={org.email}
                      userProfilePicture={org.userProfilePicture}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-textparagraph dark:text-textparagraphlight">
                {t("noOrganizersAvailable")}
              </p>
            )}
          </div>

          <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-3 lg:p-4 3xl:p-6 space-y-3">
            <h3 className="text-[16px] md:text-lg font-semibold text-textprimary dark:text-sidebartext">
              {t("attendees")}
            </h3>
            {event.attendeesCount > 0 && event.attendees.length > 0 ? (
              <ul className="space-y-3 max-h-[180px] overflow-y-auto">
                {event.attendees.slice(0, 4).map((att) => (
                  <li key={att.userId}>
                    <EventParticipantItem
                      userId={att.userId}
                      name={att.name}
                      email={att.email}
                      userProfilePicture={att.userProfilePicture}
                    />
                  </li>
                ))}
                {event.attendeesCount > event.attendees.length && (
                  <li className="text-xs text-textparagraph dark:text-textparagraphlight">
                    {t("moreAttendeesCount", {
                      count: event.attendeesCount - event.attendees.length,
                    })}
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-textparagraph dark:text-textparagraphlight">
                {t("noAttendeesAvailable")}
              </p>
            )}
          </div>

          <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-3 lg:p-4 3xl:p-6 space-y-3">
            <h3 className="text-[16px] md:text-lg font-semibold text-textprimary dark:text-sidebartext">
              {t("speakers")}
            </h3>
            {event.speakersCount > 0 && event.speakers.length > 0 ? (
              <ul className="space-y-3 max-h-[180px] overflow-y-auto">
                {event.speakers.slice(0, 4).map((spk) => (
                  <li key={spk.userId}>
                    <EventParticipantItem
                      userId={spk.userId}
                      name={spk.name}
                      email={spk.email}
                      userProfilePicture={spk.userProfilePicture}
                    />
                  </li>
                ))}
                {event.speakersCount > event.speakers.length && (
                  <li className="text-xs text-textparagraph dark:text-textparagraphlight">
                    {t("moreSpeakersCount", {
                      count: event.speakersCount - event.speakers.length,
                    })}
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-textparagraph dark:text-textparagraphlight">
                {t("noSpeakersAvailable")}
              </p>
            )}
          </div>
        </div>

        {/* Sponsorship Requests */}
        <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-3 lg:p-4 3xl:p-6 space-y-3">
          <h3 className="text-[16px] md:text-lg font-semibold text-textprimary dark:text-sidebartext inline-flex gap-2 items-center justify-between">
            {t("sponsorshipRequests")}
            <span className="mt-[1px] text-xs font-medium px-2 py-0.5 rounded-full bg-primarycolor/10 text-primarycolor dark:bg-secondarycolor/60 dark:text-white">
              {event.sponsorshipRequests.length}
            </span>
          </h3>
          {event.sponsorshipRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
              {event.sponsorshipRequests.map((req) => (
                <EventParticipantItem
                  key={req.id}
                  userId={req.requester.userId}
                  name={req.requester.name}
                  email={req.requester.email}
                  userProfilePicture={req.requester.userProfilePicture}
                  avatarSize="w-10 h-10"
                  className="p-3 rounded-xl border border-bordercolor1 dark:border-darkbordercolor1 hover:bg-bglight dark:hover:bg-darkbgbase transition-colors"
                  fallbackName={t("unknownUser")}
                >
                  <div className="flex items-center justify-between mt-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                        req.status === "Accepted"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : req.status === "Rejected"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      {req.status}
                    </span>
                    <span className="text-[12px] text-textparagraph dark:text-textparagraphlight italic">
                      <FormattedDate date={req.createdOn} />
                    </span>
                  </div>
                </EventParticipantItem>
              ))}
            </div>
          ) : (
            <p className="text-sm text-textparagraph dark:text-textparagraphlight py-2">
              {t("noSponsorshipRequestsAvailable")}
            </p>
          )}
        </div>
      </ProfilePageLayout>
    </>
  );
};

export default EventViewPage;
