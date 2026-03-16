"use server";

import { API_END_POINTS } from "@/shared/api";
import { getRequest, postRequest } from "@/shared/fetcher";
import {
  BroadcastChannelsResponse,
  GetBroadcastChannelsParams,
  MessagesResponse,
  GetMessagesParams,
} from "@/app/(secured)/broadcast-messages/helpers/types";
import type { ResponseType } from "@/shared/types";

export async function getBroadcastChannelsAction(
  params?: GetBroadcastChannelsParams,
) {
  return await getRequest<
    BroadcastChannelsResponse,
    GetBroadcastChannelsParams | undefined
  >(API_END_POINTS.BROADCAST_CHANNELS, params);
}

export async function getMessagesAction(params: GetMessagesParams) {
  return await getRequest<MessagesResponse, GetMessagesParams>(
    API_END_POINTS.BROADCAST_MESSAGES,
    params,
  );
}

export interface SendBroadcastMessagePayload {
  threadId: string;
  messageText: string;
  attachments?: {
    mediaUrl: string;
    latitude?: number;
    longitude?: number;
  }[];
}

export async function sendBroadcastMessageAction(
  payload: SendBroadcastMessagePayload,
) {
  return await postRequest<ResponseType, SendBroadcastMessagePayload>(
    API_END_POINTS.BROADCAST_SEND_MESSAGE,
    payload,
  );
}
