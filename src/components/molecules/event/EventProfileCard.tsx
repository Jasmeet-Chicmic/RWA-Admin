import Image from "next/image";
import { CalendarDays, Globe2, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

import { AdminEventDetail } from "@/app/(secured)/events/helpers/types";
import { buildImageUrl } from "@/shared/utils";
import ProfileCardShell, {
  ProfileCardRow,
} from "@/components/molecules/ProfileCardShell";
import FormattedDate from "@/components/atoms/FormattedDate";

const EventProfileCard = ({ event }: { event: AdminEventDetail }) => {
  const t = useTranslations("events");

  const displayLocation =
    event.venue ||
    event.locationSummary ||
    [event.city, event.country].filter(Boolean).join(", ") ||
    t("Location not specified");

  const coverSrc = event.coverPicture
    ? buildImageUrl(event.coverPicture)
    : null;

  const avatar = (
    <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primarycolor/10 to-secondarycolor/10 dark:from-secondarycolor/20 dark:to-primarycolor/20 flex items-center justify-center p-1 overflow-hidden">
      {coverSrc ? (
        <Image
          src={coverSrc}
          alt={event.title}
          width={120}
          height={120}
          className="rounded-full object-cover w-full h-full"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-primarycolor/20" />
      )}
    </div>
  );

  const statusSection = (
    <div className="flex flex-col items-center gap-3 mt-2">
      <div className="flex items-center gap-1 text-primarycolor dark:text-sidebartext/60">
        <MapPin className="w-4 h-4" />
        <span className="text-[14px] md:text-[0.95rem] font-medium">
          {displayLocation}
        </span>
      </div>
      {event.isSponserDiscoverYourEvent && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[0.7rem] font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>{t("Sponsor badge")}</span>
        </div>
      )}
    </div>
  );

  const rows: ProfileCardRow[] = [
    {
      icon: (
        <Globe2 className="w-[25px] h-[25px] text-primarycolor dark:text-white" />
      ),
      label: t("Event link"),
      value: event.eventLink || "-",
    },
    {
      icon: (
        <CalendarDays className="w-[25px] h-[25px] text-primarycolor dark:text-white" />
      ),
      label: t("Start Date"),
      value: event.startDateTime ? (
        <FormattedDate date={event.startDateTime} />
      ) : (
        "-"
      ),
    },
    {
      icon: (
        <CalendarDays className="w-[25px] h-[25px] text-primarycolor dark:text-white" />
      ),
      label: t("End Date"),
      value: event.endDateTime ? (
        <FormattedDate date={event.endDateTime} />
      ) : (
        "-"
      ),
    },
  ];

  return (
    <ProfileCardShell
      avatar={avatar}
      title={event.title}
      subtitle={event.targetAudience ?? undefined}
      statusSection={statusSection}
      rows={rows}
    />
  );
};

export default EventProfileCard;
