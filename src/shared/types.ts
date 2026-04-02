import {
  BROWSER_TYPE,
  COUNTRIES,
  ENTITY_STATUS,
  INDUSTRY_SECTORS,
  INVOICE_STATUS,
  JOB_LOCATION,
  JOB_SALARY_CATEGORY,
  JOB_STATUS,
  JOB_TYPE,
  JOB_VISIBILITY,
  SUBSCRIPTION_PURCHASE_TYPE,
  SUBSCRIPTION_STATUS,
  USER_ACTIVITY_TYPE,
  USER_FEATURE_CODE,
  USER_ROLES,
  USER_STATUS,
} from "@/shared/constants";

import { STATUS_CODE, STATUS_TYPE } from "./constants";

export interface ResponseType {
  status: boolean;
  message: string;
  type: STATUS_TYPE;
  statusCode: STATUS_CODE;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

export interface PaginatedDataType<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface Role {
  id: string;
  name: string;
  isActive: boolean;
  featureCount?: number;
}

export interface RoleFeature {
  id: number;
  roleId: string;
  featureId: string;
  featureCode: string;
  value: number | null;
  displayName?: string;
}

export interface Education {
  id: string;
  school: string;
  logoUrl: string | null;
  degree: string | null;
  fieldOfStudy: string | null;
  startDate: string;
  endDate: string | null;
  grade: string | null;
  description: string | null;
  mediaUrl: string | null;
}

export interface UserFeature {
  id: string;
  featureCode: USER_FEATURE_CODE;
  assignedValue?: number | null;
  defaultValue: number | null;
  subscribedValue?: number | null;
  displayName: string;
  isDefault: boolean;
  isSubscribed?: boolean;
  currentValue?: number | null;
  minimumValue?: number | null;
  roleValue?: number;
}

export interface SystemFeature {
  id: string;
  featureCode: string;
  displayName: string;
  isDefault: boolean;
  defaultValue: number | null;
  isActive: boolean;
}

export interface UpdateDefaultFeaturePayload {
  features: {
    featureId: string;
    value: number | null;
    isDefault: boolean;
  }[];
}

export interface FeatureActiveStatusItem {
  featureId: string;
  isActive: boolean;
}

export interface UpdateFeatureActiveStatusPayload {
  features: FeatureActiveStatusItem[];
}

export interface UserDetail {
  userId: string;
  title?: string | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  phone?: string | null;
  phoneNumber?: string;
  dateOfBirth?: string | null;
  heritage?: number;
  gender?: string | null;
  nationality?: string;
  country?: string;
  state?: string;
  city?: string;
  location?: string | null;
  linkedInUrl?: string;
  userProfilePicture?: string;
  userCoverPicture?: string | null;
  profileVideoLink?: string | null;
  bio?: string;
  experience?: string;
  employmentStatus?: string;
  jobTitle?: string;
  companyName?: string;
  sizeOfBusiness?: string;
  levelOfSeniority?: string | number | null;
  otherSeniorityDescription?: string | null;
  openToMentor?: boolean | null;
  currentWorkHistoryId?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  isSpotlighted: boolean;
  onlyMe?: boolean;
  isReceiveBlackRiseEmails?: boolean;
  isReconnectWithEmail?: boolean;
  reportCount: number;
  likeCount: number;
  connectionCount: number;
  followerCount: number;
  followingCount: number;
  pointsEarned: number;
  profileCompletionPoints?: number;
  streakCount?: number;
  lastEarnedDate?: string | null;
  createdBy?: string;
  createdOn: string;
  modifiedBy?: string;
  modifiedOn: string;
  education?: Education[];
  workHistory?: unknown[];
  skills?: unknown[];
  industries?: unknown[];
  // Badge info for admin users view
  badgeType?: number | null;
  isAdminBadgeAssigned?: boolean;
  adminAssignedBadge?: number | null;
}

export interface User {
  // New API structure fields
  userId: string;
  title?: string | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string | null;
  phoneNumber?: string;
  dateOfBirth?: string | null;
  heritage?: number;
  gender?: string | null;
  nationality?: string;
  country?: string | null;
  state?: string;
  city?: string;
  location?: string | null;
  linkedInUrl?: string;
  userProfilePicture?: string | null;
  userCoverPicture?: string | null;
  profileVideoLink?: string | null;
  bio?: string;
  experience?: string;
  employmentStatus?: string;
  jobTitle?: string | null;
  companyName?: string | null;
  sizeOfBusiness?: string;
  levelOfSeniority?: string | number | null;
  otherSeniorityDescription?: string | null;
  openToMentor?: boolean | null;
  currentWorkHistoryId?: string | null;
  isActive: boolean;
  isDeleted?: boolean;
  isSpotlighted: boolean;
  onlyMe?: boolean;
  isReceiveBlackRiseEmails?: boolean;
  isReconnectWithEmail?: boolean;
  reportCount: number;
  likeCount: number;
  connectionCount: number;
  followerCount: number;
  followingCount: number;
  pointsEarned: number;
  profileCompletionPoints?: number;
  streakCount?: number;
  lastEarnedDate?: string | null;
  createdBy?: string;
  createdOn: string;
  modifiedBy?: string;
  modifiedOn: string;
  education?: Education[];
  workHistory?: unknown[];
  skills?: unknown[];
  industries?: unknown[];
  // Legacy fields for backward compatibility
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  name?: string;
  isEmailVerified?: boolean;
  profilePicture?: string;
  password?: string;
  role?:
    | USER_ROLES
    | {
        roleId: string;
        roleName: string;
      };
  status?: USER_STATUS;
  billingAddress?: Address;
  bankDetails?: BankDetails;
  isSuspended?: boolean;
  // Admin badge status (for admin panel)
  badgeType?: number | null;
  isAdminBadgeAssigned?: boolean;
  adminAssignedBadge?: number | null;
  wallet?: string;
  betAmount?: number;
  profit?: number;
  rtp?: number;
  joinedAt?: Date;
  isSuspicious?: boolean;
  currency?: number;
}
export interface Address {
  address: string;
  city: string;
  state: string;
  country: string;
  countryCode: string;
  zipcode: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
}
export type SORT_DIRECTION = "ASC" | "DESC";

export const SORT_DIRECTIONS = {
  ASC: "ASC" as const,
  DESC: "DESC" as const,
} as const;
export const CHART_TYPES = {
  LINE: "line",
  AREA: "area",
  BAR: "bar",
  SCATTER: "scatter",
  HEATMAP: "heatmap",
} as const;

export type ChartType = (typeof CHART_TYPES)[keyof typeof CHART_TYPES];
export interface GetParamsType {
  // New API query parameters
  searchString?: string;
  isActive?: boolean;
  isSpotlighted?: boolean;
  createdFrom?: string;
  createdTo?: string;
  country?: string;
  minReportCount?: number;
  sortBy?: string;
  sortDirection?: string;
  skip?: number;
  limit?: number;
  pageNumber?: number;
  pageSize?: number;
  KycStatus?: number;
  // Legacy parameters for backward compatibility
  page?: number;
  sortKey?: string;
  userId?: string;
  projectIds?: string[];
  filterType?: number;
  type?: number;
  badgeId?: string;
  companyId?: string;
  status?: number;
  isSuspicious?: boolean;
  joinedAt?: string;
  fromDate?: string;
  toDate?: string;
  currency?: number;
}

export interface UserActivity {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  type: USER_ACTIVITY_TYPE;
  projectId: string;
  invoiceId?: string;
  teamMembers?: ProjectType["teamMembers"];
  client?: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
}

export interface ProjectType {
  _id: string;
  name: string;
  imageURL: string;
  progress: number;
  leader: {
    _id: string;
    name: string;
  };
  teamMembers: {
    _id: string;
    name: string;
    profilePicture?: string;
  }[];
}

export interface DEVICE {
  _id: string;
  userId: string;
  browserType: BROWSER_TYPE;
  deviceName: string;
  location: string;
  lastLoginDate: Date;
}

export type Replace<T, K extends keyof T, V> = Omit<T, K> & Record<K, V>;

export interface InvoiceItem {
  title: string;
  description: string;
  cost: number;
  quantity: number;
  tax1Percentage: number;
  tax2Percentage: number;
  discountPercentage: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  dateIssued: string; // ISO date string
  dateDue: string; // ISO date string
  items: InvoiceItem[];
  salesPerson: string;
  salesPersonDescription: string;
  notes: string;
  user: User;
  invoiceAmount?: number;
  status?: INVOICE_STATUS;
}

export interface SubscriptionPlan {
  _id?: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  isActive: boolean;
  color: string;
}

export interface UserSubscription {
  endDate: string;
  isAutoRenew: boolean;
  startDate: string;
  status: SUBSCRIPTION_STATUS;
  subscriptionPlan: SubscriptionPlan;
  subscriptionPlanId: string;
  userId: string;
  subscriptionPurchaseType: SUBSCRIPTION_PURCHASE_TYPE;
  _id: string;
}

export interface PaymentCard {
  userId?: string;
  cardNumber?: string;
  cardHolderName?: string;
  cardExpiry?: string;
  cardExpiryMonth?: number;
  cardExpiryYear?: number;
  cvv?: string;
  isPrimary?: boolean;
  _id?: string;
  cardNumberLast4Digits?: string;
}

export type BadgePayload = {
  badgeId?: string;
  name: string;
  type: number;
  imageURL: string;
};

export interface PromoCode {
  _id?: string;
  id?: string;
  code: string;
  title: string;
  description: string;
  isActive: boolean;
  // Admin promo fields (optional for backward compatibility)
  discountType?: number;
  discountValue?: number;
  currency?: string;
  duration?: number;
  durationInMonths?: number | null;
  validFrom?: string;
  validUntil?: string | null;
  maxRedemptions?: number;
  redemptionCount?: number;
  users?: User[];
  createdAt?: Date;
  updatedAt?: Date;
  plans?: SubscriptionPlan[];
}

// Companies

export interface Company {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  companyName?: string;
  email?: string;
  companyProfilePicture?: string;
  contactNumber?: string;
  country?: COUNTRIES;
  sector?: INDUSTRY_SECTORS;
  isSuspended?: boolean;
  isVerified?: boolean;
  status?: ENTITY_STATUS;
  flagsCount?: number;
  employeeCount?: string;
  website?: string;
  headquarters?: string;
  services?: string[];
}

//Jobs
export interface Job {
  _id: string;
  title: string;
  description: string;
  companyId: string;
  jobType: JOB_TYPE;
  location: JOB_LOCATION;
  inPersonLocation?: string;
  salaryCategory: JOB_SALARY_CATEGORY;
  customSalaryAmount?: number;
  applicationOpenDate: Date;
  applicationCloseDate: Date;
  keyResponsibilities: string;
  skills: string[];
  preferredExperience: string;
  sector: INDUSTRY_SECTORS;
  customSector?: string;
  status: JOB_STATUS;
  visibility: JOB_VISIBILITY;
  isDeleted: boolean;
  requirement: string;
  companyName: string;
  companyLocation: COUNTRIES;
  schedule: string;
  isExpanded: boolean;
  companyProfilePicture: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Application {
  _id: string;
  job: Job;
  user: User;
  createdAt: Date;
  updatedAt: Date;
  coverLetter: string;
  resume: string;
  rating: number;
}

// Payment Transactions
export interface Transaction {
  ownerId?: string;
  ownerType?: number;
  transactionId: string;
  date: string;
  amount: number;
  currency: string;
  status: number;
  invoiceId: string;
  invoiceNumber: string;
  subscriptionId: string;
  planName: string;
  paymentMethodType: string | null;
  paymentMethodBrand: string | null;
  paymentMethodLast4: string | null;
  isRefund: boolean;
  isCredit: boolean;
}

export interface GetAdminTransactionsParams {
  ownerId?: string;
  propertyId?: string;
  status?: number;
  fromDate?: string;
  toDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface Subscription {
  subscriptionId: string;
  ownerId: string;
  ownerType: number;
  ownerTypeDisplay: string;
  planId: string;
  planName: string;
  planCode: string;
  status: number;
  statusDisplay: string;
  billingCycle: number;
  billingCycleDisplay: string;
  seatCount: number;
  startDate: string;
  endDate: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  customerEmail: string;
  customerName: string | null;
  cancelAtPeriodEnd: boolean | null;
  cancellationReason: string | null;
  createdOn: string;
}

export interface GetAdminSubscriptionsParams {
  ownerId?: string;
  ownerType?: number;
  planId?: string;
  status?: number;
  billingCycle?: number;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface AdjustSubscriptionPayload {
  subscriptionId: string;
  newEndDate?: string;
  newBillingCycle?: number;
  newSeatCount?: number;
  newStatus?: number;
  reason?: string;
}

export interface PlanFeatureItem {
  id: string;
  featureCode: string;
  displayName: string;
  isDefault: boolean;
  defaultValue: number | null;
  isActive: boolean;
}

export interface PlanPrice {
  planPricingId: string;
  planId: string;
  billingCycle: number;
  price: number;
  currency: string;
  isDefault: boolean;
  discountedPrice: number | null;
}

export interface Plan {
  id: string;
  code: string;
  name: string;
  planType: number;
  isEnterprise: boolean;
  isSelfServe: boolean;
  prices: PlanPrice[];
  features: PlanFeatureItem[];
}

export interface AdjustPlanPricingPayload {
  planPricingId: string;
  increaseOrDecreasePercentage: number;
}
