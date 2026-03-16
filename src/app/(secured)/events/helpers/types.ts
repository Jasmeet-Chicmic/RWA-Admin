export interface AdminEvent {
  id: string;
  title: string;
  eventCategory: number;
  format: number;
  status: number;
  startDateTime: string;
  endDateTime: string;
  venue: string | null;
  city: string | null;
  country: string | null;
  ticketType: number;
  createdOn: string;
  isActive: boolean;
}

export interface GetEventsParams {
  pageNumber?: number;
  pageSize?: number;
  searchText?: string;
  userId?: string;
  status?: number;
  eventCategory?: number;
  format?: number;
  ticketType?: number;
  startDateFrom?: string;
  startDateTo?: string;
  sortBy?: string;
  sortDirection?: string;
}

export interface EventsListResponse {
  statusCode: number;
  status: boolean;
  message: string;
  type: string;
  data: AdminEvent[];
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  page: number;
  per_page: number;
}

// ── Enum constants ──────────────────────────────────────────

export const EVENT_CATEGORY = {
  LEADERSHIP: 0,
  NETWORKING: 1,
  WORKSHOP: 2,
  CONFERENCE: 3,
  SOCIAL: 4,
} as const;

export const EVENT_CATEGORY_LABELS: Record<number, string> = {
  [EVENT_CATEGORY.LEADERSHIP]: "Leadership",
  [EVENT_CATEGORY.NETWORKING]: "Networking",
  [EVENT_CATEGORY.WORKSHOP]: "Workshop",
  [EVENT_CATEGORY.CONFERENCE]: "Conference",
  [EVENT_CATEGORY.SOCIAL]: "Social",
};

export const EVENT_FORMAT = {
  IN_PERSON: 0,
  ONLINE: 1,
  HYBRID: 2,
} as const;

export const EVENT_FORMAT_LABELS: Record<number, string> = {
  [EVENT_FORMAT.IN_PERSON]: "In Person",
  [EVENT_FORMAT.ONLINE]: "Online",
  [EVENT_FORMAT.HYBRID]: "Hybrid",
};

export const EVENT_STATUS = {
  DRAFT: 0,
  ONGOING: 1,
  PUBLISHED: 2,
} as const;

export const EVENT_STATUS_LABELS: Record<number, string> = {
  [EVENT_STATUS.DRAFT]: "Draft",
  [EVENT_STATUS.ONGOING]: "Unpublished",
  [EVENT_STATUS.PUBLISHED]: "Published",
};

export const TICKET_TYPE = {
  FREE: 0,
  PAID: 1,
} as const;

export const TICKET_TYPE_LABEL_KEYS: Record<number, string> = {
  [TICKET_TYPE.FREE]: "Ticket Type Free",
  [TICKET_TYPE.PAID]: "Ticket Type Paid",
};

// ── Detail view types ─────────────────────────────────────────

export interface EventParticipant {
  userId: string;
  name: string;
  email: string;
  jobTitle: string;
  companyName: string;
  userProfilePicture: string | null;
  attendeeStatus: number | null;
}

export interface EventSponsorshipRequest {
  id: string;
  eventId: string;
  requesterId: string;
  status: string;
  createdOn: string;
  requester: EventParticipant;
}

export interface AdminEventDetail {
  id: string;
  title: string;
  description: string | null;
  coverPicture: string | null;
  eventLink: string | null;
  status: number;
  eventCategory: number;
  format: number;
  ticketType: number;
  startDateTime: string;
  endDateTime: string;
  organizerId: string;
  companyId: string | null;
  groupId: string | null;
  targetAudience: string | null;
  promotionTags: string | null;
  startPrice: number | null;
  endPrice: number | null;
  timezoneId: string;
  currency: number | null;
  ageRestriction: number;
  isActive: boolean;
  createdOn: string;
  averageRating: number;
  ratingCount: number;
  interestedUsersCount: number;
  enquiryPersonUserId: string;
  isSponserDiscoverYourEvent: boolean;
  listingVisibility: number;
  reviewSponsorshipRequest: boolean;
  priceType: number | null;
  closeChat: boolean;
  sendNewMessage: boolean;
  allowNewMembers: boolean;
  venue: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  locationSummary: string | null;
  attendeesCount: number;
  joinedChatCount: number;
  attendees: EventParticipant[];
  organizersCount: number;
  organizers: EventParticipant[];
  speakersCount: number;
  speakers: EventParticipant[];
  reviewsCount: number;
  activeSponsorshipRequestCount: number;
  sponsorshipRequests: EventSponsorshipRequest[];
}
