import { SORT_DIRECTION } from "@/shared/types";

export interface PostAvailableActions {
  canFeature: boolean;
  canUnfeature: boolean;
  canPromote: boolean;
  canUnpromote: boolean;
  canFlagForReview: boolean;
  canHide: boolean;
  canUnhide: boolean;
}

export interface AdminPost {
  id: string;
  title: string;
  author: string;
  authorId: string;
  isCompanyAuthor: boolean;
  description?: string | null;
  views: number;
  engagement: number;
  trust: number;
  sponsorStatus: boolean;
  reportCount: number;
  isOpenToSponsorship: boolean;
  isFeatured: boolean;
  ads: unknown | null;
  publishedAt: string | null;
  createdOn: string;
  availableActions: PostAvailableActions;
}

export interface GetPostsParams {
  skip?: number;
  limit?: number;
  searchString?: string;
  companyId?: string;
  userId?: string;
  sponsorStatus?: boolean;
  hasAds?: boolean;
  reviewFlagged?: boolean;
  sponsorAssignment?: boolean;
  featureContent?: boolean;
  sortBy?: string;
  sortDirection?: SORT_DIRECTION;
}

export interface PostsListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    items: AdminPost[];
    totalCount: number;
  };
}

export interface BulkActionPayload {
  actionType: number;
  postIds: string[];
  reason?: string;
  promotionDurationValue?: number;
  promotionDurationUnit?: number;
  targetedImpressions?: number;
  adPlacement?: number;
}

// ── Admin Bulk Action Type ──────────────────────────────────────────

export const ADMIN_BULK_ACTION_TYPE = {
  FEATURE_CONTENT: 1,
  UNFEATURE_CONTENT: 2,
  PROMOTE_CONTENT: 3,
  UNPROMOTE_CONTENT: 4,
  FLAG_FOR_REVIEW: 5,
  HIDE_CONTENT: 6,
  UNHIDE_CONTENT: 7,
} as const;

export const ADMIN_BULK_ACTION_TYPE_LABELS: Record<number, string> = {
  [ADMIN_BULK_ACTION_TYPE.FEATURE_CONTENT]: "Feature",
  [ADMIN_BULK_ACTION_TYPE.UNFEATURE_CONTENT]: "Unfeature",
  [ADMIN_BULK_ACTION_TYPE.PROMOTE_CONTENT]: "Promote",
  [ADMIN_BULK_ACTION_TYPE.UNPROMOTE_CONTENT]: "Unpromote",
  [ADMIN_BULK_ACTION_TYPE.FLAG_FOR_REVIEW]: "Flag for Review",
  [ADMIN_BULK_ACTION_TYPE.HIDE_CONTENT]: "Hide",
  [ADMIN_BULK_ACTION_TYPE.UNHIDE_CONTENT]: "Unhide",
};

// ── Promotion Duration Unit ─────────────────────────────────────────

export const PROMOTION_DURATION_UNIT = {
  DAYS: 1,
  WEEKS: 2,
  MONTHS: 3,
} as const;

export const PROMOTION_DURATION_UNIT_LABELS: Record<number, string> = {
  [PROMOTION_DURATION_UNIT.DAYS]: "Days",
  [PROMOTION_DURATION_UNIT.WEEKS]: "Weeks",
  [PROMOTION_DURATION_UNIT.MONTHS]: "Months",
};

// ── Ad Placement ────────────────────────────────────────────────────

export const AD_PLACEMENT = {
  FEED_PROMOTION: 1,
  EVENT_COMPANY_DISCOVERY: 2,
  GROUP_HIGHLIGHTS: 3,
  NEWSLETTER: 4,
} as const;

export const AD_PLACEMENT_LABELS: Record<number, string> = {
  [AD_PLACEMENT.FEED_PROMOTION]: "Feed Promotion",
  [AD_PLACEMENT.EVENT_COMPANY_DISCOVERY]: "Event/Company Discovery",
  [AD_PLACEMENT.GROUP_HIGHLIGHTS]: "Group Highlights",
  [AD_PLACEMENT.NEWSLETTER]: "Newsletter",
};

// ── Ad Budget Type ──────────────────────────────────────────────────

export const AD_BUDGET_TYPE = {
  DAILY: 1,
  TOTAL: 2,
} as const;

export const AD_BUDGET_TYPE_LABELS: Record<number, string> = {
  [AD_BUDGET_TYPE.DAILY]: "Daily",
  [AD_BUDGET_TYPE.TOTAL]: "Total",
};

// ── Boolean Filter Options ──────────────────────────────────────────

export const BOOLEAN_FILTER_OPTIONS = [
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
];
