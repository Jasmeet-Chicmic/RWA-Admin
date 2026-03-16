import { API_END_POINTS } from "@/shared/api";
import { getRequest } from "@/shared/fetcher";
import {
  GetParamsType,
  ResponseType,
  SORT_DIRECTION,
  User,
} from "@/shared/types";
import { USER_ROLES } from "@/shared/constants";
import UserTable from "./UserTable";
import ErrorState from "@/components/atoms/ErrorState";

const UserManagment = async ({
  searchParams,
}: {
  searchParams: Promise<{
    searchString?: string;
    skip?: number;
    limit?: number;
    sortKey?: string;
    sortDirection?: SORT_DIRECTION;
    role?: USER_ROLES;
    status?: number;
    isSuspicious?: boolean;
    joinedAt?: string;
    currency?: number;
    isActive?: string;
    isSpotlighted?: string;
    createdFrom?: string;
    createdTo?: string;
    country?: string;
    minReportCount?: number;
  }>;
}) => {
  const {
    searchString,
    skip,
    limit,
    sortKey,
    sortDirection,
    isSuspicious,
    isActive,
    isSpotlighted,
    createdFrom,
    createdTo,
    country,
    minReportCount,
  } = await searchParams;
  let data;
  try {
    console.log("Fetching users from:", API_END_POINTS.USER);
    console.log("Sort params:", { sortKey, sortDirection });
    data = await getRequest<
      ResponseType & {
        data: {
          items: User[];
          pageNumber: number;
          pageSize: number;
          totalPages: number;
          totalCount: number;
          hasPreviousPage: boolean;
          hasNextPage: boolean;
        };
      },
      GetParamsType
    >(API_END_POINTS.USER, {
      ...(searchString && { searchString }),
      ...(skip && { skip: Number(skip) }),
      ...(limit && { limit: Number(limit) }),
      ...(sortKey &&
        sortDirection && {
          sortBy: sortKey,
          sortDirection: sortDirection,
        }),
      ...(isActive !== undefined && {
        isActive: isActive === "true",
      }),
      ...(isSpotlighted !== undefined && {
        isSpotlighted: isSpotlighted === "true",
      }),
      ...(createdFrom && { createdFrom }),
      ...(createdTo && { createdTo }),
      ...(country && { country }),
      ...(minReportCount !== undefined && {
        minReportCount: Number(minReportCount),
      }),
      ...(isSuspicious && { isSuspicious: String(isSuspicious) === "true" }),
    });
    console.log("Users API response:", data);

    // Check if the response is an error object
    if (
      data &&
      typeof data === "object" &&
      "response" in data &&
      data.response &&
      typeof data.response === "object"
    ) {
      console.error("API Error:", data);
      const errorData = data.response as { data?: { message?: string } };
      // Return error state
      return (
        <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 dark:text-red-400 mb-2">
                {/* Using English fallback here; component-level i18n lives in UserTable */}
                Error loading users
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {errorData?.data?.message ||
                  (data as { message?: string })?.message ||
                  "Failed to fetch users. Please try again."}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Check if response status is false (API error response)
    if (data && typeof data === "object" && "status" in data && !data.status) {
      console.error("API returned error:", data);
      return (
        <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 dark:text-red-400 mb-2">
                {data.message || "Error loading users"}
              </p>
            </div>
          </div>
        </div>
      );
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return <ErrorState title="users" />;
  }

  return (
    <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
      <div className="overflow-x-auto">
        <UserTable data={data} searchString={searchString || ""} />
      </div>
    </div>
  );
};

export default UserManagment;
