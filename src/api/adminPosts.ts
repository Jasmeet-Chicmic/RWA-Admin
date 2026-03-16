"use server";

import { API_END_POINTS } from "@/shared/api";
import { getRequest, postRequest, deleteRequest } from "@/shared/fetcher";
import { ResponseType } from "@/shared/types";
import {
  PostsListResponse,
  GetPostsParams,
  BulkActionPayload,
} from "@/app/(secured)/posts/helpers/types";

export async function getAdminPostsAction(params: GetPostsParams) {
  return await getRequest<PostsListResponse, GetPostsParams>(
    API_END_POINTS.ADMIN_POSTS_TABLE,
    params,
  );
}

export async function bulkActionPostsAction(payload: BulkActionPayload) {
  return await postRequest<ResponseType, BulkActionPayload>(
    API_END_POINTS.ADMIN_POSTS_BULK_ACTION,
    payload,
  );
}

export async function deletePostsAction(payload: { postIds: string[] }) {
  return await deleteRequest<ResponseType, { postIds: string[] }>(
    API_END_POINTS.ADMIN_POSTS_DELETE,
    payload,
  );
}
