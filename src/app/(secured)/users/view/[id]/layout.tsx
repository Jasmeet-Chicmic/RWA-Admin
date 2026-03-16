// import ScrollToTop from "@/components/atoms/ScrollToTop/ScrollToTop";
import UserLayout from "@/components/layouts/UserLayout";
import { User, UserDetail, ResponseType } from "@/shared/types";
import { getUserByIdAction } from "@/api/user";

type UserResponseType = Omit<ResponseType, "data"> & {
  data: UserDetail;
};

const Layout = async ({
  params,
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  let userData: UserResponseType | undefined;

  try {
    userData = (await getUserByIdAction(id)) as UserResponseType;
  } catch (error: unknown) {
    // Check if it's a redirect error (should be thrown, not caught)
    throw error;
  }

  if (!userData) {
    return <></>;
  }

  // Map the new API response to User type for backward compatibility
  const mappedUserData: User | undefined = userData?.data
    ? {
        userId: userData.data.userId,
        firstName: userData.data.firstName,
        middleName: userData.data.middleName ?? null,
        lastName: userData.data.lastName,
        fullName:
          `${userData.data.firstName} ${userData.data.middleName ? userData.data.middleName + " " : ""}${userData.data.lastName}`.trim(),
        email: userData.data.email,
        phone: userData.data.phone ?? null,
        userProfilePicture: userData.data.userProfilePicture ?? null,
        jobTitle: userData.data.jobTitle ?? null,
        companyName: userData.data.companyName ?? null,
        location: userData.data.location ?? null,
        country: userData.data.country ?? null,
        isActive: userData.data.isActive,
        isSpotlighted: userData.data.isSpotlighted,
        reportCount: userData.data.reportCount,
        likeCount: userData.data.likeCount,
        connectionCount: userData.data.connectionCount,
        followerCount: userData.data.followerCount,
        followingCount: userData.data.followingCount,
        pointsEarned: userData.data.pointsEarned,
        badgeType: userData.data.badgeType ?? null,
        isAdminBadgeAssigned: userData.data.isAdminBadgeAssigned ?? false,
        adminAssignedBadge: userData.data.adminAssignedBadge ?? null,
        createdOn: userData.data.createdOn,
        modifiedOn: userData.data.modifiedOn,
        // Additional fields from new API
        phoneNumber: userData.data.phoneNumber ?? "",
        title: userData.data.title ?? null,
        dateOfBirth: userData.data.dateOfBirth ?? null,
        heritage: userData.data.heritage,
        gender: userData.data.gender ?? null,
        nationality: userData.data.nationality ?? "",
        state: userData.data.state ?? "",
        city: userData.data.city ?? "",
        linkedInUrl: userData.data.linkedInUrl ?? "",
        userCoverPicture: userData.data.userCoverPicture ?? null,
        profileVideoLink: userData.data.profileVideoLink ?? null,
        bio: userData.data.bio ?? "",
        experience: userData.data.experience ?? "",
        employmentStatus: userData.data.employmentStatus ?? "",
        sizeOfBusiness: userData.data.sizeOfBusiness ?? "",
        levelOfSeniority: userData.data.levelOfSeniority ?? null,
        otherSeniorityDescription:
          userData.data.otherSeniorityDescription ?? null,
        openToMentor: userData.data.openToMentor ?? null,
        currentWorkHistoryId: userData.data.currentWorkHistoryId ?? null,
        isDeleted: userData.data.isDeleted,
        onlyMe: userData.data.onlyMe ?? false,
        isReceiveBlackRiseEmails:
          userData.data.isReceiveBlackRiseEmails ?? false,
        isReconnectWithEmail: userData.data.isReconnectWithEmail ?? false,
        profileCompletionPoints: userData.data.profileCompletionPoints ?? 0,
        streakCount: userData.data.streakCount ?? 0,
        lastEarnedDate: userData.data.lastEarnedDate ?? null,
        createdBy: userData.data.createdBy ?? "",
        modifiedBy: userData.data.modifiedBy ?? "",
        education: userData.data.education ?? [],
        workHistory: userData.data.workHistory ?? [],
        skills: userData.data.skills ?? [],
        industries: userData.data.industries ?? [],
      }
    : undefined;

  if (!mappedUserData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-2">User not found</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Unable to load user data. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* <ScrollToTop /> */}
      <UserLayout data={mappedUserData}>{children}</UserLayout>
    </>
  );
};
export default Layout;
