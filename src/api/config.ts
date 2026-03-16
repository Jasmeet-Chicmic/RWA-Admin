// src/api/config.ts
"use server";

import { API_END_POINTS } from "@/shared/api";
import { getRequest, postRequest, putRequest } from "@/shared/fetcher";
import { ResponseType } from "@/shared/types";

export interface CurrencyWiseConfig {
  currency: number;
  loginRewardPayout: string;
  depositBonusPercentage: string;
}

export interface ReferralRewardConfig {
  currency: number;
  rewardAmountNonWithdrawable: string | number;
  rewardAmountWithdrawable: string | number;
  betCount: number;
  minimumBetAmount: string | number;
  commissionPercentage: number | string;
}

export interface RewardConfig {
  _id: string;
  type: number;
  currencyWiseConfigs?: CurrencyWiseConfig[];
  enableChatTranslation?: boolean;
  chatTranslationLanguage?: number;
  referralTimeLimitInHours?: number;
  referralRewardConfig?: ReferralRewardConfig[];
}

// Point Rules
export interface PointRule {
  id: string;
  keyName: string;
  displayName: string;
  ruleKey: number;
  points: number;
  description: string;
  isActive: boolean;
  createdOn: string;
  modifiedOn: string;
}

export interface CreatePointRulePayload {
  keyName: string;
  displayName: string;
  ruleKey: number;
  points: number;
  description: string;
  isActive: boolean;
}

export interface UpdatePointRulePayload {
  pointRuleId: string;
  points: number;
  description: string;
  isActive: boolean;
}

export interface GetConfigParams {
  type?: number;
}

export interface UpdateConfigParams {
  type: number;
  currencyWiseConfigs?: CurrencyWiseConfig[];
  enableChatTranslation?: boolean;
  chatTranslationLanguage?: number;
  referralTimeLimitInHours?: number;
  referralRewardConfig?: ReferralRewardConfig[];
}

// Get config by type
export async function getConfigAction(params: GetConfigParams = {}) {
  return await getRequest<
    ResponseType & { data: RewardConfig },
    GetConfigParams
  >(API_END_POINTS.CONFIG, params);
}

// Get all point rules
export async function getPointRulesAction() {
  return await getRequest<ResponseType & { data: PointRule[] }>(
    API_END_POINTS.POINT_RULES,
  );
}

// Create point rule
export async function createPointRuleAction(payload: CreatePointRulePayload) {
  return await postRequest<
    ResponseType & { data: PointRule },
    CreatePointRulePayload
  >(API_END_POINTS.POINT_RULES, payload);
}

// Update point rule
export async function updatePointRuleAction(payload: UpdatePointRulePayload) {
  return await putRequest<
    ResponseType & { data: PointRule },
    UpdatePointRulePayload
  >(API_END_POINTS.POINT_RULES, payload);
}

// Update config
export async function updateConfigAction(params: UpdateConfigParams) {
  console.log(
    "updateConfigAction called with params:",
    JSON.stringify(params, null, 2),
  );
  try {
    const result = await putRequest<
      ResponseType & { data: RewardConfig },
      UpdateConfigParams
    >(API_END_POINTS.CONFIG, params);
    console.log("updateConfigAction result:", JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error("updateConfigAction error:", error);
    throw error;
  }
}
