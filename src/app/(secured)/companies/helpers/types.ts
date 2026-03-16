export interface AdminCompany {
  id: string;
  userId: string;
  name: string;
  industryId: string | null;
  industry: string | null;
  message: string | null;
  isVerified: boolean;
  isSuspended: boolean;
  isActive: boolean;
  isDraft: boolean;
  createdOn: string;
  jobsCount: number;
  eventsCount: number;
  followersCount: number;
  creatorName: string | null;
  creatorEmail: string | null;
  creatorProfilePicture: string | null;
  employeesCount: number;
}

export interface AdminCompanyDetail {
  id: string;
  userId: string;
  name: string;
  tagLine: string | null;
  logoPicture: string | null;
  coverPicture: string | null;
  industry: string | null;
  industryId: string | null;
  location: string | null;
  website: string | null;
  description: string | null;
  isDraft: boolean;
  isActive: boolean;
  createdOn: string;
  isVerified: boolean;
  isSuspended: boolean;
  jobsCount: number;
  eventsCount: number;
  contentCount: number;
  followersCount: number;
  reviewsCount: number;
  employeesCount: number;
  groupsCount?: number;
  managersCount?: number;
  employees?: CompanyEmployee[];
  managers?: CompanyManager[];
  owners?: CompanyManager[];
  achievements?: CompanyAchievement[];
  videos?: CompanyVideo[];
  projectShowCase?: CompanyProjectShowcase;
  reviews?: CompanyReview[];
  companySize: string | null;
  annualRevenue: string | null;
  groups?: CompanyGroupSummary[];
  events?: CompanyEventSummary[];
}

export interface CompanyEmployee {
  id: string;
  userId: string;
  fullName: string | null;
  email: string | null;
  profilePicture: string | null;
  jobTitle: string | null;
  department: string | null;
  status: string;
  isCurrentEmployee: boolean;
}

export interface CompanyManager {
  id: string;
  userId: string;
  userName: string;
  userProfilePicture: string | null;
  bio: string | null;
  jobTitle: string | null;
  companyName: string | null;
  coverPicture: string | null;
  levelOfSeniority: string | null;
  otherSeniorityDescription: string | null;
  role: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  permissions: any;
}

export interface CompanyAchievement {
  title: string;
  description: string;
  category: string;
  month: string;
  year: string;
  organization: string;
  supportingLink: string | null;
  attachment: string | null;
  isDraft: boolean;
  logoPicture: string | null;
}

export interface CompanyGroupSummary {
  id: string;
  name: string;
  coverPicture: string | null;
  logoPicture: string | null;
  description: string | null;
  type: number;
}

export interface CompanyEventSummary {
  id: string;
  title: string;
  coverPicture: string | null;
  venue: string | null;
  description: string | null;
  startDateTime: string;
  endDateTime: string;
}

export interface CompanyVideo {
  title: string;
  description: string;
  file: string | null;
  featuredImage: string | null;
  tags?: string[];
  isDraft: boolean;
}

export interface CompanyProjectVideo {
  projectId: string;
  title: string;
  link: string | null;
  file: string | null;
  featuredImage: string | null;
}

export interface CompanyProject {
  title: string;
  description: string;
  challenges: string;
  solutions: string;
  results: string;
  tags?: string[];
  projectLink: string | null;
  links?: string[];
  featuredImage: string | null;
  videos?: CompanyProjectVideo[];
  startDate: string;
  endDate: string;
  createdOn: string;
}

export interface CompanyProjectShowcase {
  projects: CompanyProject[];
}

export interface CompanyReview {
  id: string;
  userId: string;
  subject: string;
  description: string;
  rating: number;
  createdOn: string;
  userName: string;
  userProfilePicture: string | null;
  userDesignation: string | null;
  levelOfSeniority: string | null;
  otherSeniorityDescription: string | null;
}

export interface SimpleResponse {
  status?: boolean;
  message?: string;
}

export interface GetCompaniesParams {
  UserId?: string;
  pageNumber?: number;
  pageSize?: number;
  searchText?: string;
  sortBy?: string;
  sortDirection?: string;
}

export interface CompaniesListResponse {
  statusCode: number;
  status: boolean;
  message: string;
  type: string;
  data: AdminCompany[];
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  page: number;
  per_page: number;
}

export interface CompanyDetailResponse {
  statusCode: number;
  status: boolean;
  message: string;
  type: string;
  data: AdminCompanyDetail;
}
