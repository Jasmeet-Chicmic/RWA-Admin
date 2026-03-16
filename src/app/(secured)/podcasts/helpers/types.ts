export interface PodcastCreator {
  id: string;
  name: string;
  jobTitle: string;
  companyName: string;
  bio: string;
  userProfilePicture: string;
  userCoverPicture: string | null;
  connectionCount: number;
  levelOfSeniority: number;
  otherSeniorityDescription: string;
}

export interface Podcast {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  mediaUrl: string;
  isDraft: boolean;
  isActive: boolean;
  scheduledAt: string | null;
  createdByUser: PodcastCreator;
}

export interface GetPodcastsParams {
  pageNumber: number;
  pageSize: number;
  searchText?: string;
}

export interface PodcastListResponse {
  success: boolean;
  statusCode: number;
  data: {
    data: Podcast[];
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
    page: number;
    per_page: number;
    totalViewersCount: number | null;
    totalFollowersViewersCount: number | null;
  };
  message: string;
}

export interface CreatePodcastPayload {
  title?: string;
  description?: string;
  mediaUrl: string;
}

export interface UpdatePodcastPayload {
  podcastId: string;
  title?: string;
  description?: string;
  mediaUrl?: string;
}

export enum PODCAST_ENABLE_TYPE {
  Enable = 0,
  Disable = 1,
}
