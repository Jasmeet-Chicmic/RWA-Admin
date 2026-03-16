"use server";

import { API_END_POINTS } from "@/shared/api";
import { getRequest, postRequest, putRequest } from "@/shared/fetcher";
import { ResponseType, SORT_DIRECTION } from "@/shared/types";

export interface AmountLimit {
  currency: number;
  maxBetAmount: number;
  maxProfit: number;
}

export interface GameConfig {
  _id: string;
  type: number;
  name: string;
  isMaintenance: boolean;
  isEnabled: boolean;
  createdAt: string;
  amountLimit: AmountLimit[];
  profit?: number;
  icon?: string;
}

interface UpdateGameConfigParams {
  gameConfigId: string;
  name?: string;
  amountLimit?: AmountLimit[];
  isMaintenance?: boolean;
  isEnabled?: boolean;
  icon?: string;
}

interface GetGameConfigsParams {
  searchString?: string;
  skip?: number;
  limit?: number;
  sortKey?: string;
  sortDirection?: SORT_DIRECTION;
  isEnabled?: boolean;
  isMaintenance?: boolean;
  currency?: number;
}

export async function getGameConfigsAction(params: GetGameConfigsParams) {
  return await getRequest<
    ResponseType & { data: { data: GameConfig[]; count: number } },
    GetGameConfigsParams
  >(API_END_POINTS.GAME_CONFIGS, {
    ...(params.searchString && { searchString: params.searchString }),
    ...(params.skip && { skip: params.skip }),
    ...(params.limit && { limit: params.limit }),
    ...(params.sortKey && {
      sortKey: params.sortKey,
      sortDirection: params.sortDirection,
    }),
    ...(params.isEnabled !== undefined && { isEnabled: params.isEnabled }),
    ...(params.isMaintenance !== undefined && {
      isMaintenance: params.isMaintenance,
    }),
    ...(params.currency !== undefined && { currency: params.currency }),
  });
}

export async function updateGameConfigAction(
  params: UpdateGameConfigParams,
): Promise<ResponseType> {
  const res = await putRequest<ResponseType, UpdateGameConfigParams>(
    API_END_POINTS.GAME_CONFIGS,
    params,
  );
  return res;
}

export async function getGameConfigByIdAction(gameConfigId: string) {
  return await getRequest<
    ResponseType & { data: { data: GameConfig[] } },
    { gameConfigId: string }
  >(API_END_POINTS.GAME_CONFIGS, {
    gameConfigId,
  });
}

// Game Stats Types
export interface GameStatsByCurrency {
  currency: number;
  amount: number;
}

export interface GameStatsData {
  totalBetCount: number;
  totalBetAmount: GameStatsByCurrency[];
  grossGamingRevenue: GameStatsByCurrency[];
  totalUsers: number;
}

export async function getGameStatsAction(gameType: number) {
  return await getRequest<
    ResponseType & { data: GameStatsData },
    { gameType: number }
  >(API_END_POINTS.GAME_STATS, {
    gameType,
  });
}

// Upload game icon
export async function uploadGameIcon(formData: FormData) {
  try {
    const result = await postRequest<
      ResponseType & { data: { filePath: string } },
      FormData
    >(API_END_POINTS.FILE_UPLOAD, formData, {
      headers: {
        "Content-Type": undefined as unknown as string, // Remove Content-Type so axios auto-sets multipart boundary
      },
    });
    return result;
  } catch (error) {
    console.error("Error uploading game icon:", error);
    return {
      status: false,
      message: "Failed to upload game icon",
      data: { filePath: "" },
    };
  }
}
