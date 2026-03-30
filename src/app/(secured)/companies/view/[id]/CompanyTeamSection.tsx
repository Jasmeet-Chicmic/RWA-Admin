import EventParticipantItem from "@/components/molecules/event/EventParticipantItem";
import { AdminCompanyDetail } from "@/app/(secured)/companies/helpers/types";

interface CompanyTeamSectionProps {
  company: AdminCompanyDetail;
  t: (key: string) => string;
}

interface TeamSectionProps {
  title: string;
  count: number;
  children: React.ReactNode;
}

const TeamSection = ({ title, count, children }: TeamSectionProps) => {
  if (!count) return null;

  const isScrollable = count > 5;

  return (
    <div>
      <h4 className="text-[14px] sm:text-[16px] font-semibold text-textprimary dark:text-sidebartext mb-3">
        {title}
      </h4>
      <div
        className={`space-y-3 ${
          isScrollable ? "max-h-72 overflow-y-auto pr-1 custom-scrollbar" : ""
        }`}
      >
        <ul className="space-y-3">{children}</ul>
      </div>
    </div>
  );
};

const CompanyTeamSection = ({ company, t }: CompanyTeamSectionProps) => {
  return (
    <div className="bg-bgwhite dark:bg-darkbgprimary rounded-2xl border border-bordercolor1 dark:border-darkbordercolor1 p-3 lg:p-4 3xl:p-6">
      <h3 className="text-[16px] md:text-lg font-semibold text-textprimary dark:text-sidebartext mb-2">
        {t("team")}
      </h3>

      <div className="space-y-6">
        {company.owners && (
          <TeamSection title={t("owners")} count={company.owners.length}>
            {company.owners.map((owner) => (
              <li key={owner.id}>
                <EventParticipantItem
                  userId={owner.userId}
                  name={owner.userName || t("notAvailable")}
                  email={null}
                  userProfilePicture={owner.userProfilePicture}
                  avatarSize="w-9 h-9"
                  showEmail={false}
                >
                  {owner.jobTitle && (
                    <p className="text-[14px] text-textparagraph dark:text-textparagraphlight truncate">
                      {owner.jobTitle}
                    </p>
                  )}
                </EventParticipantItem>
              </li>
            ))}
          </TeamSection>
        )}

        {company.managers && (
          <TeamSection title={t("managers")} count={company.managers.length}>
            {company.managers.map((manager) => (
              <li key={manager.id}>
                <EventParticipantItem
                  userId={manager.userId}
                  name={manager.userName || t("notAvailable")}
                  email={null}
                  userProfilePicture={manager.userProfilePicture}
                  avatarSize="w-9 h-9"
                  showEmail={false}
                >
                  {manager.jobTitle && (
                    <p className="text-[14px] text-textparagraph dark:text-textparagraphlight truncate">
                      {manager.jobTitle}
                    </p>
                  )}
                </EventParticipantItem>
              </li>
            ))}
          </TeamSection>
        )}

        {company.employees && (
          <TeamSection title={t("employees")} count={company.employees.length}>
            {company.employees.map((employee) => (
              <li key={employee.id}>
                <EventParticipantItem
                  userId={employee.userId}
                  name={employee.fullName || t("notAvailable")}
                  email={employee.email || undefined}
                  userProfilePicture={employee.profilePicture}
                  avatarSize="w-9 h-9"
                >
                  <div className="flex items-center gap-2 mt-2">
                    {employee.jobTitle && (
                      <p className="text-[12px] text-textparagraph dark:text-textparagraphlight truncate">
                        {employee.jobTitle}
                      </p>
                    )}
                    {employee.isCurrentEmployee && (
                      <span className="inline-flex items-center rounded-full bg-primarycolor/10 text-primarycolor dark:bg-secondarycolor/10 dark:text-secondarycolor px-2 py-0.5 text-[12px] font-semibold">
                        {t("currentEmployee")}
                      </span>
                    )}
                  </div>
                </EventParticipantItem>
              </li>
            ))}
          </TeamSection>
        )}
      </div>
    </div>
  );
};

export default CompanyTeamSection;
