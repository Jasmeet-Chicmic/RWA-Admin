"use server";

import { AddUserFormValues } from "@/app/(secured)/users/list/AddUserSidebar";
import { API_END_POINTS } from "@/shared/api";
import { SUBSCRIPTION_PURCHASE_TYPE } from "@/shared/constants";
import {
  deleteRequest,
  getRequest,
  postRequest,
  putRequest,
  patchRequest,
} from "@/shared/fetcher";
import {
  GetParamsType,
  PaginatedDataType,
  Replace,
  ResponseType,
  Role,
  User,
  UserDetail,
  UserFeature,
} from "@/shared/types";
import type {
  GetReportedUsersParams,
  ReportedUsersResponse,
} from "@/app/(secured)/users/reported/helpers/types";
import { RevenuePerGameItem } from "./dashboard";

export async function suspendUserAction(payload: {
  userId: string;
  isSuspended: boolean;
}) {
  return await putRequest<
    ResponseType,
    {
      userId: string;
      isSuspended: boolean;
    }
  >(API_END_POINTS.USER, payload);
}
export async function updateUserAction(
  payload: Omit<User, "_id"> & {
    userId: string;
  },
) {
  return await putRequest<
    ResponseType,
    Omit<User, "_id"> & {
      userId: string;
    }
  >(API_END_POINTS.USER, payload);
}
export async function updateUserNotification(payload: { userId: string }) {
  return await putRequest<
    ResponseType,
    {
      userId: string;
    }
  >(API_END_POINTS.USER, payload);
}
export async function updateUserConnection(payload: { userId: string }) {
  return await putRequest<
    ResponseType,
    {
      userId: string;
    }
  >(API_END_POINTS.USER, payload);
}

export async function deleteUserAction(payload: { userIds: string[] }) {
  return await deleteRequest<
    ResponseType,
    {
      userIds: string[];
    }
  >(API_END_POINTS.USER, payload);
}

export async function deleteProjectAction(payload: {
  projectIds: string[];
  userId: string;
}) {
  return await deleteRequest<
    ResponseType,
    {
      projectIds: string[];
      userId: string;
    }
  >(API_END_POINTS.PROJECTS, payload);
}
export async function addUserAction(
  payload: Replace<AddUserFormValues, "contactNumber", string> & {
    phoneCode: string;
  },
) {
  return await postRequest<
    ResponseType,
    Replace<AddUserFormValues, "contactNumber", string> & {
      phoneCode: string;
    }
  >(API_END_POINTS.USER, payload);
}
export async function updateUserPasswordAction(payload: {
  userId: string;
  password: string;
}) {
  return await putRequest<
    ResponseType,
    {
      userId: string;
      password: string;
    }
  >(API_END_POINTS.USER, payload);
}
export async function getUsersAction(payload: GetParamsType) {
  return await getRequest<ResponseType, GetParamsType>(
    API_END_POINTS.USER,
    payload,
  );
}

export async function upgradeUserPlanAction(payload: {
  userId: string;
  subscriptionPlanId: string;
  subscriptionPurchaseType: SUBSCRIPTION_PURCHASE_TYPE;
}) {
  return await postRequest<
    ResponseType,
    {
      userId: string;
      subscriptionPlanId: string;
      subscriptionPurchaseType: SUBSCRIPTION_PURCHASE_TYPE;
    }
  >(API_END_POINTS.UPGRADE_USER_PLAN, payload);
}

export async function cancelUserSubscriptionAction(payload: {
  userId: string;
}) {
  return await putRequest<ResponseType, { userId: string }>(
    API_END_POINTS.CANCEL_USER_SUBSCRIPTION,
    payload,
  );
}

export async function logoutUserAction(payload: { userId: string }) {
  return await postRequest<ResponseType, { userId: string }>(
    API_END_POINTS.LOGOUT_USER,
    payload,
  );
}

export async function blockUserAction(payload: {
  userId: string;
  status: number;
}) {
  return await putRequest<
    ResponseType,
    {
      userId: string;
      status: number;
    }
  >(API_END_POINTS.USER_UPDATE, payload);
}

export async function fetchUserRevenuePerGameAction(params: {
  userId: string;
  currency: number;
  fromDate?: string;
  toDate?: string;
}) {
  console.log("params<><><><><><>", params);
  return await getRequest<
    ResponseType & { data: { revenuePerGame: RevenuePerGameItem[] } },
    {
      userId: string;
      currency: number;
      fromDate?: string;
      toDate?: string;
    }
  >(API_END_POINTS.REVENUE_PER_GAME, params);
}

export async function fetchUserGamesPlayedAction(params: {
  userId: string;
  // currency: number;
  fromDate?: string;
  toDate?: string;
}) {
  console.log("fetchUserGamesPlayedAction ::", params);
  return await getRequest<
    ResponseType & {
      data: { result: { date: string; activeUsers: number }[] };
    },
    {
      userId: string;
      fromDate?: string;
      toDate?: string;
    }
  >(API_END_POINTS.GAME_PLAYED, params);
}

export async function toggleUserStatusAction(payload: {
  userId: string;
  isActive: boolean;
}) {
  return await patchRequest<ResponseType & { result: string }, never>(
    `${API_END_POINTS.USER_TOGGLE_STATUS}/${payload.userId}/toggle-status?isActive=${payload.isActive}`,
    undefined as never,
  );
}

export async function toggleAdminBadgeAction(payload: {
  userId: string;
  assign: boolean;
}) {
  return await patchRequest<ResponseType & { result: string }, never>(
    `${API_END_POINTS.USER}/${payload.userId}/assign-badge?assign=${payload.assign}`,
    undefined as never,
  );
}

export async function toggleUserSpotlightAction(payload: {
  userId: string;
  isSpotlighted: boolean;
}) {
  return await patchRequest<ResponseType & { result: string }, never>(
    `${API_END_POINTS.USER_TOGGLE_SPOTLIGHT}/${payload.userId}/toggle-spotlight?isSpotlighted=${payload.isSpotlighted}`,
    undefined as never,
  );
}

export async function getUserByIdAction(userId: string) {
  return await getRequest<
    ResponseType & {
      data: UserDetail;
    },
    never
  >(`${API_END_POINTS.USER_BY_ID}/${userId}`, undefined as never);
}

export async function getRolesAction() {
  return await getRequest<
    ResponseType & {
      data: Role[];
    },
    never
  >(API_END_POINTS.ROLES, undefined as never);
}

export async function assignRoleAction(payload: {
  userId: string;
  roleIds: string[];
}) {
  return await postRequest<ResponseType, { userId: string; roleIds: string[] }>(
    API_END_POINTS.ASSIGN_ROLE,
    payload,
  );
}

export async function getUserFeaturesAction(
  userId: string,
  skip: number = 0,
  limit: number = 10,
  searchText: string = "",
) {
  return await getRequest<
    ResponseType & { data: PaginatedDataType<UserFeature> },
    { skip: number; limit: number; searchText: string }
  >(`${API_END_POINTS.USER_FEATURES}/${userId}`, { skip, limit, searchText });
}

export async function toggleUserMarketingSubscriptionAction(payload: {
  userId: string;
  subscribe: boolean;
}) {
  return await postRequest<
    ResponseType & { data: string },
    { userId: string; subscribe: boolean }
  >(API_END_POINTS.MARKETING_SUBSCRIPTION, payload);
}

export interface UpdateRoleFeaturePayload {
  userId: string;
  features: { featureId: string; value: number | null }[];
}

export async function updateRoleFeatureAction(
  payload: UpdateRoleFeaturePayload,
) {
  return await putRequest<ResponseType, UpdateRoleFeaturePayload>(
    API_END_POINTS.UPDATE_ROLE_FEATURE,
    payload,
  );
}

export async function getReportedUsersAction(payload: GetReportedUsersParams) {
  return await getRequest<ReportedUsersResponse, GetReportedUsersParams>(
    API_END_POINTS.REPORTED_USERS,
    payload,
  );
}

export async function addUserToSpotlightAction(payload: {
  userId: string;
  isSpotlighted: boolean;
  spotlightDescription?: string | null;
}) {
  return await postRequest<
    ResponseType,
    {
      userId: string;
      isSpotlighted: boolean;
      spotlightDescription?: string | null;
    }
  >(API_END_POINTS.USER_SPOTLIGHT_STATUS, payload);
}
