"use server";

import { API_END_POINTS } from "@/shared/api";
import { getRequest, putRequest } from "@/shared/fetcher";
import { ResponseType } from "@/shared/types";
import {
  DecideKycReviewPayload,
  KycReviewDetail,
  KycReviewListParams,
  KycReviewListResponse,
} from "./adminKyc.types";

export async function getKycReviewQueueAction(params: KycReviewListParams) {
  return await getRequest<KycReviewListResponse, KycReviewListParams>(
    API_END_POINTS.ADMIN_KYC_REVIEW_LIST,
    params,
  );
}

export async function getKycReviewDetailAction(kycVerificationId: string) {
  return await getRequest<KycReviewDetail, { kycVerificationId: string }>(
    API_END_POINTS.ADMIN_KYC_REVIEW_DETAIL,
    { kycVerificationId },
  );
}

export async function decideKycReviewAction(payload: DecideKycReviewPayload) {
  return await putRequest<ResponseType, DecideKycReviewPayload>(
    API_END_POINTS.ADMIN_KYC_REVIEW_DECIDE,
    payload,
  );
}
