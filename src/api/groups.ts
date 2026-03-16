"use server";

import { API_END_POINTS } from "@/shared/api";
import {
  AdminGroupDetail,
  GetGroupsParams,
  GetInactiveGroupsParams,
  GroupsListResponse,
  InactiveGroupsResponse,
} from "@/app/(secured)/groups/helpers/types";

export async function getGroupsListAction(params: GetGroupsParams) {
  const { getRequest } = await import("@/shared/fetcher");
  return await getRequest<GroupsListResponse, GetGroupsParams>(
    API_END_POINTS.GROUPS,
    params,
  );
}

export async function getInactiveGroupsAction(
  params?: GetInactiveGroupsParams,
) {
  const { getRequest } = await import("@/shared/fetcher");
  return await getRequest<InactiveGroupsResponse, GetInactiveGroupsParams>(
    API_END_POINTS.GROUPS_INACTIVE,
    params,
  );
}

export async function sendInactiveGroupAlertAction(groupId: string) {
  const { postRequest } = await import("@/shared/fetcher");
  return await postRequest<
    {
      statusCode: number;
      status: boolean;
      message: string;
    },
    undefined
  >(
    `${API_END_POINTS.GROUPS_ALERT_INACTIVE}/${groupId}/alert-inactive`,
    undefined,
  );
}

export async function getGroupsAction(params: GetGroupsParams) {
  const { getRequest } = await import("@/shared/fetcher");
  return await getRequest<GroupsListResponse, GetGroupsParams>(
    API_END_POINTS.GROUPS,
    params,
  );
}

export async function deleteGroupsAction(body: { groupIds: string[] }) {
  const { deleteRequest } = await import("@/shared/fetcher");
  return await deleteRequest(API_END_POINTS.GROUPS, body);
}

export async function getGroupDetailAction(groupId: string) {
  const { getRequest } = await import("@/shared/fetcher");
  return await getRequest<
    {
      statusCode: number;
      status: boolean;
      message: string;
      type: string;
      data: AdminGroupDetail;
    },
    undefined
  >(`${API_END_POINTS.GROUPS}/${groupId}`, undefined);
}

export async function toggleGroupStatusAction(params: {
  groupId: string;
  isFlagged: boolean;
  reassignedToUserId: string | null;
}) {
  const { putRequest } = await import("@/shared/fetcher");
  return await putRequest(
    `${API_END_POINTS.GROUPS_STATUS}/${params.groupId}/status`,
    {
      isFlagged: params.isFlagged,
      reassignedToUserId: params.reassignedToUserId,
    },
  );
}
