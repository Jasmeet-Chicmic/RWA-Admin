import Image from "next/image";
import Link from "next/link";

import { AdminCompanyDetail } from "@/app/(secured)/companies/helpers/types";
import CompanyScrollableSection from "./CompanyScrollableSection";
import StarRating from "@/components/atoms/StarRating";
import { buildImageUrl } from "@/shared/utils";
import { formatToFixed } from "@/shared/utils/unitUtils";
import FormattedDate from "@/components/atoms/FormattedDate";

interface CompanyRelationsSectionProps {
  company: AdminCompanyDetail;
  t: (key: string) => string;
}

const CompanyRelationsSection = ({
  company,
  t,
}: CompanyRelationsSectionProps) => {
  return (
    <>
      {/* Groups */}
      {company.groups && company.groups.length > 0 && (
        <CompanyScrollableSection
          title={t("Company groups")}
          count={company.groups.length}
        >
          {company.groups.map((group) => (
            <Link
              key={group.id}
              href={`/groups/view/${group.id}`}
              className="flex gap-3 border border-bordercolor1 dark:border-darkbordercolor1 rounded-xl p-3 hover:bg-bglight dark:hover:bg-darkbgbase transition-colors"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center text-xs font-semibold text-textprimary">
                {group.logoPicture ? (
                  <Image
                    src={buildImageUrl(group.logoPicture)}
                    alt={group.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (group.name || "?").charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-semibold text-textprimary dark:text-sidebartext truncate">
                  {group.name}
                </p>
                {group.description && (
                  <p className="text-[14px] text-textparagraph dark:text-textparagraphlight line-clamp-2">
                    {group.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </CompanyScrollableSection>
      )}

      {/* Events */}
      {company.events && company.events.length > 0 && (
        <CompanyScrollableSection
          title={t("Company events")}
          count={company.events.length}
        >
          {company.events.map((event) => (
            <Link
              key={event.id}
              href={`/events/view/${event.id}`}
              className="flex gap-3 border border-bordercolor1 dark:border-darkbordercolor1 rounded-xl p-3 hover:bg-bglight dark:hover:bg-darkbgbase transition-colors"
            >
              <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center text-[11px] text-textparagraph">
                {event.coverPicture ? (
                  <Image
                    src={buildImageUrl(event.coverPicture)}
                    alt={event.title}
                    width={64}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{t("Events")}</span>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-[16px] font-semibold text-textprimary dark:text-sidebartext truncate">
                  {event.title}
                </p>
                <p className="text-[14px] text-textparagraph dark:text-textparagraphlight truncate">
                  {event.venue || t("Not available")}
                </p>
                <p className="text-[11px] text-textparagraph dark:text-textparagraphlight">
                  <FormattedDate date={event.startDateTime} /> -{" "}
                  <FormattedDate date={event.endDateTime} />
                </p>
              </div>
            </Link>
          ))}
        </CompanyScrollableSection>
      )}

      {/* Achievements */}
      {company.achievements && company.achievements.length > 0 && (
        <CompanyScrollableSection
          title={t("Achievements")}
          count={company.achievements.length}
        >
          {company.achievements.map((ach, index) => (
            <div
              key={`${ach.title}-${index}`}
              className="flex gap-3 border border-bordercolor1 dark:border-darkbordercolor1 rounded-xl p-3"
            >
              {ach.attachment && (
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                  <Image
                    src={buildImageUrl(ach.attachment)}
                    alt={ach.title}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-[16px] font-semibold text-textprimary dark:text-sidebartext truncate">
                  {ach.title}
                </p>
                <p className="text-[14px] text-textparagraph dark:text-textparagraphlight">
                  {ach.organization} • {ach.category}
                </p>
                <p className="text-[14px] text-textparagraph dark:text-textparagraphlight">
                  {ach.month} {ach.year}
                </p>
                {ach.description && (
                  <p className="text-[14px] text-textparagraph dark:text-textparagraphlight line-clamp-3">
                    {ach.description}
                  </p>
                )}
                {ach.supportingLink && (
                  <a
                    href={ach.supportingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] text-primarycolor dark:text-secondarycolor underline underline-offset-2"
                  >
                    {t("View achievement link")}
                  </a>
                )}
              </div>
            </div>
          ))}
        </CompanyScrollableSection>
      )}

      {/* Videos */}
      {company.videos && company.videos.length > 0 && (
        <CompanyScrollableSection
          title={t("Videos")}
          count={company.videos.length}
        >
          {company.videos.map((video, index) => (
            <div
              key={`${video.title}-${index}`}
              className="flex gap-3 border border-bordercolor1 dark:border-darkbordercolor1 rounded-xl p-3"
            >
              <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center text-xs text-textparagraph">
                {video.featuredImage ? (
                  <Image
                    src={buildImageUrl(video.featuredImage)}
                    alt={video.title}
                    width={80}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{t("Video")}</span>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-[16px] font-semibold text-textprimary dark:text-sidebartext truncate">
                  {video.title}
                </p>
                {video.description && (
                  <p className="text-[14px] text-textparagraph dark:text-textparagraphlight line-clamp-3">
                    {video.description}
                  </p>
                )}
                {(video.file || video.featuredImage) && (
                  <a
                    href={buildImageUrl(video.file || video.featuredImage!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] text-primarycolor dark:text-secondarycolor underline underline-offset-2"
                  >
                    {t("View video")}
                  </a>
                )}
              </div>
            </div>
          ))}
        </CompanyScrollableSection>
      )}

      {/* Reviews */}
      {company.reviews && company.reviews.length > 0 && (
        <CompanyScrollableSection
          title={t("Reviews")}
          count={company.reviews.length}
        >
          {company.reviews.map((review) => (
            <div
              key={review.id}
              className="border border-bordercolor1 dark:border-darkbordercolor1 rounded-xl p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-semibold text-textprimary overflow-hidden">
                    {review.userProfilePicture ? (
                      <Image
                        src={buildImageUrl(review.userProfilePicture)}
                        alt={review.userName || t("Not available")}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (review.userName || "?").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[16px] font-semibold text-textprimary dark:text-sidebartext truncate">
                      {review.userName || t("Not available")}
                    </p>
                    {review.userDesignation && (
                      <p className="text-[14px] text-textparagraph dark:text-textparagraphlight truncate">
                        {review.userDesignation}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StarRating
                    rating={review.rating}
                    readonly
                    size="sm"
                    variant="svg"
                    filledColor="#FCD34D"
                  />
                  <span className="text-xs font-medium text-textparagraph dark:text-textparagraphlight">
                    {formatToFixed(review.rating, 1)} / 5
                  </span>
                </div>
              </div>
              {review.description && (
                <p className="text-[14px] text-textparagraph dark:text-textparagraphlight">
                  {review.description}
                </p>
              )}
              <p className="text-[11px] text-textparagraph dark:text-textparagraphlight">
                <FormattedDate date={review.createdOn} />
              </p>
            </div>
          ))}
        </CompanyScrollableSection>
      )}

      {/* Project showcase */}
      {company.projectShowCase?.projects &&
        company.projectShowCase.projects.length > 0 && (
          <CompanyScrollableSection
            title={t("Project showcase")}
            count={company.projectShowCase.projects.length}
          >
            {company.projectShowCase.projects.map((project, index) => (
              <div
                key={`${project.title}-${index}`}
                className="flex gap-3 border border-bordercolor1 dark:border-darkbordercolor1 rounded-xl p-3"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center text-[11px] text-textparagraph">
                  {project.featuredImage || project.links?.[0] ? (
                    <Image
                      src={buildImageUrl(
                        project.featuredImage || project.links![0],
                      )}
                      alt={project.title}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{t("Projects")}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[16px] font-semibold text-textprimary dark:text-sidebartext truncate">
                    {project.title}
                  </p>
                  {project.description && (
                    <p className="text-[14px] text-textparagraph dark:text-textparagraphlight line-clamp-3">
                      {project.description}
                    </p>
                  )}
                  <p className="text-[11px] text-textparagraph dark:text-textparagraphlight">
                    <FormattedDate date={project.startDate} /> -{" "}
                    <FormattedDate date={project.endDate} />
                  </p>
                  {project.projectLink && (
                    <a
                      href={project.projectLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[14px] text-primarycolor dark:text-secondarycolor underline underline-offset-2"
                    >
                      {t("View project")}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </CompanyScrollableSection>
        )}
    </>
  );
};

export default CompanyRelationsSection;
