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
  CreatePodcastPayload,
  GetPodcastsParams,
  PODCAST_ENABLE_TYPE,
  PodcastListResponse,
  UpdatePodcastPayload,
} from "@/app/(secured)/podcasts/helpers/types";

export async function getPodcastsAction(payload: GetPodcastsParams) {
  return await getRequest<PodcastListResponse, GetPodcastsParams>(
    API_END_POINTS.PODCASTS,
    payload,
  );
}

export async function createPodcastAction(payload: CreatePodcastPayload) {
  try {
    const result = await postRequest<ResponseType, CreatePodcastPayload>(
      API_END_POINTS.PODCAST_CREATE,
      payload,
    );
    return result;
  } catch (error) {
    console.error("Error creating podcast:", error);
    return {
      status: false,
      message: "Failed to create podcast",
    } as ResponseType;
  }
}

export async function deletePodcastAction(podcastId: string) {
  return deleteRequest<ResponseType>(
    `${API_END_POINTS.PODCAST}/${podcastId}/delete`,
  );
}

export async function updatePodcastAction(payload: UpdatePodcastPayload) {
  return putRequest<ResponseType, UpdatePodcastPayload>(
    API_END_POINTS.PODCAST_UPDATE,
    payload,
  );
}

export async function togglePodcastActiveAction(
  podcastId: string,
  type: PODCAST_ENABLE_TYPE,
) {
  return postRequest<
    ResponseType,
    { podcastId: string; type: PODCAST_ENABLE_TYPE }
  >(API_END_POINTS.PODCAST_ENABLE, { podcastId, type });
}
