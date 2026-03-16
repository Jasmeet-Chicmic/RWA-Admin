import { getUserByIdAction } from "@/api/user";
import { Education, ResponseType, UserDetail } from "@/shared/types";
import { getTranslations } from "next-intl/server";
import { WorkHistorySection } from "./WorkHistorySection";
import { SkillsSection } from "./SkillsSection";
import { IndustriesSection } from "./IndustriesSection";
import { EducationSection } from "./EducationSection";

type UserResponseType = Omit<ResponseType, "data"> & {
  data: UserDetail;
};

type WorkHistory = {
  id: string;
  company?: string | null;
  designation?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

type UserSkill = {
  id: string;
  skillName?: string | null;
};

type UserIndustry = {
  industryId: string;
  industryName?: string | null;
  subIndustryNames?: string[] | null;
};

const AccountPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  let userData: UserResponseType | undefined;

  try {
    userData = (await getUserByIdAction(id)) as UserResponseType;
  } catch (error: unknown) {
    throw error;
  }

  const t = await getTranslations("users");

  if (!userData?.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-2">
            {t("User not found")}
          </p>
        </div>
      </div>
    );
  }

  const user = userData.data;
  const educationList = (user.education as Education[]) || [];
  const workHistoryList = (user.workHistory || []) as WorkHistory[];
  const skillsList = (user.skills || []) as UserSkill[];
  const industriesList = (user.industries || []) as UserIndustry[];

  return (
    <div className="space-y-6">
      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <EducationSection educationList={educationList} />
        <WorkHistorySection workHistoryList={workHistoryList} />
      </div>

      {/* Secondary grid: skills & industries */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SkillsSection skillsList={skillsList} />
        <IndustriesSection industriesList={industriesList} />
      </div>
    </div>
  );
};

export default AccountPage;
