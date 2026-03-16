"use server";

import { API_END_POINTS } from "@/shared/api";
import {
  deleteRequest,
  getRequest,
  postRequest,
  putRequest,
} from "@/shared/fetcher";
import { GetParamsType, ResponseType } from "@/shared/types";

// Types
export interface ChatRoom {
  _id: string;
  name: string;
  logoURL?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChatMessage {
  _id: string;
  chatroomId: string;
  message: string;
  senderId?: string;
  senderName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Chat Room Payloads
export interface CreateChatRoomPayload {
  name: string;
  logoURL?: string;
}

export interface UpdateChatRoomPayload {
  chatRoomId: string;
  name: string;
  logoURL?: string;
}

export interface DeleteChatRoomsPayload {
  chatRoomIds: string[];
}

// Chat Message Payloads
export interface GetChatMessagesParams extends GetParamsType {
  chatroomId: string;
}

export interface UpdateChatMessagePayload {
  chatMessageId: string;
  message: string;
}

export interface DeleteChatMessagesPayload {
  chatMessageIds: string[];
}

// =====================
// CHAT ROOM API FUNCTIONS
// =====================

export async function getChatRoomsList(payload: GetParamsType) {
  return await getRequest<
    ResponseType & { data: { data: ChatRoom[]; count: number } },
    GetParamsType
  >(API_END_POINTS.CHAT_ROOMS, payload);
}

export async function createChatRoom(payload: CreateChatRoomPayload) {
  return await postRequest<ResponseType, CreateChatRoomPayload>(
    API_END_POINTS.CHAT_ROOMS,
    payload,
  );
}

export async function updateChatRoom(payload: UpdateChatRoomPayload) {
  return await putRequest<ResponseType, UpdateChatRoomPayload>(
    API_END_POINTS.CHAT_ROOMS,
    payload,
  );
}

export async function deleteChatRooms(payload: DeleteChatRoomsPayload) {
  return await deleteRequest<ResponseType, DeleteChatRoomsPayload>(
    API_END_POINTS.CHAT_ROOMS,
    payload,
  );
}

// =====================
// CHAT MESSAGE API FUNCTIONS
// =====================

export async function getChatMessages(payload: GetChatMessagesParams) {
  return await getRequest<
    ResponseType & { data: { data: ChatMessage[]; count: number } },
    GetChatMessagesParams
  >(API_END_POINTS.CHAT, payload);
}

export async function updateChatMessage(payload: UpdateChatMessagePayload) {
  return await putRequest<ResponseType, UpdateChatMessagePayload>(
    API_END_POINTS.CHAT,
    payload,
  );
}

export async function deleteChatMessages(payload: DeleteChatMessagesPayload) {
  return await deleteRequest<ResponseType, DeleteChatMessagesPayload>(
    API_END_POINTS.CHAT,
    payload,
  );
}
