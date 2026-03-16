export interface Video {
  id: string;
  title: string;
  description: string;
  youTubeUrl: string;
  thumbnailUrl: string;
}

export interface GetVideosParams {
  sortDirection?: number;
  skip?: number;
  limit?: number;
  searchText?: string;
}

export interface VideoListResponse {
  success: boolean;
  statusCode: number;
  data: {
    items: Video[];
    totalCount: number;
  };
  message: string;
}

export interface CreateVideoPayload {
  title: string;
  description: string;
  youTubeUrl: string;
  thumbnailUrl: string;
}

export interface UpdateVideoPayload {
  videoId: string;
  title: string;
  description: string;
  youTubeUrl: string;
  thumbnailUrl: string;
}
