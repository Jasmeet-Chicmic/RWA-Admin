export enum GROUP_TYPE {
  PUBLIC = 0,
  PRIVATE = 1,
  SECRET = 2,
}

export interface AdminGroup {
  id: string;
  name: string;
  type: number;
  membersCount: number;
  reportCount: number;
  isClosed: boolean;
  isDraft: boolean;
  closedAt: string | null;
  createdOn: string;
  isActive: boolean;
}

export interface GetGroupsParams {
  userId?: string;
  pageNumber?: number;
  pageSize?: number;
  searchText?: string;
  type?: GROUP_TYPE | string;
  isClosed?: boolean | string;
  isDraft?: boolean | string;
  isActive?: boolean | string;
  sortBy?: string;
  sortDirection?: string;
}

export interface GetInactiveGroupsParams {
  daysInactive?: number;
  pageNumber?: number;
  pageSize?: number;
  searchText?: string;
  type?: GROUP_TYPE | string;
  isClosed?: boolean | string;
  isDraft?: boolean | string;
  isActive?: boolean | string;
  sortBy?: string;
  sortDirection?: string;
}

export interface GroupsListResponse {
  statusCode: number;
  status: boolean;
  message: string;
  type: string;
  data: AdminGroup[];
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  page: number;
  per_page: number;
}

export const GROUP_TYPE_LABELS: Record<number, string> = {
  0: "Public",
  1: "Private",
  2: "Secret",
};

export interface InactiveGroup {
  groupId: string;
  groupName: string;
  ownerId: string;
  ownerName: string | null;
  ownerEmail: string | null;
  ownerProfilePicture: string | null;
  contactEmail: string | null;
  createdOn: string;
  lastActivityDate: string | null;
  daysSinceLastActivity: number;
}

export interface InactiveGroupsResponse {
  statusCode: number;
  status: boolean;
  message: string;
  type: string;
  data: InactiveGroup[];
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  page: number;
  per_page: number;
}

export interface GroupOwner {
  id: string;
  fullName: string;
  email: string;
  profilePicture: string | null;
  coverPicture: string | null;
}

export interface GroupAdmin {
  id: string;
  userId: string;
  groupId: string;
  memberType: number;
  fullName: string;
  email: string;
  profilePicture: string | null;
  coverPicture: string | null;
  bio: string;
  jobTitle: string;
  companyName: string;
  levelOfSeniority: string | null;
  otherSeniorityDescription: string;
  createdOn: string;
}

export interface AdminGroupDetail {
  id: string;
  ownerId: string;
  name: string;
  slug: string | null;
  description: string | null;
  coverPicture: string | null;
  logoPicture: string | null;
  whoCanJoin: string | null;
  tags: string | null;
  rules: string | null;
  type: number;
  resourcePicture: string | null;
  resourceLink: string | null;
  contactInformation: string | null;
  linkedIn: string | null;
  email: string | null;
  allowMemberToAddConnection: boolean;
  requireNewPostForAdminReview: boolean;
  monetiseAudience: boolean;
  invitationType: number;
  activityFeedType: number;
  mediaType: number;
  albumType: number;
  documentType: number;
  videoType: number;
  messageGroupType: number;
  reportCount: number;
  membersCount: number;
  isClosed: boolean;
  closedAt: string | null;
  isDraft: boolean;
  isActive: boolean;
  createdOn: string;
  modifiedOn: string;
  healthScore: number;
  lastHealthScoreUpdatedOn: string;
  owner: GroupOwner;
  admins: GroupAdmin[];
  moderators: GroupAdmin[];
  members: GroupAdmin[];
  pendingRequestsCount: number;
  bannedMembersCount: number;
  eventsCount: number;
}
