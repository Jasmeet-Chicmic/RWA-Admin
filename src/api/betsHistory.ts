"use server";

import { API_END_POINTS } from "@/shared/api";
import { getRequest } from "@/shared/fetcher";
import { ResponseType, SORT_DIRECTION } from "@/shared/types";

export interface BetUser {
  _id: string;
  wallet: string;
  name: string;
}

export interface BetHistory {
  _id: string;
  type: number;
  betAmount: number;
  currency: number;
  createdAt: string;
  gameFinishAt?: string;
  gameResult?: number;
  rewardAmount?: number;
  user: BetUser;
  rewardMultiplier?: number;
}

interface GetBetsHistoryParams {
  searchString?: string;
  skip?: number;
  limit?: number;
  sortKey?: string;
  sortDirection?: SORT_DIRECTION;
  type?: number;
  currency?: number;
  gameResult?: number;
  fromDate?: string;
  toDate?: string;
}

export async function getBetsHistoryAction(params: GetBetsHistoryParams) {
  return await getRequest<
    ResponseType & { data: { data: BetHistory[]; count: number } },
    GetBetsHistoryParams
  >(API_END_POINTS.BETS_HISTORY, {
    ...(params.searchString && { searchString: params.searchString }),
    ...(params.skip && { skip: params.skip }),
    ...(params.limit && { limit: params.limit }),
    ...(params.sortKey && {
      sortKey: params.sortKey,
      sortDirection: params.sortDirection,
    }),
    ...(params.type && { type: params.type }),
    ...(params.currency && { currency: params.currency }),
    ...(params.gameResult && { gameResult: params.gameResult }),
    ...(params.fromDate && { fromDate: params.fromDate }),
    ...(params.toDate && { toDate: params.toDate }),
  });
}

export async function getBigBetsHistoryAction(params: GetBetsHistoryParams) {
  return await getRequest<
    ResponseType & { data: { data: BetHistory[]; count: number } },
    GetBetsHistoryParams
  >(API_END_POINTS.BIG_BETS_HISTORY, {
    ...(params.searchString && { searchString: params.searchString }),
    ...(params.skip && { skip: params.skip }),
    ...(params.limit && { limit: params.limit }),
    ...(params.sortKey && {
      sortKey: params.sortKey,
      sortDirection: params.sortDirection,
    }),
    ...(params.type && { type: params.type }),
    ...(params.currency && { currency: params.currency }),
    ...(params.gameResult && { gameResult: params.gameResult }),
    ...(params.fromDate && { fromDate: params.fromDate }),
    ...(params.toDate && { toDate: params.toDate }),
  });
}
