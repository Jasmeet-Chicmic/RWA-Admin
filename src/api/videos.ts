"use server";

import { API_END_POINTS } from "@/shared/api";
import {
  deleteRequest,
  getRequest,
  postRequest,
  putRequest,
} from "@/shared/fetcher";
import { ResponseType } from "@/shared/types";
import {
  CreateVideoPayload,
  GetVideosParams,
  UpdateVideoPayload,
  VideoListResponse,
} from "@/app/(secured)/videos/helpers/types";

export async function getVideosAction(payload: GetVideosParams) {
  return await getRequest<VideoListResponse, GetVideosParams>(
    API_END_POINTS.VIDEOS,
    payload,
  );
}

export async function createVideoAction(payload: CreateVideoPayload) {
  try {
    const result = await postRequest<ResponseType, CreateVideoPayload>(
      API_END_POINTS.VIDEOS,
      payload,
    );
    return result;
  } catch (error) {
    console.error("Error creating video:", error);
    return {
      status: false,
      message: "Failed to create video",
    } as ResponseType;
  }
}

export async function updateVideoAction(payload: UpdateVideoPayload) {
  return putRequest<ResponseType, UpdateVideoPayload>(
    API_END_POINTS.VIDEOS,
    payload,
  );
}

export async function deleteVideoAction(videoId: string) {
  return deleteRequest<ResponseType>(`${API_END_POINTS.VIDEOS}/${videoId}`);
}
