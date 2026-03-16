"use server";

import { API_END_POINTS } from "@/shared/api";
import { deleteRequest, getRequest, putRequest } from "@/shared/fetcher";
import { ResponseType, Role, RoleFeature } from "@/shared/types";

export async function getRolesAction() {
  return await getRequest<
    ResponseType & {
      data: Role[];
    },
    never
  >(API_END_POINTS.ROLES, undefined as never);
}

export async function getRoleFeaturesAction(roleId: string) {
  return await getRequest<
    ResponseType & {
      data: RoleFeature[];
    },
    never
  >(`${API_END_POINTS.ROLE_FEATURES}/${roleId}/features`, undefined as never);
}

export interface UpdateRoleFeatureItem {
  featureId: string;
  featureCode: string;
  value: number | null;
}

export async function updateRoleFeaturesAction(
  roleId: string,
  payload: UpdateRoleFeatureItem[],
) {
  return await putRequest<ResponseType, UpdateRoleFeatureItem[]>(
    `${API_END_POINTS.ROLE_FEATURES}/${roleId}/features`,
    payload,
  );
}

export async function deleteRoleFeatureAction(
  roleId: string,
  featureId: string,
) {
  return await deleteRequest<
    ResponseType,
    { featureIds: string[] },
    ResponseType
  >(`${API_END_POINTS.ROLE_FEATURES}/${roleId}/features`, {
    featureIds: [featureId],
  });
}
