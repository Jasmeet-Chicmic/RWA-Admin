export interface ReportedProfile {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  userProfilePicture: string | null;
  isActive?: boolean;
}

export interface ReportedByUserRef {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  userProfilePicture: string | null;
}

export interface ReportEntry {
  reportId: string;
  reportedByUser: ReportedByUserRef;
  reportReasonId: string;
  description: string | null;
  reportedAt: string;
}

export interface ReportedUserItem {
  reportedProfile: ReportedProfile;
  reportedByUsers: ReportEntry[];
  reportedCount: string;
}

export interface ReportedUsersResponse {
  statusCode: number;
  status: boolean;
  message: string;
  type: string;
  data: {
    items: ReportedUserItem[];
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface GetReportedUsersParams {
  skip?: number;
  limit?: number;
  searchString?: string;
}
