"use server";

import { API_END_POINTS } from "@/shared/api";
import {
  deleteRequest,
  getRequest,
  postRequest,
  putRequest,
} from "@/shared/fetcher";
import { GetParamsType, PromoCode, ResponseType } from "@/shared/types";

export interface AdminPromoCode {
  id: string;
  code: string;
  description: string;
  discountType: number;
  discountValue: number;
  currency: string;
  duration: number;
  durationInMonths: number | null;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  maxRedemptions: number;
  redemptionCount: number;
}

export interface AdminPromoCodeRedeemedUser {
  userId: string;
  userName: string;
  email: string;
  usedAt: string;
  stripeSubscriptionId: string | null;
}

export interface AdminPromoCodeDetails extends AdminPromoCode {
  users: AdminPromoCodeRedeemedUser[];
  promoCodeType?: number;
  minimumPurchaseAmount?: number | null;
  applyToMonthly?: boolean | null;
  applyToYearly?: boolean | null;
  allowedPlanIds?: string[];
}

export type AdminCreatePromoPayload = {
  code: string;
  description: string;
  discountType: number;
  discountValue: number;
  currency: string;
  duration: number;
  durationInMonths: number;
  validFrom: string;
  validUntil: string | null;
  maxRedemptions: number;
};

export type AdminUpdatePromoPayload = {
  id: string;
  description: string;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
};

export async function createAdminPromoCodeAction(
  payload: AdminCreatePromoPayload,
) {
  return await postRequest<
    {
      success: boolean;
      statusCode: number;
      data: AdminPromoCode;
      message: string;
    },
    AdminCreatePromoPayload
  >(API_END_POINTS.PROMO_CODES_ADMIN, payload);
}

export async function updateAdminPromoCodeAction(
  payload: AdminUpdatePromoPayload,
) {
  return await putRequest<
    {
      success: boolean;
      statusCode: number;
      data: AdminPromoCode;
      message: string;
    },
    AdminUpdatePromoPayload
  >(API_END_POINTS.PROMO_CODES_ADMIN, payload);
}

export async function deleteAdminPromoCodeAction(id: string) {
  return await deleteRequest<
    { success: boolean; statusCode: number; data: null; message: string },
    undefined
  >(`${API_END_POINTS.PROMO_CODES_ADMIN}/${id}`);
}

export async function getPromoCodeAction(
  payload: {
    promotionalCodeId?: string;
  } & GetParamsType,
) {
  return await getRequest<
    ResponseType & { data: { data: PromoCode[] } },
    { promotionalCodeId?: string } & GetParamsType
  >(API_END_POINTS.PROMO_CODES, payload);
}

export interface GetAdminPromoCodesParams {
  searchText?: string;
  skip?: number;
  limit?: number;
  sortKey?: string;
  sortDirection?: string;
}

// New admin list API for promo codes
export async function getAdminPromoCodesAction(
  params: GetAdminPromoCodesParams = {},
) {
  return await getRequest<
    {
      success: boolean;
      statusCode: number;
      data: { promoCodes: AdminPromoCode[] };
      message: string;
    },
    GetAdminPromoCodesParams
  >(API_END_POINTS.PROMO_CODES_ADMIN, params);
}

export async function getAdminPromoCodeByIdAction(id: string) {
  return await getRequest<
    ResponseType & { data: AdminPromoCodeDetails },
    undefined
  >(`${API_END_POINTS.PROMO_CODES_ADMIN}/${id}`);
}

export async function assignPromoCodeAction(payload: {
  promotionalCodeId: string;
  userId: string;
}) {
  return await postRequest<
    ResponseType,
    { promotionalCodeId: string; userId: string }
  >(API_END_POINTS.USER_PROMO_CODES, payload);
}

export async function unassignPromoCodeAction(payload: {
  userPromotionCodeIds: string[];
}) {
  return await deleteRequest<ResponseType, { userPromotionCodeIds: string[] }>(
    API_END_POINTS.USER_PROMO_CODES,
    payload,
  );
}
